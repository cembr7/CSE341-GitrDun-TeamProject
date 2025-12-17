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

function getAllAccessibleLists(userId) {
  const db = getDB();
  return db.collection("accessList").find({ userId }).toArray();
}

async function getAllListObjects(userId) {
  const db = getDB();

  // 1) Get accessList documents for this user
  const accessDocs = await db
    .collection("accessList")
    .find({ userId: userId })
    .toArray();

  // 2) Get the listIds from those documents
  const listIds = accessDocs
    .map(doc => doc.listId)
    .filter(id => id);

  // No shared lists
  if (listIds.length === 0) return [];

  // 3) Make sure listIds are ObjectIds
  const listObjectIds = listIds.map(id => (id instanceof ObjectId ? id : new ObjectId(id)));

  // 4) Get the actual list documents
  const lists = await db
    .collection("list")
    .find({ _id: { $in: listObjectIds } })
    .toArray();

  return lists;
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
    const accessLists = await getAllListObjects(userId);
    
    return res.status(200).json({
      success: true,
      count: lists.length,
      message: lists.length === 0
        ? "Success, but there are no tasks in this list yet."
        : "Success.",
      lists:[...lists, ...accessLists],
    });
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

    const accessLists = await getAllListObjects(userId);
    const hasListAccess = accessLists.some(t => String(t._id) === String(id));

    if (!hasListAccess && !list) {
      return res.status(404).json({ error: true, message: "List not found" });
    }

    return res.json(list ? list : accessLists.find(t => String(t._id) === String(id)));
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