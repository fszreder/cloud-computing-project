const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientsRoutes = require("./routes/clients");
const ordersRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/clients", clientsRoutes);
app.use("/orders", ordersRoutes);
app.use("/upload", require("./routes/uploads"));

app.get("/", (req, res) => {
  res.send("Cloud backend działa");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
