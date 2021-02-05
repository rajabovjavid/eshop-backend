const express = require("express");
const mongoose = require("mongoose");
const { Category } = require("../models/Category");
const router = express.Router();
const { Product } = require("../models/Product");

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

router.post("/", async (req, res) => {
  //checking category id
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  // checking category
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(404).json({ message: "Category was not found", success: false });
  }

  let product = new Product(req.body);
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
  //checking category id
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  // checking category
  const category = await Category.findById(req.body.category);
  if (!category) {
    res.status(404).json({ message: "Category was not found", success: false });
  }

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

router.delete("/", async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.id)) {
    res.status(400).json({ success: false, message: "Invalid Product Id" });
  }
  const product = await Product.findByIdAndDelete(req.body.id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "product is not deleted" });
  }
  return res.status(200).json({ success: true, message: "product is deleted" });
});

module.exports = router;
