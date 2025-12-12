// database/index.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

let client;
let db;

/*
Database Layout:
Users Collection:
  {
    _id: ObjectId("..."),
    googleId: "google-oauth-profile-id",
    email: "user@example.com",
    name: "User Name",
    photo: "https://...",
    role: "user",        // or "admin" later if you want
    createdAt: ISODate(...),
    updatedAt: ISODate(...)
  }

Lists Collection:
  {
    _id: ObjectId("..."),      // listId
    userId: ObjectId("..."),   // reference to users._id
    name: "School",
    description: "All my homework tasks",
    createdAt: ISODate(...),
    updatedAt: ISODate(...)
  }

Task Collection:
  {
    _id: ObjectId("..."),
    userId: ObjectId("..."),    // who owns it
    listId: ObjectId("..."),    // which list it belongs to
    name: "Finish report",
    description: "Due Friday, talk to manager first",
    status: "inbox" | "doing" | "done" | "delegate",
    priority: "low" | "medium" | "high",
    createdAt: ISODate(...),
    updatedAt: ISODate(...)
  }
*/

async function connectDB() {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  console.log("MongoDB connected");
  db = client.db(process.env.DB_NAME);
  db.collection("items")
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized! Call connectDB() first.");
  }
  return db;
}

module.exports = { connectDB, getDB };