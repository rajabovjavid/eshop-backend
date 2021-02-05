const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Category } = require("../models/Category");

router.get("/", async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    res.status(500).json({ success: false });
  }
  res.json({ categories, success: true });
});

router.get("/category", async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  const category = await Category.findById(req.query.id);

  if (!category) {
    res
      .status(404)
      .json({ message: "The category was not found", success: false });
  }
  res.status(200).send({ category, success: true });
});

router.post("/", async (req, res) => {
  let category = new Category(req.body);
  try {
    category = await category.save();
  } catch (error) {
    res.status(400).json({ error, success: false });
  }

  if (!category) {
    res
      .status(404)
      .json({ message: "category is not created", success: false });
  }
  res.json({ category, success: true });
});

router.put("/category", async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }

  const category = await Category.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
  });

  if (!category) {
    res
      .status(404)
      .json({ message: "category was not updated", success: false });
  }
  res.status(200).json({ category, success: true });
});

router.delete("/", async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.id)) {
    res.status(400).json({ success: false, message: "Invalid Category Id" });
  }
  const category = await Category.findByIdAndDelete(req.body.id);

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "category is not deleted" });
  }
  return res
    .status(200)
    .json({ success: true, message: "category is deleted" });
});

module.exports = router;
