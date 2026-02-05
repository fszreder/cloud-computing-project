const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientsRoutes = require("./routes/clients");
const ordersRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const githubUser = req.headers["x-ms-client-principal-name"];

  const ADMINS = [
    "fszreder",
    "Filip Szreder",
    "Darmsztradt",
    "NickProwadzacego",
  ];

  if (["POST", "DELETE", "PUT"].includes(req.method)) {
    const isAdmin = githubUser && ADMINS.includes(githubUser);

    if (!isAdmin) {
      console.warn(`[Security] Odmowa dla: ${githubUser || "Anonim"}`);
      return res.status(403).json({
        error: "Forbidden",
        message: `${githubUser || "Anonim"} nie ma uprawnień administratora.`,
      });
    }
  }
  next();
});

app.use("/api/clients", clientsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/api/clients", require("./routes/uploads"));

app.get("/", (req, res) => {
  res.send("Cloud backend działa");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
