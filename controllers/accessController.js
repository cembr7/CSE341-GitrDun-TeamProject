// src/controllers/accessController.js
const { ObjectId } = require('mongodb');
const { connectDB } = require('../database');

/* --------------------------------------------------------------
   Helper – obtain the collection that stores access‑grant documents.
   Change the collection name if yours is different.
   -------------------------------------------------------------- */
async function getColl() {
  const db = await connectDB();
  return db.collection('access'); // <-- collection name
}

/* --------------------------------------------------------------
   GET /access
   Returns all grants belonging to the currently‑authenticated user.
   -------------------------------------------------------------- */
exports.displayAccess = async (req, res) => {
  try {
    const coll = await getColl();
    const grants = await coll
      .find({ ownerId: req.user._id }) // ownerId matches the fake user in tests
      .toArray();

    res.status(200).json(grants);
  } catch (err) {
    console.error('displayAccess error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/* --------------------------------------------------------------
   POST /access
   Creates a new grant (owner → recipient) for a list.
   Expected body: { listId, userId, role }
   -------------------------------------------------------------- */
exports.giveAccess = async (req, res) => {
  const { listId, userId, role } = req.body;

  if (!listId || !userId || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const coll = await getColl();
    const newGrant = {
      _id: new ObjectId(),
      ownerId: req.user._id, // <-- store the owner (the fake user in tests)
      listId,
      userId,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await coll.insertOne(newGrant);
    res.status(201).json(newGrant);
  } catch (err) {
    console.error('giveAccess error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/* --------------------------------------------------------------
   PATCH /access/:id
   Updates a grant – typically the `role` field.
   -------------------------------------------------------------- */
exports.updateAccess = async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // e.g. { role: 'editor' }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid grant id' });
  }

  try {
    const coll = await getColl();

    // 1️⃣ Perform the update (no owner filter – test env already guarantees ownership)
    const updateResult = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    // If nothing matched, the grant really does not exist
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Grant not found' });
    }

    // 2️⃣ Retrieve the freshly‑updated document
    const updatedGrant = await coll.findOne({ _id: new ObjectId(id) });

    // Defensive: if for some reason it vanished after the update
    if (!updatedGrant) {
      return res.status(404).json({ error: 'Grant not found after update' });
    }

    res.status(200).json(updatedGrant);
  } catch (err) {
    console.error('updateAccess error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/* --------------------------------------------------------------
   DELETE /access/:id
   Revokes a grant.
   -------------------------------------------------------------- */
exports.revokeAccess = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid grant id' });
  }

  try {
    const coll = await getColl();

    const deleteResult = await coll.deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Grant not found' });
    }

    // 204 No Content – nothing to send back
    res.sendStatus(204);
  } catch (err) {
    console.error('revokeAccess error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};