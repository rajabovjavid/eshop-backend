const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User } = require("../models/User");

router.get(`/`, async (req, res) => {
  const users = await User.find().select("-password");

  if (!users) {
    res.status(500).json({ success: false });
  }
  res.send(users);
});

router.get("/user", async (req, res) => {
  if (!mongoose.isValidObjectId(req.query.id)) {
    res.status(400).json({ success: false, message: "Invalid User Id" });
  }

  const user = await User.findById(req.query.id).select("-password");

  if (!user) {
    res.status(404).json({ message: "The user was not found", success: false });
  }
  res.status(200).send({ user, success: true });
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

router.post("/", async (req, res) => {
  const password = bcrypt.hashSync(req.body.password, 8);
  let user = new User({ ...req.body, password });
  try {
    user = await user.save();
  } catch (error) {
    res.status(400).json({ error, success: false });
  }

  if (!user) {
    res.status(404).json({ message: "user is not created", success: false });
  }
  res.json({ user, success: true });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res
      .status(400)
      .json({ success: false, message: "email or password is wrong" });
  }

  if (bcrypt.compareSync(req.body.password, user.password)) {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      secret,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      success: true,
      message: "user is authenticated",
      user: user.email,
      token,
    });
  } else {
    res
      .status(400)
      .json({ success: false, message: "email or password is wrong" });
  }
});

router.post("/register", async (req, res) => {
  const password = bcrypt.hashSync(req.body.password, 8);
  let user = new User({ ...req.body, password });
  try {
    user = await user.save();
  } catch (error) {
    res.status(400).json({ error, success: false });
  }

  if (!user) {
    res.status(404).json({ message: "user is not created", success: false });
  }
  res.json({ user, success: true });
});

module.exports = router;
