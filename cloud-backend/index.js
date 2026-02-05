const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clientsRoutes = require("./routes/clients");
const ordersRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const displayName = req.headers["x-ms-client-principal-name"];
  const encodedPrincipal = req.headers["x-ms-client-principal"];

  let githubId = null;

  if (encodedPrincipal) {
    try {
      const decoded = JSON.parse(
        Buffer.from(encodedPrincipal, "base64").toString("utf-8"),
      );
      const idClaim = decoded.claims.find(
        (c) =>
          c.typ ===
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      );
      if (idClaim) githubId = idClaim.val;
    } catch (e) {
      console.error("Błąd dekodowania principal:", e);
    }
  }

  console.log(`[AUTH] Próba: Name="${displayName}" | ID="${githubId}"`);

  const ADMINS = [
    "Filip Szreder",
    "Tomasz Wanke",
    "171807352",
    "fszreder",
    "Ola",
    "OlaBluszcz",
    "a.bluszcz.312@studms.ug.edu.pl",
  ].map((a) => a.toLowerCase());

  if (["POST", "DELETE", "PUT"].includes(req.method)) {
    const isAdmin =
      (displayName && ADMINS.includes(displayName.toLowerCase())) ||
      (githubId && ADMINS.includes(githubId.toLowerCase()));

    if (!isAdmin) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Brak uprawnień. Zalogowany jako: ${displayName || githubId || "Anonim"}`,
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
