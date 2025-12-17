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
const accessRouter = require('./routes/access');

app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/lists', listRouter);
app.use('/', authRouter);   // auth routes stay at root
app.use('/api', accessRouter); 


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
