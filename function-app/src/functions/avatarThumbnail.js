const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");
const { CosmosClient } = require("@azure/cosmos");
const sharp = require("sharp");

app.storageQueue("avatarThumbnail", {
  queueName: "avatar-thumbnail-queue",
  connection: "AzureWebJobsStorage",
  handler: async (queueItem, context) => {
    context.log("--- START PRZETWARZANIA ---");
    context.log("Odebrana wiadomość:", JSON.stringify(queueItem));

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

      // 2. POBIERANIE I GENEROWANIE MINIATURY
      context.log(`Pobieranie oryginału: ${blobPath}...`);
      const sourceBlob = avatarsContainer.getBlockBlobClient(blobPath);
      const downloadResponse = await sourceBlob.download(0);

      const chunks = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      context.log("Generowanie miniatury przez sharp...");
      const thumbBuffer = await sharp(buffer)
        .resize(128, 128, { fit: "cover" })
        .toBuffer();

      // 3. ZAPIS DO STORAGE
      const thumbBlobName = `${clientId}/thumb.jpg`;
      const thumbBlobClient = thumbsContainer.getBlockBlobClient(thumbBlobName);
      await thumbBlobClient.uploadData(thumbBuffer, {
        blobHTTPHeaders: { blobContentType: "image/jpeg" },
      });
      context.log(`Miniatura zapisana w Blob pod: ${thumbBlobClient.url}`);

      // 4. AKTUALIZACJA COSMOS DB
      context.log("Inicjalizacja klienta Cosmos DB...");
      const cosmosClient = new CosmosClient(
        process.env.COSMOS_CONNECTION_STRING,
      );

      // KLUCZOWA ZMIANA: Poprawne nazwy z Twojego Portalu
      const dbId = "ServiceManagementDB";
      const containerId = "Clients"; // Upewnij się, że w portalu to też 'clients'!

      const container = cosmosClient.database(dbId).container(containerId);

      context.log(`Szukanie klienta przez SQL Query dla ID: ${clientId}...`);

      // Używamy SQL Query, żeby ominąć ewentualne problemy z Partition Key
      const querySpec = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: clientId }],
      };

      const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();

      if (items.length === 0) {
        context.error(`[ALARM] SQL Query nie znalazło dokumentu!`);
        context.error(
          `Baza: ${dbId}, Kontener: ${containerId}, Szukane ID: ${clientId}`,
        );
        return;
      }

      const client = items[0];
      context.log(
        `Znaleziono klienta: ${client.firstName} ${client.lastName}.`,
      );

      // Aktualizacja pól
      client.avatarThumbnailUrl = thumbBlobClient.url;
      client.thumbnailUpdatedAt = new Date().toISOString();

      context.log("Wysyłanie zaktualizowanego dokumentu...");
      await container.item(client.id, client.id).replace(client);

      context.log("--- SUKCES: MINIATURA ZAPISANA W BAZIE ---");

      context.log(
        `Znaleziono klienta: ${client.firstName} ${client.lastName}.`,
      );

      // Dodawanie pola (lub nadpisywanie)
      client.avatarThumbnailUrl = thumbBlobClient.url;
      client.thumbnailUpdatedAt = new Date().toISOString();

      context.log("Wysyłanie zaktualizowanego dokumentu do Cosmos DB...");
      const { resource: updatedResource } = await container
        .item(clientId, clientId)
        .replace(client);

      context.log("--- SUKCES: BAZA ZAKTUALIZOWANA ---");
      context.log(`ID dokumentu w bazie: ${updatedResource.id}`);
    } catch (error) {
      context.error("--- KRYTYCZNY BŁĄD FUNKCJI ---");
      context.error(`Typ błędu: ${error.name}`);
      context.error(`Wiadomość: ${error.message}`);
      // Rzucamy błąd dalej, żeby Azure wiedział, że nie wyszło (Retry Policy)
      throw error;
    }
  },
});
