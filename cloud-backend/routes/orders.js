const express = require("express");
const router = express.Router();
const { ordersContainer } = require("../cosmosClient");

// GET all orders
router.get("/", async (req, res) => {
  const { resources } = await ordersContainer.items
    .query("SELECT * FROM c")
    .fetchAll();

  res.json(resources);
});

// POST new order
router.post("/", async (req, res) => {
  const order = {
    id: `order-${Date.now()}`,
    ...req.body,
  };

  await ordersContainer.items.create(order);
  res.status(201).json(order);
});

module.exports = router;
