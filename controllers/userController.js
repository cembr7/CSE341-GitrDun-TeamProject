
// controllers/userController.js ------------------------------------
const User   = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Helper – send a consistent JSON error response.
 * In test mode we also include the stack trace for easier debugging.
 */
function sendError(res, err, status = 400) {
  console.error('🛑 UserController error:', err);
  const payload = {
    error: true,
    message: err.message || 'Bad Request',
  };
  if (process.env.NODE_ENV === 'test') {
    payload.stack = err.stack;
  }
  return res.status(status).json(payload);
}

/* -----------------------------------------------------------------
   CREATE – POST /api/users
   ----------------------------------------------------------------- */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Basic sanity check – the validator is disabled in test mode,
    // but we keep this guard for safety.
    if (!name || !email || !password) {
      throw new Error('Missing required fields: name, email, password');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role });

    // Strip the password before sending back to the client
    const { password: _, ...safe } = user.toObject();
    return res.status(201).json(safe);
  } catch (err) {
    // Duplicate‑key (unique email) → 409 Conflict
    if (err.code === 11000) {
      return sendError(res, new Error('Email already exists'), 409);
    }
    return sendError(res, err, 400);
  }
};

/* -----------------------------------------------------------------
   READ ALL – GET /api/users
   ----------------------------------------------------------------- */
exports.getAllUsers = async (req, res) => {
  try {
    // In test mode we ignore any ownership filter – return everything.
    const query = process.env.NODE_ENV === 'test' ? {} : { /* add production filter here if needed */ };
    const users = await User.find(query).select('-password');
    return res.status(200).json(users);
  } catch (err) {
    return sendError(res, err, 500);
  }
};

/* -----------------------------------------------------------------
   READ ONE – GET /api/users/:id
   ----------------------------------------------------------------- */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // If you have a production‑only ownership check, guard it here:
    // if (process.env.NODE_ENV !== 'test' && req.user._id !== id) …
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    // CastError = malformed ObjectId
    if (err.name === 'CastError') {
      return sendError(res, new Error('Invalid user id'), 400);
    }
    return sendError(res, err, 500);
  }
};

/* -----------------------------------------------------------------
   UPDATE – PATCH /api/users/:id
   ----------------------------------------------------------------- */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Hash password if it is being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // In production you might check that the requester is allowed to edit this user.
    // In test mode we skip that check.
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return sendError(res, new Error('Invalid user id'), 400);
    }
    return sendError(res, err, 400);
  }
};

/* -----------------------------------------------------------------
   DELETE – DELETE /api/users/:id
   ----------------------------------------------------------------- */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Production may verify ownership; test mode skips it.
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    // 204 – No Content
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError') {
      return sendError(res, new Error('Invalid user id'), 400);
    }
    return sendError(res, err, 500);
  }
};
// controllers/userController.js
/*const { getDB } = require("../database");
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

};*/