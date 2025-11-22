/* Required */
const { MongoClient } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const routes = require("./routes");

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    app.listen(8080, () => console.log("Server running on port 8080"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB connection is working!");

/* Localhost */
const port = process.env.PORT || 8080;

/* Swagger */
const swaggerFile = fs.readFileSync("./swagger.json");
const swaggerDoc = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === "production"
    ? "https://cse341-gitrdun-teamproject.onrender.com"
    : "localhost:8080";

swaggerDoc.schemes = [process.env.NODE_ENV === "production" ? "https" : "http"];

/* Swagger Route */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

/* Routes */
app.use("/", routes);

