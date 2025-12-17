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