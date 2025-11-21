// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 3000;
const listRouter = require("./routes/list");
const usersRouter = require("./routes/users");
const { connectDB } = require("./database");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use("/api/list", listRouter);
app.use("/api/users", usersRouter);

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
