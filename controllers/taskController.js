// controllers/taskController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

function taskColl() {
  const db = getDB();
  return db.collection("task");
}

// Create
// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, listLabel, dueDate, priority, progress, notes, repeat, frequency } = req.body || {};
    const userId = req.user._id;

    const collection = taskColl();

    const doc = {
      title,
      listLabel,
      dueDate,
      priority,
      progress,
      notes,
      repeat,
      frequency,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({
      _id: result.insertedId,
      ...doc,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return next(error);
  }
}

module.exports = {
  createTask,
};
