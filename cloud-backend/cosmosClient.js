const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const database = client.database(process.env.DATABASE_NAME);

module.exports = {
  clientsContainer: database.container(process.env.CLIENTS_CONTAINER),
  ordersContainer: database.container(process.env.ORDERS_CONTAINER),
};
