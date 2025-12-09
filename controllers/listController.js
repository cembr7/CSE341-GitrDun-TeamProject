// controllers/listsController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

function listsColl() {
  const db = getDB();
  return db.collection("list");
}

function getUserObjectId(req) {
  if (!req.user || !req.user._id) {
    throw new Error("Authenticated user has no _id on req.user");
  }
  const id = req.user._id;
  return id instanceof ObjectId ? id : new ObjectId(id);
}

// POST /api/lists
async function createList(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const { name, description } = req.body || {};

    if (!name) {
      return res
        .status(400)
        .json({ error: true, message: "name is required" });
    }

    const doc = {
      userId,
      name,
      description: description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await listsColl().insertOne(doc);

    return res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    next(err);
  }
}

// GET /api/lists
async function getLists(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const lists = await listsColl().find({ userId }).toArray();
    return res.json(lists);
  } catch (err) {
    next(err);
  }
}

// GET /api/lists/:id
async function getListById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const list = await listsColl().findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!list) {
      return res.status(404).json({ error: true, message: "List not found" });
    }

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/lists/:id
async function updateList(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    updates.updatedAt = new Date();

    // Only updatedAt means no real changes
    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ error: true, message: "No updatable fields provided" });
    }

    const userId = getUserObjectId(req);

    const result = await listsColl().updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: true, message: "List not found" });
    }

    const list = await listsColl().findOne({
      _id: new ObjectId(id),
      userId,
    });

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/lists/:id
async function deleteList(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const result = await listsColl().deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: true, message: "List not found" });
    }

    // Optional: also delete tasks with this listId here

    return res.json({ success: true, message: "List deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createList,
  getLists,
  getListById,
  updateList,
  deleteList,
};