const statusButton = document.getElementById("statusButton");
const socketButton = document.getElementById("socketButton");
const output = document.getElementById("output");

// Verbindung zum Server herstellen
const socket = io();

function writeOutput(text) {
  output.textContent += "\n" + text;
}

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
    message: "Hallo Server, hier ist ein Spieler!"
  });
});

socket.on("connect", () => {
  writeOutput(`Socket verbunden. Meine ID: ${socket.id}`);
});

socket.on("serverMessage", (data) => {
  writeOutput(`Server: ${data.message}`);
});

socket.on("disconnect", () => {
  writeOutput("Socket-Verbindung getrennt.");
});