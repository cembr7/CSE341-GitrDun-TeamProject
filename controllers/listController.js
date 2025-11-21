// controllers/listController.js
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");


function coll(name) {
  const db = getDB();
  return db.collection(name);
}

//---------------- Item CRUD ----------------//

// Create
// POST /api/list
async function createItem(req, res, next) {
  try {
    const { title, description } = req.body || {};

    if (!title) {
      return res
        .status(400)
        .json({ error: true, message: "title is required" });
    }

    const collection = coll("items");

    const doc = {
      title,
      description: description || null,
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
// GET /api/list
async function getAllItems(req, res, next) {
  try {
    const collection = coll("items");
    const items = await collection.find({}).toArray();
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

// Read by id
// GET /api/list/:id
async function getItemById(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("items");
    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: true, message: "Item not found" });
    }

    return res.json(item);
  } catch (err) {
    next(err);
  }
}

// Update
// PATCH /api/list/:id
async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ error: true, message: "No updatable fields provided" });
    }

    const collection = coll("items");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: true, message: "Item not found" });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// Delete
// DELETE /api/list/:id
async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("items");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: true, message: "Item not found" });
    }

    return res.status(200).json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
}

//---------------- Doing list ----------------//

// GET /api/list/doing
async function getDoingItems(req, res, next) {
  try {
    const collection = coll("doing");
    // For now: return all doing items (later you can filter by user)
    const items = await collection.find({}).toArray();
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

// PUT /api/list/doing/:id
async function updateDoingItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("doing");

    const originalItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!originalItem) {
      return res
        .status(404)
        .json({ error: true, message: "Doing item not found" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    updates.updatedAt = new Date();

    const updateResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    const updatedItem = updateResult;

    return res.status(200).json({
      success: true,
      message: "Doing item updated",
      originalItem,
      updatedItem,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/list/doing/:id
async function deleteDoingItem(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("doing");
    const deletedResult = await collection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletedResult) {
      return res
        .status(404)
        .json({ error: true, message: "Doing item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Doing item deleted",
      deletedItem: deletedResult,
    });
  } catch (err) {
    next(err);
  }
}

//---------------- Done list ----------------//

// GET /api/list/done
async function getDoneItems(req, res, next) {
  try {
    const collection = coll("done");
    const items = await collection.find({}).toArray();
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/list/done/:id
async function deleteDoneItem(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("done");
    const deletedResult = await collection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletedResult) {
      return res
        .status(404)
        .json({ error: true, message: "Done item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Done item deleted",
      deletedItem: deletedResult,
    });
  } catch (err) {
    next(err);
  }
}

//---------------- Delegate list ----------------//

// GET /api/list/delegate
async function getDelegateItems(req, res, next) {
  try {
    const collection = coll("delegate");
    const items = await collection.find({}).toArray();
    return res.status(200).json(items);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/list/delegate/:id
async function updateDelegateItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("delegate");

    const originalItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!originalItem) {
      return res
        .status(404)
        .json({ error: true, message: "Delegate item not found" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    updates.updatedAt = new Date();

    const updateResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Delegate item updated",
      originalItem,
      updateResult,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/list/delegate/:id
async function deleteDelegateItem(req, res, next) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const collection = coll("delegate");
    const deletedResult = await collection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletedResult) {
      return res
        .status(404)
        .json({ error: true, message: "Delegate item not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Delegate item deleted",
      deletedItem: deletedResult,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getDoingItems,
  updateDoingItem,
  deleteDoingItem,
  getDoneItems,
  deleteDoneItem,
  getDelegateItems,
  updateDelegateItem,
  deleteDelegateItem,
};
