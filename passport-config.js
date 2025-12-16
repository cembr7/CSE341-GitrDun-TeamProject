// Google OAuth related setup and configuration

/*const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { ObjectId } = require("mongodb");
const { connectDB } = require("./database");
require("dotenv").config();

// Use the shared connectDB helper everywhere (no separate MongoClient here)
if (process.env.NODE_ENV === "test") {
  if (!process.env.GOOGLE_CLIENT_ID) || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in test environment"
    );
    
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://cse341-gitrdun-teamproject.onrender.com/auth/google/callback"
          : "http://localhost:8080/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const db = await connectDB();
        const users = db.collection("user"); // <-- keep this consistent

        const filter = { googleId: profile.id };
        const now = new Date();
        const updateDoc = {
          $set: {
            googleId: profile.id,
            name: profile.displayName,
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            username:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            role: "user",
            password: null,
            tasksIDs: [],
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        };

        const options = { upsert: true, returnDocument: "after" };

        const result = await users.findOneAndUpdate(
          filter,
          updateDoc,
          options
        );
      }else {
        const {Strategy} = require('passport-strategy');
        class DummyStrategy extends Strategy {
          authenticate(req) {
            // Immediately succeed with a fake user
            this.success({ id: 'test-user', name: 'Test User' });
          }
        }
        passport.use(new DummyStrategy());
      }      

        let user = result.value;

        if (!user) {
          user = await users.findOne(filter);
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in GoogleStrategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user info into the session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user info from the session
passport.deserializeUser(async (id, done) => {
  try {
    const db = await connectDB();
    const users = db.collection("user");
    const user = await users.findOne({ _id: new ObjectId(id) });

    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;*/

// passport-config.js
/*const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Strategy: BaseStrategy } = require('passport-strategy');
const { ObjectId } = require('mongodb');
const { connectDB } = require('./database');

// Load .env (will also read .env.test when NODE_ENV=test)
require('dotenv').config();

/**
 * -------------------------------------------------------------------------
 * 1️⃣  Register the appropriate strategy depending on the environment
 * -------------------------------------------------------------------------
 */
/*if (process.env.NODE_ENV === 'test') {
  /**
   *  TEST ENVIRONMENT
   *
   *  • No real Google credentials are required.
   *  • We register a tiny dummy strategy that instantly succeeds with a
   *    predictable user object.  This keeps `req.isAuthenticated()` and
   *    `req.user` usable in your route tests.
   */
  /*class DummyStrategy extends BaseStrategy {
    authenticate(req) {
      // You can tweak the payload to match whatever your app expects.
      this.success({ _id: 'test-user-id', name: 'Test User', email: 'test@example.com' });
    }
  }

  passport.use(new DummyStrategy());
} else {
  /**
   *  PRODUCTION / DEVELOPMENT ENVIRONMENT
   *
   *  • Require the real Google OAuth credentials.
   *  • Throw a clear error early if they are missing.
   */
  /*const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? 'https://cse341-gitrdun-teamproject.onrender.com/auth/google/callback'
            : 'http://localhost:8080/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const db = await connectDB();
          const users = db.collection('user');

          const filter = { googleId: profile.id };
          const now = new Date();

          const updateDoc = {
            $set: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value ?? null,
              username: profile.emails?.[0]?.value ?? null,
              role: 'user',
              password: null,
              tasksIDs: [],
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          };

          const options = { upsert: true, returnDocument: 'after' };
          const result = await users.findOneAndUpdate(filter, updateDoc, options);
          let user = result?.value;

          // If the upsert didn't return a doc (some drivers behave that way), fetch it manually.
          if (!user) {
            user = await users.findOne(filter);
          }

          return done(null, user);
        } catch (err) {
          console.error('Error in GoogleStrategy:', err);
          return done(err);
        }
      }
    )
  );
}

/**
 * -------------------------------------------------------------------------
 * 2️⃣  Session serialization / deserialization (same for all envs)
 * -------------------------------------------------------------------------
 */
/*passport.serializeUser((user, done) => {
  // `user._id` can be an ObjectId or a string (our dummy user uses a string)
  const id = typeof user._id === 'object' ? user._id.toString() : user._id;
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // In test mode the dummy user never hits the DB, but the call is harmless.
    const db = await connectDB();
    const users = db.collection('user');
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;*/

// passport-config.js
const passport = require('passport');
const { Strategy: BaseStrategy } = require('passport-strategy'); // generic base class
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { ObjectId } = require('mongodb');
const { connectDB } = require('./database');
require('dotenv').config();

/* -----------------------------------------------------------------
   1️⃣  Decide which strategy to register
   ----------------------------------------------------------------- */
if (process.env.NODE_ENV === 'test') {
  // ----- TEST MODE -------------------------------------------------
  // A minimal strategy that instantly succeeds with a fake user.
  class DummyStrategy extends BaseStrategy {
    authenticate(req) {
      // The shape of the user object should match what your app expects.
      this.success({
        _id: new ObjectId(),          // or any static string id
        googleId: 'test-google-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
    }
  }

  passport.use(new DummyStrategy());
} else {
  // ----- PRODUCTION / DEV -----------------------------------------
  // Ensure the real credentials exist – fail fast if they don’t.
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? 'https://cse341-gitr-dun-teamproject.onrender.com/auth/google/callback'
            : 'http://localhost:8080/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const db = await connectDB();
          const users = db.collection('user');

          const filter = { googleId: profile.id };
          const now = new Date();

          const updateDoc = {
            $set: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value ?? null,
              username: profile.emails?.[0]?.value ?? null,
              role: 'user',
              password: null,
              tasksIDs: [],
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          };

          const options = { upsert: true, returnDocument: 'after' };
          const result = await users.findOneAndUpdate(filter, updateDoc, options);
          const user = result?.value ?? (await users.findOne(filter));

          return done(null, user);
        } catch (err) {
          console.error('Error in GoogleStrategy:', err);
          return done(err);
        }
      }
    )
  );
}

/* -----------------------------------------------------------------
   2️⃣  Session (same for both modes)
   ----------------------------------------------------------------- */
passport.serializeUser((user, done) => {
  // `user._id` may be an ObjectId (prod) or a string (dummy)
  const id = typeof user._id === 'object' ? user._id.toString() : user._id;
  done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await connectDB();
    const users = db.collection('user');
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
