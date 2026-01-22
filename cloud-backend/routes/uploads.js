const express = require("express");
const router = express.Router();
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const { clientsContainer } = require("../cosmosClient");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:clientId/upload", upload.single("file"), async (req, res) => {
  try {
    const { clientId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );

    const containerClient =
      blobServiceClient.getContainerClient("client-files");

    const blobName = `${clientId}-${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer);

    const fileUrl = blockBlobClient.url;

    const { resource: client } = await clientsContainer
      .item(clientId, clientId)
      .read();

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const updatedClient = {
      ...client,
      documentUrl: fileUrl,
      updatedAt: new Date().toISOString(),
    };
    const { resource: savedClient } = await clientsContainer
      .item(clientId, clientId)
      .replace(updatedClient);

    res.json(savedClient);
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
