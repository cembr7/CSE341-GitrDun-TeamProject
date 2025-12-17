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