const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;

async function initDatabase() {
  db = await open({
    filename: "./game.db",
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      playerName TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      gold INTEGER NOT NULL DEFAULT 0
    );
  `);

  const existingUser = await db.get(
    "SELECT * FROM users WHERE username = ?",
    ["kora"]
  );

  if (!existingUser) {
    await db.run(
      `
      INSERT INTO users (username, password, playerName, level, gold)
      VALUES (?, ?, ?, ?, ?)
      `,
      ["kora", "test123", "Korandras", 1, 50]
    );

    console.log("Demo-Benutzer wurde erstellt.");
  }

  console.log("Datenbank ist bereit.");
}

function getDatabase() {
  if (!db) {
    throw new Error("Datenbank wurde noch nicht initialisiert.");
  }

  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};