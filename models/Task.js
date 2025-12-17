// src/models/Task.js ----------------------------------------------------
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    name:   { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['inbox', 'doing', 'done', 'delegate'],
      default: 'inbox',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);