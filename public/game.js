const statusButton = document.getElementById("statusButton");
const output = document.getElementById("output");

statusButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    output.textContent = "Fehler beim Abrufen des Serverstatus.";
    console.error(error);
  }
});