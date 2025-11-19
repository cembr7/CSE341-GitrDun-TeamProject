// database/index.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

let client;
let db;

async function connectDB() {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  console.log("MongoDB connected");
  db = client.db(process.env.DB_NAME);
  db.collection("items").
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized! Call connectDB() first.");
  }
  return db;
}

module.exports = { connectDB, getDB };