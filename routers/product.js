const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const { Category } = require("../models/Category");
const { Product } = require("../models/Product");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
  if (req.query.category) {
    //checking category id
    if (!mongoose.isValidObjectId(req.query.category)) {
      res.status(400).json({ success: false, message: "Invalid Category Id" });
    }

    // checking category
    const category = await Category.findById(req.query.category);
    if (!category) {
      res
        .status(404)
        .json({ message: "Category was not found", success: false });
    }
  }

  const categoryFilter = req.query.category
    ? { category: req.query.category }
    : {};

  const products = await Product.find(categoryFilter).populate("category");
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.json({ products, success: true });
});

router.get("/product", async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    res.status(400).json({ success: false, message: "Invalid Product Id" });
  }

  const product = await Product.findById(req.query.id).populate("category"); // select("name")
  if (!product) {
    res
      .status(404)
      .json({ message: "The product was not found", success: false });
  }
  res.status(200).json({ product, success: true });
});

router.get("/count", async (req, res) => {
  const count = await Product.countDocuments();
  if (!count) {
    res.status(500).json({
      success: false,
    });
  }
  res.json({ count, success: true });
});

router.get("/featured", async (req, res) => {
  const limit = req.query.limit ? req.query.limit : 0;
  const products = await Product.find({ isFeatured: true }).limit(
    parseInt(req.query.limit)
  );
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.json({ products, success: true });
});

router.post("/", uploadOptions.single("image"), async (req, res) => {
  //checking category id
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  // checking category
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(404).json({ message: "Category was not found", success: false });
  }

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let product = new Product({
    ...req.body,
    image: `${basePath}${file.filename}`,
  });
  try {
    product = await product.save();
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }

  if (!product) {
    res.json({ message: "Product was not created", success: false });
  }
  res.json({ product, success: true });
});

router.put("/product", async (req, res) => {
  /* //checking category id
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  // checking category
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(404).json({ message: "Category was not found", success: false });
  } */

  //checking product id
  if (!mongoose.isValidObjectId(req.query.id)) {
    res.status(400).json({ success: false, message: "Invalid Product Id" });
  }

  const product = await Product.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
  });

  if (!product) {
    res
      .status(404)
      .json({ message: "product was not updated", success: false });
  }
  res.status(200).json({ product, success: true });
});

router.put(
  "/product-galery",
  uploadOptions.array("images", 10),
  async (req, res) => {
    //checking product id
    if (!mongoose.isValidObjectId(req.query.id)) {
      res.status(400).json({ success: false, message: "Invalid Product Id" });
    }

    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.query.id,
      {
        images: imagesPaths,
      },
      {
        new: true,
      }
    );

    if (!product) {
      res
        .status(404)
        .json({ message: "product was not updated", success: false });
    }
    res.status(200).json({ product, success: true });
  }
);

router.delete("/", async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.id)) {
    res.status(400).json({ success: false, message: "Invalid Product Id" });
  }
  const product = await Product.findByIdAndDelete(req.body.id);

  if (!product) {
    res.status(404).json({ success: false, message: "product is not deleted" });
  }
  res.status(200).json({ success: true, message: "product is deleted" });
});

module.exports = router;
