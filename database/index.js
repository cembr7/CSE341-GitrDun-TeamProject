// database/index.js
/*const { MongoClient } = require("mongodb");
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

/*async function connectDB() {
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

module.exports = { connectDB, getDB };*/

// src/database/index.js -------------------------------------------------
const mongoose = require('mongoose');
require('dotenv').config();

let _connected = false;

/**
 * Connect to the real MongoDB instance (used in production / dev).
 * Returns the Mongoose connection object.
 */
async function connectDB() {
   // If Mongoose is already connected, just reuse it.
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  //if (_connected) return mongoose.connection;   // already connected

  const uri = process.env.MONGO_URI;            // e.g. mongodb://host:27017/db
  if (!uri) {
    throw new Error('MONGO_URI is not defined in .env');
  }

  await mongoose.connect(uri, {
    // Mongoose ≥6 automatically uses the new parser / unified topology
    // You can add extra options here if you need them.
  });

  console.log('✅ Mongoose connected to', uri);
  _connected = true;
  return mongoose.connection;
}

/**
 * Simple getter – throws if you try to use it before `connectDB()` ran.
 */
function getDB() {
if (mongoose.connection && mongoose.connection.readyState === 1) {
    // Mongoose exposes the native driver collection API via `.collection(name)`
    return mongoose.connection;
  }
  throw new Error('Database not initialized! Call connectDB() first.');
}

module.exports = { connectDB, getDB };