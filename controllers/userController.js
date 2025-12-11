// controllers/userController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

// helper: get the collection
function usersColl() {
  const db = getDB();
  return db.collection("user");
}

// Create
// POST /api/users
async function createUser(req, res, next) {
  try {
    const { name, email, role } = req.body || {};

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: true, message: "name and email are required" });
    }

    const collection = usersColl();

    const existing = await collection.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: true, message: "A user with that email already exists" });
    }

    const doc = {
      name,
      email,
      role: role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({
      _id: result.insertedId,
      ...doc,
    });
  } catch (err) {
    next(err);
  }
}

// Read all
// GET /api/users
async function getAllUsers(req, res, next) {
  try {
    const collection = usersColl();

    const users = await collection.find({}).toArray();

    return res.json(users);
  } catch (err) {
    next(err);
  }
}

// Read one
// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = usersColl();
    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
}

// Update
// PATCH /api/users/:id
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    updates.updatedAt = new Date();

    // Only updatedAt means no real changes
    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ error: true, message: "No updatable fields provided" });
    }

    const collection = usersColl();

    if (email !== undefined) {
      const existing = await collection.findOne({
        email,
        _id: { $ne: new ObjectId(id) },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: true, message: "Another user already has that email" });
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json(result.value);
  } catch (err) {
    next(err);
  }
}

// Delete
// DELETE /api/users/:id
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = usersColl();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};