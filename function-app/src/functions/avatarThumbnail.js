const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");
const { CosmosClient } = require("@azure/cosmos");
const sharp = require("sharp");
const createClient = require("@azure-rest/ai-vision-image-analysis").default;
const { AzureKeyCredential } = require("@azure/core-auth");

app.storageQueue("avatarThumbnail", {
  queueName: "avatar-thumbnail-queue",
  connection: "AzureWebJobsStorage",
  handler: async (queueItem, context) => {
    context.log("--- START PRZETWARZANIA (Z AI VISION v4.0) ---");

    const aiClient = createClient(
      (process.env.AZURE_AI_ENDPOINT || "").replace(/\/+$/, ""),
      new AzureKeyCredential(process.env.AZURE_AI_KEY || ""),
    );

    try {
      const { clientId, blobPath } = queueItem;

      if (!clientId || !blobPath) {
        throw new Error("Błędny format wiadomości: brak clientId lub blobPath");
      }

      // 1. POŁĄCZENIE ZE STORAGE
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AzureWebJobsStorage,
      );
      const avatarsContainer =
        blobServiceClient.getContainerClient("client-avatars");
      const thumbsContainer = blobServiceClient.getContainerClient(
        "client-avatar-thumbnails",
      );

      // 2. POBIERANIE ORYGINAŁU
      const sourceBlob = avatarsContainer.getBlockBlobClient(blobPath);
      const downloadResponse = await sourceBlob.download(0);

      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // 3. ANALIZA AI VISION
      context.log("Wysyłanie do Azure AI Vision...");
      let aiCaption = "Brak opisu";
      try {
        const analysis = await aiClient.path("/imageanalysis:analyze").post({
          body: buffer,
          queryParameters: {
            features: ["caption"],
            language: "en",
            "api-version": "2023-10-01",
          },
          contentType: "application/octet-stream",
        });

        context.log("RAW AI Response Status:", analysis.status);

        if (analysis.status === "200") {
          aiCaption =
            analysis.body.captionResult?.text || "AI nie znalazło opisu";
          context.log(`AI rozpoznało: ${aiCaption}`);
        } else {
          context.error(
            `AI Error (${analysis.status}):`,
            JSON.stringify(analysis.body),
          );
          aiCaption = `Błąd AI (Status: ${analysis.status})`;
        }
      } catch (aiErr) {
        context.error("Krytyczny błąd wywołania AI:", aiErr.message);
        aiCaption = "Błąd połączenia z AI";
      }

      // 4. GENEROWANIE MINIATURY
      context.log("Generowanie miniatury przez sharp...");
      const thumbBuffer = await sharp(buffer)
        .resize(128, 128, { fit: "cover" })
        .toBuffer();

      // 5. ZAPIS DO STORAGE
      const thumbBlobName = `${clientId}/thumb.jpg`;
      const thumbBlobClient = thumbsContainer.getBlockBlobClient(thumbBlobName);
      await thumbBlobClient.uploadData(thumbBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" },
      });

      // 6. AKTUALIZACJA COSMOS DB
      const cosmosClient = new CosmosClient(
        process.env.COSMOS_CONNECTION_STRING,
      );
      const dbId = "ServiceManagementDB";
      const containerId = "Clients";
      const container = cosmosClient.database(dbId).container(containerId);

      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: clientId }],
      };

      const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();

      if (items.length === 0) {
        context.error(`[ALARM] Nie znaleziono klienta ${clientId} w bazie!`);
        return;
      }

      const client = items[0];
      client.avatarThumbnailUrl = thumbBlobClient.url;
      client.thumbnailUpdatedAt = new Date().toISOString();
      client.aiDescription = aiCaption;

      context.log("Wysyłanie zaktualizowanego dokumentu do Cosmos DB...");
      await container.item(clientId, clientId).replace(client);

      context.log("--- SUKCES: MINIATURA I OPIS AI ZAPISANE ---");
    } catch (error) {
      context.error("--- KRYTYCZNY BŁĄD FUNKCJI ---");
      context.error(`Wiadomość: ${error.message}`);
      throw error;
    }
  },
});
