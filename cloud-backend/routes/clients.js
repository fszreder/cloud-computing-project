const express = require("express");
const router = express.Router();
const { clientsContainer } = require("../cosmosClient");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const { QueueClient } = require("@azure/storage-queue");
const pdfLib = require("pdf-parse");
const axios = require("axios");

const upload = multer({ storage: multer.memoryStorage() });
const MILAN_BLACKLIST = [
  "Mike Maignan",
  "Davide Calabria",
  "Fikayo Tomori",
  "Malick Thiaw",
  "Theo Hernández",
  "Ismaël Bennacer",
  "Tijjani Reijnders",
  "Christian Pulisic",
  "Ruben Loftus-Cheek",
  "Rafael Leão",
  "Olivier Giroud",
];

// 1. GET ALL CLIENTS
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

// 1b. GET SINGLE CLIENT
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: id }],
    };

    const { resources } = await clientsContainer.items
      .query(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      console.warn(`[API] Klient o id ${id} nie istnieje w bazie.`);
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(resources[0]);
  } catch (err) {
    console.error("GET /clients/:id error:", err.message);
    res.status(500).json({ error: "Błąd serwera przy pobieraniu klienta" });
  }
});

// 2. POST NEW CLIENT
router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, isVip, isBlacklisted } =
      req.body;
    const file = req.file;
    const fullName = `${firstName} ${lastName}`.trim();
    const autoBlacklist = MILAN_BLACKLIST.some((player) =>
      fullName.toLowerCase().includes(player.toLowerCase()),
    );

    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Nieprawidłowy format zdjęcia." });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({ error: "Zdjęcie jest za duże (max 5MB)." });
      }
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const clientId = uuidv4();
    let avatarUrl = null;
    let blobName = null;

    if (file) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
      );
      const containerClient =
        blobServiceClient.getContainerClient("client-avatars");
      await containerClient.createIfNotExists({ access: "blob" });

      const avatarId = crypto.randomUUID();
      const extension = file.originalname.split(".").pop();
      blobName = `${clientId}/${avatarId}.${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer);
      await blockBlobClient.setHTTPHeaders({
        blobContentType: file.mimetype,
        blobContentDisposition: `inline; filename="${encodeURIComponent(file.originalname)}"`,
      });
      avatarUrl = blockBlobClient.url;
    }
    const client = {
      id: clientId,
      firstName,
      lastName,
      email,
      phone: phone || null,
      isVip: isVip === "true" || isVip === true,
      isBlacklisted:
        isBlacklisted === "true" || isBlacklisted === true || autoBlacklist,
      avatarUrl,
      avatarThumbnailUrl: null,
      documents: [],
      createdAt: new Date().toISOString(),
    };

    const { resource } = await clientsContainer.items.create(client);

    if (file && avatarUrl) {
      const queueClient = new QueueClient(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
        "avatar-thumbnail-queue",
      );
      const messageData = { clientId, blobPath: blobName, avatarUrl };
      const base64Message = Buffer.from(JSON.stringify(messageData)).toString(
        "base64",
      );
      await queueClient.sendMessage(base64Message);
    }

    res.status(201).json(resource);
  } catch (err) {
    console.error("POST /clients error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT UPDATE CLIENT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, isVip, isBlacklisted } =
      req.body;

    const { resource: existingClient } = await clientsContainer
      .item(id, id)
      .read();

    if (!existingClient)
      return res.status(404).json({ error: "Client not found" });

    const updatedClient = {
      ...existingClient,
      firstName,
      lastName,
      email,
      phone: phone ?? null,
      isVip: isVip === "true" || isVip === true,
      isBlacklisted: isBlacklisted === "true" || isBlacklisted === true,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await clientsContainer
      .item(id, id)
      .replace(updatedClient);

    res.json(resource);
  } catch (err) {
    console.error("PUT /clients error:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

// 4. DELETE ENTIRE CLIENT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await clientsContainer.item(id, id).delete();
    res.status(204).send();
  } catch (err) {
    console.error("Delete client error:", err.message);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// 5. POST UPLOAD DOCUMENT
router.post("/:id/documents", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    if (file.mimetype !== "application/pdf") {
      console.warn(
        `[Security] Próba wgrania niewłaściwego pliku: ${file.mimetype}`,
      );
      return res.status(400).json({
        error: "Proszę wgrać plik PDF.",
      });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient("client-files");

    const docId = crypto.randomUUID();
    const blobName = `${id}-${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer);
    await blockBlobClient.setHTTPHeaders({
      blobContentType:
        file.mimetype === "application/pdf" ? "application/pdf" : file.mimetype,
      blobContentDisposition: "inline",
    });

    const { resource: client } = await clientsContainer.item(id, id).read();
    if (!client) return res.status(404).json({ error: "Client not found" });

    const newDocument = {
      id: docId,
      name: file.originalname,
      url: blockBlobClient.url,
      blobName: blobName,
      uploadedAt: new Date().toISOString(),
    };

    client.documents = [...(client.documents || []), newDocument];
    const { resource: savedClient } = await clientsContainer
      .item(id, id)
      .replace(client);
    res.json(savedClient);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// 6. DELETE SINGLE DOCUMENT
router.delete("/:clientId/documents/:docId", async (req, res) => {
  try {
    const { clientId, docId } = req.params;

    const { resource: client } = await clientsContainer
      .item(clientId, clientId)
      .read();
    if (!client || !client.documents)
      return res.status(404).json({ error: "Not found" });

    const document = client.documents.find((d) => d.id === docId);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient("client-files");

    let blobToDelete = document.blobName;
    if (!blobToDelete) {
      const urlParts = document.url.split("/");
      blobToDelete = decodeURIComponent(urlParts[urlParts.length - 1]);
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobToDelete);
    await blockBlobClient.deleteIfExists();

    client.documents = client.documents.filter((d) => d.id !== docId);
    const { resource: savedClient } = await clientsContainer
      .item(clientId, clientId)
      .replace(client);
    res.json(savedClient);
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

//7. POST AVATAR TO EXISTING CLIENT
router.post("/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file" });

    const { resource: client } = await clientsContainer.item(id, id).read();
    if (!client) return res.status(404).json({ error: "Client not found" });

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient("client-avatars");

    const avatarId = crypto.randomUUID();
    const extension = file.originalname.split(".").pop();
    const blobName = `${id}/${avatarId}.${extension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    const updatedClient = {
      ...client,
      avatarUrl: blockBlobClient.url,
      avatarThumbnailUrl: null,
      avatarUpdatedAt: new Date().toISOString(),
    };

    const { resource: savedClient } = await clientsContainer
      .item(id, id)
      .replace(updatedClient);

    const queueClient = new QueueClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
      "avatar-thumbnail-queue",
    );
    const messageData = {
      clientId: id,
      blobPath: blobName,
      avatarUrl: blockBlobClient.url,
    };
    const base64Message = Buffer.from(JSON.stringify(messageData)).toString(
      "base64",
    );
    await queueClient.sendMessage(base64Message);

    res.json(savedClient);
  } catch (err) {
    res.status(500).json({ error: "Avatar upload failed" });
  }
});

// 8. POST podsumowanie dokumentu przez AI
router.post("/:id/documents/:docId/summarize", async (req, res) => {
  console.log(
    `[AI-DEBUG] Start: Client=${req.params.id}, Doc=${req.params.docId}`,
  );

  try {
    const { id, docId } = req.params;

    const { resource: client } = await clientsContainer.item(id, id).read();
    const document = client?.documents?.find((d) => d.id === docId);

    if (!document)
      return res.status(404).json({ error: "Dokument nie istnieje" });

    const response = await axios.get(document.url, {
      responseType: "arraybuffer",
    });
    const pdfBuffer = Buffer.from(response.data);

    let extractedText = "";
    try {
      // 2. UŻYWAMY NOWEJ ZMIENNEJ "pdfLib"
      const data = await pdfLib(pdfBuffer);
      extractedText = data.text.replace(/\s+/g, " ").trim().substring(0, 4000);
      console.log(
        `[AI-DEBUG] Wyciągnięto ${extractedText.length} znaków tekstu.`,
      );
    } catch (parseErr) {
      console.error("[AI-ERROR] Błąd pdf-parse:", parseErr.message);
      return res
        .status(500)
        .json({ error: "Serwer nie mógł odczytać treści PDF." });
    }

    if (!extractedText || extractedText.length < 5) {
      return res.status(400).json({
        error: "PDF nie posiada warstwy tekstowej (to może być skan).",
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AZURE_AI_ENDPOINT}/language/:analyze-text?api-version=2023-04-01`,
      {
        kind: "KeyPhraseExtraction",
        analysisInput: {
          documents: [{ id: "1", language: "pl", text: extractedText }],
        },
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_AI_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    const phrases = aiResponse.data.results.documents[0].keyPhrases;
    const summary =
      `Podsumowanie AI dla dokumentu: ${document.name}\n\n` +
      `Kluczowe zagadnienia: ${phrases.slice(0, 7).join(", ")}.\n\n` +
      `Początek treści: ${extractedText.substring(0, 200)}...`;

    document.summary = summary;
    await clientsContainer.item(id, id).replace(client);

    res.json({ summary });
  } catch (error) {
    console.error(
      "[AI-CRITICAL-ERROR]:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      error:
        "Błąd usługi AI: " +
        (error.response?.data?.error?.message || error.message),
    });
  }
});

router.get("/blacklist-info", (req, res) => {
  res.json(MILAN_BLACKLIST);
});

module.exports = router;
