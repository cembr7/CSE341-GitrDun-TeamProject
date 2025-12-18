// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("./passport-config");
const app = express();
const PORT = process.env.PORT || 8080;
const listRouter = require("./routes/list");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");
const accessRouter = require("./routes/access");
const { connectDB } = require("./database");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static('public'));

// Session middleware before Passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/* Swagger */
const swaggerFile = fs.readFileSync("./swagger.json");
const swaggerDoc = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === "production"
    ? "cse341-gitrdun-teamproject.onrender.com"
    : "localhost:8080";
swaggerDoc.basePath = "/api";
swaggerDoc.schemes = [process.env.NODE_ENV === "production" ? "https" : "http"];

/* Swagger Route */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// API Routes
app.use("/api", tasksRouter);
app.use("/api", listRouter);
app.use("/api", accessRouter);
app.use("/api", usersRouter);
app.use("/", authRouter);

// Root route
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "API is running" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();