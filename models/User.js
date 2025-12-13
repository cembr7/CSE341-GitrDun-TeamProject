// src/models/User.js ----------------------------------------------------
const mongoose = require('mongoose');

/**
 *  ────────────────────────────────────────────────────────────────
 *  User schema – matches the fields you send from the tests:
 *    • name     – required string
 *    • email    – required, unique, lower‑cased string
 *    • password – required string (hashed before save)
 *    • role     – optional enum, defaults to 'user'
 *  ────────────────────────────────────────────────────────────────
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',               // ← makes the field optional for tests
    },
  },
  { timestamps: true }               // adds createdAt / updatedAt
);

/**
 *  Optional: you can add instance methods, statics, or pre‑save hooks
 *  (e.g., auto‑hash password).  For the unit‑tests we hash the
 *  password in the controller, so a simple schema is enough.
 */

module.exports = mongoose.model('User', userSchema);