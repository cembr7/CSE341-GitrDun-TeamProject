// src/controllers/listController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

// ---------------------------------------------------------------------
// Collection helper
// ---------------------------------------------------------------------
function listsColl() {
  const db = getDB();
  return db.collection("list");
}

// ---------------------------------------------------------------------
// Extract the current user's ObjectId from req.user
// ---------------------------------------------------------------------
function getUserObjectId(req) {
  if (!req.user || !req.user._id) {
    throw new Error("Authenticated user has no _id on req.user");
  }
  const id = req.user._id;
  return id instanceof ObjectId ? id : new ObjectId(id);
}

// ---------------------------------------------------------------------
// CREATE – accepts `title` (alias for `name`) and returns `title`
// ---------------------------------------------------------------------
async function createList(req, res, next) {
  try {
    const { name, title, description } = req.body;
    const listName = name ?? title; // accept either field
    if (!listName) {
      return res
        .status(400)
        .json({ error: true, message: "name (or title) is required" });
    }

    const userId = getUserObjectId(req);
    const now = new Date();

    const doc = {
      userId,
      name: listName,               // store as `name` in DB
      description: description ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await listsColl().insertOne(doc);

    // Send back a stringified _id and the `title` alias the tests check
    return res
      .status(201)
      .json({
        _id: result.insertedId.toString(),
        title: doc.name,
        ...doc,
      });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// READ ALL – returns an array, each item includes `title`
// ---------------------------------------------------------------------
async function getLists(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const lists = await listsColl().find({ userId }).toArray();

    // Map `name` → `title` for the API surface the tests use
    const withTitle = lists.map(l => ({
      ...l,
      title: l.name,
    }));

    return res.json(withTitle);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// READ ONE – returns a single list with `title`
// ---------------------------------------------------------------------
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

    // Include the alias the test expects
    return res.json({ ...list, title: list.name });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// UPDATE – also accept `title` as an alias for `name`
// ---------------------------------------------------------------------
async function updateList(req, res, next) {
  try {
    const { id } = req.params;
    const { name, title, description } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const updates = {};

    // Prefer explicit `name`; fall back to `title`
    if (name !== undefined) updates.name = name;
    if (title !== undefined) updates.name = title; // alias

    if (description !== undefined) updates.description = description;
    updates.updatedAt = new Date();

    // If only `updatedAt` was set, there’s nothing to change
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

    // Return the alias the client (tests) expect
    return res.json({ ...list, title: list.name });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// DELETE – respond with 204 No Content (no JSON body)
// ---------------------------------------------------------------------
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

    // 204 No Content – no body at all
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------
module.exports = {
  createList,
  getLists,
  getListById,
  updateList,
  deleteList,
};