// Google OAuth related setup and configuration

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://cse341-gitrdun-teamproject.onrender.com/auth/google/callback'
        : 'http://localhost:8080/auth/google/callback'
},
async function(accessToken, refreshToken, profile, done) {
  try {
    await client.connect();
    const database = client.db("GitrDunDB");
    const users = database.collection("user");

    const filter = { googleId: profile.id };
    const updateDoc = {
      $set: {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        username: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        role: "user",
        password: null,
        tasksIDs: [],
      }
    };
    const options = { upsert: true, returnDocument: "after" };

    const result = await users.findOneAndUpdate(filter, updateDoc, options);
    const user = result.value;

    return done(null, user);
  } catch (err) {
    return done(err, null);
  } finally {
  }
}));

// Serialize user info into the session
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
