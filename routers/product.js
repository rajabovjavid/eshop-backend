const express = require("express");
const router = express.Router();

const {Product} = require("../models/Product");

router.get("/", async (req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

router.post("/", (req, res) => {
  const product = new Product(req.body);
  product
    .save()
    .then((newProduct) => {
      res.status(201).json(newProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

module.exports = router;
