const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Webseite aus dem Ordner public ausliefern
app.use(express.static(path.join(__dirname, "public")));

// Normale HTTP-Test-API
app.get("/api/status", (req, res) => {
  res.json({
    message: "Game-Server läuft!",
    time: new Date().toISOString()
  });
});

// Socket.IO-Verbindungen
io.on("connection", (socket) => {
  console.log("Ein Spieler hat sich verbunden:", socket.id);

  // Begrüßung nur an diesen einen Spieler
  socket.emit("serverMessage", {
    message: "Willkommen auf dem Webgame-Server!",
    socketId: socket.id
  });

  // Testnachricht vom Client empfangen
  socket.on("playerMessage", (data) => {
    console.log("Nachricht vom Spieler:", data);

    // Nachricht an alle verbundenen Spieler senden
    io.emit("serverMessage", {
      message: `Spieler sagt: ${data.message}`,
      socketId: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log("Ein Spieler hat die Verbindung getrennt:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});