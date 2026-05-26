const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");

const statusButton = document.getElementById("statusButton");
const socketButton = document.getElementById("socketButton");
const output = document.getElementById("output");

const socket = io();

let currentPlayer = null;

function writeOutput(text) {
  output.textContent += "\n" + text;
}

loginButton.addEventListener("click", () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  socket.emit("login", {
    username: username,
    password: password
  });
});

statusButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    writeOutput("HTTP-Antwort:");
    writeOutput(JSON.stringify(data, null, 2));
  } catch (error) {
    writeOutput("Fehler beim Abrufen des Serverstatus.");
    console.error(error);
  }
});

socketButton.addEventListener("click", () => {
  socket.emit("playerMessage", {
    message: "Hallo Server, hier ist ein eingeloggter Spieler!"
  });
});

socket.on("connect", () => {
  writeOutput(`Socket verbunden. Meine ID: ${socket.id}`);
});

socket.on("serverMessage", (data) => {
  writeOutput(`Server: ${data.message}`);
});

socket.on("loginResult", (data) => {
  writeOutput(data.message);

  if (data.success) {
    currentPlayer = data.player;

    writeOutput(`Spielername: ${currentPlayer.playerName}`);
    writeOutput(`Level: ${currentPlayer.level}`);
    writeOutput(`Gold: ${currentPlayer.gold}`);
  }
});

socket.on("disconnect", () => {
  writeOutput("Socket-Verbindung getrennt.");
});