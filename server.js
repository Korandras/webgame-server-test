const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    message: "Game-Server läuft!",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});