const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    app.listen(3000, () => console.log("Server running on port 3000"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB connection is working!");
});
