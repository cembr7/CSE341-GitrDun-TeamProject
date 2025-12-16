// src/models/List.js ----------------------------------------------------
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:   { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('List', listSchema);