const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const { initDatabase, getDatabase } = require("./database");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Merkt sich eingeloggte Spieler pro Socket-ID
const loggedInPlayers = new Map();

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    message: "Game-Server läuft!",
    time: new Date().toISOString()
  });
});

io.on("connection", (socket) => {
  console.log("Ein Spieler hat sich verbunden:", socket.id);

  socket.emit("serverMessage", {
    message: "Willkommen auf dem Webgame-Server!",
    socketId: socket.id
  });

  socket.on("login", async (data) => {
    try {
      const username = data.username;
      const password = data.password;

      const db = getDatabase();

      const user = await db.get(
        `
        SELECT id, username, password, playerName, level, gold
        FROM users
        WHERE username = ?
        `,
        [username]
      );

      if (!user || user.password !== password) {
        socket.emit("loginResult", {
          success: false,
          message: "Login fehlgeschlagen. Benutzername oder Passwort falsch."
        });

        return;
      }

      loggedInPlayers.set(socket.id, {
        id: user.id,
        username: user.username,
        playerName: user.playerName,
        level: user.level,
        gold: user.gold
      });

      socket.emit("loginResult", {
        success: true,
        message: "Login erfolgreich!",
        player: {
          playerName: user.playerName,
          level: user.level,
          gold: user.gold
        }
      });

      socket.broadcast.emit("serverMessage", {
        message: `${user.playerName} ist dem Spiel beigetreten.`
      });

      console.log(`${user.playerName} hat sich eingeloggt.`);
    } catch (error) {
      console.error("Fehler beim Login:", error);

      socket.emit("loginResult", {
        success: false,
        message: "Serverfehler beim Login."
      });
    }
  });

  socket.on("playerMessage", (data) => {
    const player = loggedInPlayers.get(socket.id);

    if (!player) {
      socket.emit("serverMessage", {
        message: "Du bist nicht eingeloggt."
      });

      return;
    }

    io.emit("serverMessage", {
      message: `${player.playerName} sagt: ${data.message}`,
      socketId: socket.id
    });
  });

  socket.on("disconnect", () => {
    const player = loggedInPlayers.get(socket.id);

    if (player) {
      socket.broadcast.emit("serverMessage", {
        message: `${player.playerName} hat das Spiel verlassen.`
      });

      loggedInPlayers.delete(socket.id);
    }

    console.log("Ein Spieler hat die Verbindung getrennt:", socket.id);
  });
});

async function startServer() {
  try {
    await initDatabase();

    server.listen(PORT, () => {
      console.log(`Server läuft auf Port ${PORT}`);
    });
  } catch (error) {
    console.error("Server konnte nicht gestartet werden:", error);
    process.exit(1);
  }
}

startServer();