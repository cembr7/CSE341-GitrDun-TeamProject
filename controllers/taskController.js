// controllers/taskController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

// --- Collection helpers --- //
function tasksColl() {
  const db = getDB();
  return db.collection("task");
}

function listsColl() {
  const db = getDB();
  return db.collection("list");
}

// Safely get the current user's ObjectId from req.user
function getUserObjectId(req) {
  if (!req.user || !req.user._id) {
    throw new Error("Authenticated user has no _id on req.user");
  }
  const id = req.user._id;
  return id instanceof ObjectId ? id : new ObjectId(id);
}

// Validate status and priority
const VALID_STATUSES = ["inbox", "doing", "done", "delegate"];
const VALID_PRIORITIES = ["low", "medium", "high"];

// ----------------- CREATE ----------------- //
// POST /api/tasks
// Create a new task for the current user, tied to a list
async function createTask(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const { name, description, status, priority, listId } = req.body || {};

    // name is required
    if (!name) {
      return res
        .status(400)
        .json({ error: true, message: "name is required" });
    }

    // listId is now required
    if (!listId) {
      return res
        .status(400)
        .json({ error: true, message: "listId is required" });
    }

    if (!ObjectId.isValid(listId)) {
      return res.status(400).json({ error: true, message: "Invalid listId" });
    }

    const listObjectId = new ObjectId(listId);

    // Verify that the list exists and belongs to this user
    const list = await listsColl().findOne({ _id: listObjectId, userId });
    if (!list) {
      return res
        .status(404)
        .json({ error: true, message: "List not found for this user" });
    }

    const taskStatus = status || "inbox";
    if (!VALID_STATUSES.includes(taskStatus)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid status value" });
    }

    const taskPriority = priority || "medium";
    if (!VALID_PRIORITIES.includes(taskPriority)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid priority value" });
    }

    const now = new Date();
    const doc = {
      userId,
      listId: listObjectId,          // always set now
      name,
      description: description || null,
      status: taskStatus,
      priority: taskPriority,
      createdAt: now,
      updatedAt: now,
    };

    const result = await tasksColl().insertOne(doc);

    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    next(err);
  }
}

// ----------------- READ (many) ----------------- //
// GET /api/tasks?listId=&status=
async function getTasks(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const { listId, status } = req.query || {};

    const query = { userId };

    if (listId) {
      if (!ObjectId.isValid(listId)) {
        return res.status(400).json({ error: true, message: "Invalid listId" });
      }
      query.listId = new ObjectId(listId);
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid status value" });
      }
      query.status = status;
    }

    const tasks = await tasksColl().find(query).toArray();
    return res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// ----------------- READ (one) ----------------- //
// GET /api/tasks/:id
async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const task = await tasksColl().findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    return res.json(task);
  } catch (err) {
    next(err);
  }
}

// ----------------- UPDATE ----------------- //
// PATCH /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, status, priority, listId } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid status value" });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid priority value" });
      }
      updates.priority = priority;
    }

    if (listId !== undefined) {
      if (listId === null) {
        updates.listId = null;
      } else {
        if (!ObjectId.isValid(listId)) {
          return res
            .status(400)
            .json({ error: true, message: "Invalid listId" });
        }
        const userId = getUserObjectId(req);
        const listObjectId = new ObjectId(listId);
        const list = await listsColl().findOne({
          _id: listObjectId,
          userId,
        });
        if (!list) {
          return res
            .status(404)
            .json({ error: true, message: "List not found for this user" });
        }
        updates.listId = listObjectId;
      }
    }

    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ error: true, message: "No updatable fields provided" });
    }

    const userId = getUserObjectId(req);
    const result = await tasksColl().findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    return res.json(result.value);
  } catch (err) {
    next(err);
  }
}

// ----------------- DELETE ----------------- //
// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const result = await tasksColl().deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    return res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};