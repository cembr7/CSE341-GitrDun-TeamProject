// Google OAuth related setup and configuration

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { ObjectId } = require("mongodb");
const { connectDB } = require("./database");
require("dotenv").config();

// Use the shared connectDB helper everywhere (no separate MongoClient here)
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
        const users = db.collection("user");

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

module.exports = passport;
