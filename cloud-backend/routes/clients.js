const express = require("express");
const router = express.Router();
const { clientsContainer } = require("../cosmosClient");
const { v4: uuidv4 } = require("uuid");

// GET all clients
router.get("/", async (req, res) => {
  try {
    const { resources } = await clientsContainer.items
      .query("SELECT * FROM c")
      .fetchAll();

    res.json(resources);
  } catch (err) {
    console.error("GET /clients error:", err.message);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// POST new client
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "name and email are required",
      });
    }

    const client = {
      id: uuidv4(),
      name,
      email,
      phone: phone || null,
      createdAt: new Date().toISOString(),
    };

    const { resource } = await clientsContainer.items.create(client);
    res.status(201).json(resource);
  } catch (err) {
    console.error("POST /clients error:", err.message);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// DELETE client by id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    await clientsContainer.item(id, id).delete();

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /clients/:id error:", err.message);

    if (err.code === 404) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(500).json({ error: "Failed to delete client" });
  }
});

// PUT update client by id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "name and email are required",
      });
    }

    // pobierz istniejącego klienta
    const { resource: existingClient } = await clientsContainer
      .item(id, id)
      .read();

    if (!existingClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    const updatedClient = {
      ...existingClient,
      name,
      email,
      phone: phone ?? null,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await clientsContainer.items.upsert(updatedClient);

    res.status(200).json(resource);
  } catch (err) {
    console.error("PUT /clients/:id error:", err.message);
    res.status(500).json({ error: "Failed to update client" });
  }
});

module.exports = router;
