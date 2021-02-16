const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Order } = require("../models/Order");
const { OrderItem } = require("../models/OrderItem");

router.get("/", async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        select: "name category price",
        populate: { path: "category", select: "name" },
      },
    })
    .sort("dateOrdered");

  if (!orders) {
    res.status(500).json({ success: false });
  }
  res.json({ orders, success: true });
});

router.get("/order", async (req, res) => {
  const order = await Order.findById(req.query.id)
    .populate({ path: "user", select: "name" })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        select: "name category",
        populate: { path: "category", select: "name" },
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.json({ order, success: true });
});

router.get("/total-sales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get("/count", async (req, res) => {
  const count = await Order.countDocuments();
  if (!count) {
    res.status(500).json({
      success: false,
    });
  }
  res.json({ count, success: true });
});

router.get("/user-orders", async (req, res) => {
  const userOrders = await Order.find({ user: req.query.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrders) {
    res.status(500).json({ success: false });
  }
  res.send(userOrders);
});

router.post("/", async (req, res) => {
  const orderItems = await Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem(orderItem);
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const totalPrices = await Promise.all(
    orderItems.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate({
        path: "product",
        select: "price",
      });
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({ ...req.body, orderItems, totalPrice: totalPrice });
  try {
    order = await order.save();
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }

  if (!order) {
    res.json({ message: "Order was not created", success: false });
  }
  res.json({ order, success: true });
});

router.put("/order", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.query.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order) {
    res.status(404).json({ message: "order was not updated", success: false });
  }
  res.status(200).json({ order, success: true });
});

router.delete("/", async (req, res) => {
  const order = await Order.findByIdAndDelete(req.body.id);

  if (!order) {
    res.status(404).json({ success: false, message: "order is not deleted" });
  }

  await order.orderItems.map(async (orderItem) => {
    await OrderItem.findByIdAndDelete(orderItem);
  });

  res.status(200).json({ success: true, message: "order is deleted", order });
});

module.exports = router;
