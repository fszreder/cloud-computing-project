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
    const isPdf = file.originalname.toLowerCase().endsWith(".pdf");
    const contentType = isPdf ? "application/pdf" : file.mimetype;
    await blockBlobClient.uploadData(file.buffer);
    await blockBlobClient.setHTTPHeaders({
      blobContentType:
        file.mimetype === "application/pdf" ? "application/pdf" : file.mimetype,
      blobContentDisposition: `inline; filename="${encodeURIComponent(file.originalname)}"`,
    });

    const fileUrl = blockBlobClient.url;

    const { resource: client } = await clientsContainer
      .item(clientId, clientId)
      .read();

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const newDocument = {
      id: Date.now().toString(),
      name: file.originalname,
      url: fileUrl,
      blobName: blobName,
      uploadedAt: new Date().toISOString(),
    };

    const updatedClient = {
      ...client,
      documents: [...(client.documents || []), newDocument],
      updatedAt: new Date().toISOString(),
    };

    const { resource: savedClient } = await clientsContainer
      .item(clientId, clientId)
      .replace(updatedClient);

    res.json(savedClient);
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
});

module.exports = router;
