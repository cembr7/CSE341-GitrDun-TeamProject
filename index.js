// index.js
/*/*require("dotenv").config();
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

// src/middleware/testAuthBypass.js
if (process.env.NODE_ENV === 'test') {
  console.log('🚧 TEST MODE – auth bypass active');
  // This runs before any router is attached
  app.use((req, res, next) => {
    req.user = { role: 'admin', _id: '507f1f77bcf86cd799439011' };
    req.isAuthenticated = () => true;
    next();
  });
}

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
/*/*const swaggerFile = fs.readFileSync("./swagger.json");
const swaggerDoc = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === "production"
    ? "cse341-gitrdun-teamproject-test.onrender.com"
    : "localhost:8080";
swaggerDoc.basePath = "/api";
swaggerDoc.schemes = [process.env.NODE_ENV === "production" ? "https" : "http"];

/* Swagger Route */
/*app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

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

// ──────────────────────────────────────────────────────────────
//  TEST-ONLY AUTH HELPERS – ONLY ACTIVE IN dev & test
// ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  console.log('Test helpers enabled: /test/login, /test/session, /test/logout');

  // 1. Log in any user you want (for testing protected routes)
  app.post('/test/login', (req, res) => {
    const { email = 'test@example.com', name = 'Test User', _id = 'fake1234567890' } = req.body;

    const fakeUser = {
      _id,
      email,
      name: name || email.split('@')[0],
      provider: 'google',           // makes it look like Google OAuth user
      googleId: 'google12345',
      // add any other fields your req.user normally has
    };

    // This is the magic: passport's own method
    req.logIn(fakeUser, { session: true }, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({
        message: 'Logged in via test helper',
        user: fakeUser,
      });
    });
  });

  // 2. See who is currently logged in
  app.get('/test/session', (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
    });
  });

  // 3. Force logout (clears session)
  app.post('/test/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: err });
      req.session.destroy(() => {
        res.clearCookie('connect.sid'); // default session cookie name
        res.json({ message: 'Logged out (test helper)' });
      });
    });
  });
}
// ──────────────────────────────────────────────────────────────

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

module.exports = app; // for testing*/

/// src/index.js ---------------------------------------------------------
/*require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const session   = require('express-session');
const passport  = require('passport');
require('./passport-config');               // <-- your Passport strategies

// ---------------------------------------------------------------------
// 1️⃣  Create the Express app (declare ONLY ONCE!)
const app = express();

// ---------------------------------------------------------------------
// 2️⃣  Global middleware (same as before)
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static('public'));

// ---------------------------------------------------------------------
// Health check endpoint (before any auth middleware)
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  console.log('Health handler hit');
  res.json({ status: 'ok', message: 'API is running' });
});

// ---------------------------------------------------------------------
// 3️⃣  TEST‑MODE AUTH BYPASS (runs BEFORE any other middleware)
// ---------------------------------------------------------------------
if (process.env.NODE_ENV === 'test') {
  console.log('🚧 TEST MODE – auth bypass active');
  app.use((req, res, next) => {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'testadmin@example.com',
      name: 'Test Admin',
      role: 'admin',
    };
    req.isAuthenticated = () => true;
    next();
  });
}

// ---------------------------------------------------------------------
// 4️⃣  Session & Passport (required for real OAuth)
// ---------------------------------------------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallbackSecret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------------------------------
// 5️⃣  Routers – each resource gets its own base path
// ---------------------------------------------------------------------
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const listRouter  = require('./routes/list');
const authRouter  = require('./routes/auth');

app.use('/api/users', usersRouter);   // → /api/users/*
app.use('/api/tasks', tasksRouter);   // → /api/tasks/*
app.use('/api/lists', listRouter);    // → /api/lists/*
app.use('/', authRouter);             // auth routes stay at root

// ---------------------------------------------------------------------
// 6️⃣  Swagger UI (optional – keep if you use it)
// ---------------------------------------------------------------------
const swaggerUi = require('swagger-ui-express');
const fs        = require('fs');
const swaggerFile = fs.readFileSync('./swagger.json');
const swaggerDoc  = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === 'production'
    ? 'cse341-gitrdrun-teamproject-test.onrender.com'
    : `localhost:${PORT}`;

swaggerDoc.basePath = '/api';
swaggerDoc.schemes = [process.env.NODE_ENV === 'production' ? 'https' : 'http'];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ---------------------------------------------------------------------
// 7️⃣  Simple health / root endpoint
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'API is running' });
});

// ---------------------------------------------------------------------
// 8️⃣  Central error handler (JSON response)
// ---------------------------------------------------------------------
app.use((err, req, res, _next) => {
  console.error('Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

// ---------------------------------------------------------------------
// 9️⃣  Export the bare app for Jest (no server listening here)
// ---------------------------------------------------------------------
module.exports = app;

// ---------------------------------------------------------------------
// 🔟  Start the real HTTP server ONLY when this file is run directly
// ---------------------------------------------------------------------
if (require.main === module) {
  // Production DB connection – keep it separate so tests can use the
  // in‑memory DB instead.
  const { connectDB } = require('./database');

  (async () => {
    try {
      await connectDB();                     // real MongoDB for prod/dev
      app.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
      });
    } catch (e) {
      console.error('❌ Failed to start server:', e);
      process.exit(1);
    }
  })();
}*/

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const session   = require('express-session');
const passport  = require('passport');
require('./passport-config');               // your Passport strategies



// ---------------------------------------------------------------------
// 1️⃣  Create the Express app (declare ONLY ONCE!)
const app = express();

// ---------------------------------------------------------------------
// 2️⃣  Global middleware
const PORT = process.env.PORT || 8080;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());


// ---------------------------------------------------------------------
// 3️⃣  Health‑check endpoint (must be BEFORE auth middleware)
app.get('/', (req, res) => {
  console.log('Health handler hit');   // <-- log that the test asserts on
  res.json({ status: 'ok', message: 'API is running' });
});

// ---------------------------------------------------------------------
// 4️⃣  TEST‑MODE AUTH BYPASS (runs BEFORE any other middleware)
if (process.env.NODE_ENV === 'test') {
  console.log('🚧 TEST MODE – auth bypass active');
  app.use((req, res, next) => {
    req.user = {
      _id: '507f1f77bcf86cd799439011',
      email: 'testadmin@example.com',
      name: 'Test Admin',
      role: 'admin',
    };
    req.isAuthenticated = () => true;
    next();
  });
}

// ---------------------------------------------------------------------
// Static assests middleware
// ---------------------------------------------------------------------
app.use(express.static('public'));

// ---------------------------------------------------------------------
// 5️⃣  Session & Passport (required for real OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallbackSecret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------------------------------
// 6️⃣  Routers
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const listRouter  = require('./routes/list');
const authRouter  = require('./routes/auth');

app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/lists', listRouter);
app.use('/', authRouter);   // auth routes stay at root

// ---------------------------------------------------------------------
// 7️⃣  Swagger UI (optional)
const swaggerUi   = require('swagger-ui-express');
const fs          = require('fs');
const swaggerFile = fs.readFileSync('./swagger.json');
const swaggerDoc  = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === 'production'
    ? 'cse341-gitrdrun-teamproject-test.onrender.com'
    : `localhost:${PORT}`;
swaggerDoc.basePath = '/api';
swaggerDoc.schemes = [process.env.NODE_ENV === 'production' ? 'https' : 'http'];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ---------------------------------------------------------------------
// 8️⃣  Central error handler
app.use((err, req, res, _next) => {
  console.error('Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

// ---------------------------------------------------------------------
// 9️⃣  Export the bare app for Jest (no server listening here)
module.exports = app;

// ---------------------------------------------------------------------
// 🔟  Start the real HTTP server ONLY when this file is run directly
if (require.main === module) {
  const { connectDB } = require('./database');
  (async () => {
    try {
      await connectDB();                     // real MongoDB for prod/dev
      app.listen(PORT, () => {
        console.log(`🚀 Server listening on http://localhost:${PORT}`);
      });
    } catch (e) {
      console.error('❌ Failed to start server:', e);
      process.exit(1);
    }
  })();
}
