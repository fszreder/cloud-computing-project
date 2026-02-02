const express = require("express");
const router = express.Router();
const { clientsContainer } = require("../cosmosClient");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");

const upload = multer({ storage: multer.memoryStorage() });
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
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "first name, last name, and email are required",
      });
    }

    const client = {
      id: uuidv4(),
      firstName,
      lastName,
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
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "firstName, lastName and email are required",
      });
    }

    const { resource: existingClient } = await clientsContainer
      .item(id, id)
      .read();

    if (!existingClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    const updatedClient = {
      ...existingClient,
      firstName,
      lastName,
      email,
      phone: phone ?? null,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await clientsContainer
      .item(id, id)
      .replace(updatedClient);

    res.status(200).json(resource);
  } catch (err) {
    console.error("PUT /clients/:id error:", err.message);
    res.status(500).json({ error: "Failed to update client" });
  }
});

router.post("/:id/documents", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );

    const containerClient =
      blobServiceClient.getContainerClient("client-files");

    const docId = crypto.randomUUID();
    const blobName = `${id}/${docId}-${file.originalname}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer);

    const fileUrl = blockBlobClient.url;

    const { resource: client } = await clientsContainer.item(id, id).read();

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const newDocument = {
      id: docId,
      name: file.originalname,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    client.documents = [...(client.documents || []), newDocument];

    const { resource: savedClient } = await clientsContainer
      .item(id, id)
      .replace(client);

    return res.json(savedClient);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

router.delete("/:id/documents/:docId", async (req, res) => {
  try {
    const { id, docId } = req.params;

    const { resource: client } = await clientsContainer.item(id, id).read();

    if (!client || !client.documents) {
      return res.status(404).json({ error: "Client or document not found" });
    }

    const document = client.documents.find((d) => d.id === docId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );

    const containerClient =
      blobServiceClient.getContainerClient("client-files");

    const blobPath = new URL(document.url).pathname.replace(/^\/[^/]+\//, "");
    await containerClient.deleteBlob(blobPath);

    client.documents = client.documents.filter((d) => d.id !== docId);

    const { resource: savedClient } = await clientsContainer
      .item(id, id)
      .replace(client);

    return res.json(savedClient);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
});

// UPLOAD / UPDATE CLIENT AVATAR
router.post("/:id/avatar", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "File must be an image" });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );

    const containerClient =
      blobServiceClient.getContainerClient("client-avatars");

    const { resource: client } = await clientsContainer.item(id, id).read();

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // 🔥 usuń stare zdjęcie, jeśli istnieje
    if (client.avatarUrl) {
      try {
        const oldBlobPath = new URL(client.avatarUrl).pathname.replace(
          /^\/[^/]+\//,
          "",
        );
        await containerClient.deleteBlob(oldBlobPath);
      } catch (e) {
        console.warn("Failed to delete old avatar:", e.message);
      }
    }

    const avatarId = crypto.randomUUID();
    const extension = file.originalname.split(".").pop();
    const blobName = `${id}/${avatarId}.${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    const avatarUrl = blockBlobClient.url;

    const updatedClient = {
      ...client,
      avatarUrl,
      avatarUpdatedAt: new Date().toISOString(),
    };

    const { resource: savedClient } = await clientsContainer
      .item(id, id)
      .replace(updatedClient);

    // ⏭️ TU W PRZYSZŁOŚCI:
    // - wrzucisz message do Azure Queue
    // - z payloadem { clientId, avatarUrl }

    return res.json(savedClient);
  } catch (err) {
    console.error("Avatar upload error:", err.message);
    return res.status(500).json({ error: "Avatar upload failed" });
  }
});

module.exports = router;
