// src/controllers/taskController.js
/* ------------------------------------------------------------------
   Dependencies
   ------------------------------------------------------------------ */
const { getDB } = require("../database");
const { ObjectId } = require("mongodb");

/* ------------------------------------------------------------------
   Collection helpers
   ------------------------------------------------------------------ */
function tasksColl() {
  const db = getDB();
  return db.collection("task");
}
function listsColl() {
  const db = getDB();
  return db.collection("list");
}

/* ------------------------------------------------------------------
   User helper – extracts the ObjectId of the authenticated user
   ------------------------------------------------------------------ */
function getUserObjectId(req) {
  if (!req.user || !req.user._id) {
    throw new Error("Authenticated user has no _id on req.user");
  }
  const id = req.user._id;
  return id instanceof ObjectId ? id : new ObjectId(id);
}

/* ------------------------------------------------------------------
   Normalise incoming payload
   - Accept `title` as an alias for `name`
   - Translate legacy status `"todo"` → `"inbox"`
   ------------------------------------------------------------------ */
function normalizeTaskBody(body) {
  const {
    name,
    title,
    description,
    status,
    priority,
    listId,
    ...rest
  } = body;

  // Prefer explicit `name`; fall back to `title`
  const finalName = name ?? title;

  // If the client sent the old `"todo"` enum, map it to the current `"inbox"`
  const finalStatus = status === "todo" ? "inbox" : status;

  return {
    name: finalName,
    description,
    status: finalStatus,
    priority,
    listId,
    ...rest,
  };
}

/* ------------------------------------------------------------------
   Enum validation
   ------------------------------------------------------------------ */
const VALID_STATUSES = ["inbox", "doing", "done", "delegate"];
const VALID_PRIORITIES = ["low", "medium", "high"];

/* ------------------------------------------------------------------
   CREATE – POST /api/tasks
   ------------------------------------------------------------------ */
async function createTask(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const {
      name,
      description,
      status,
      priority,
      listId: rawListId,
    } = normalizeTaskBody(req.body);

    // ---------- required fields ----------
    if (!name) {
      return res
        .status(400)
        .json({ error: true, message: "name (or title) is required" });
    }
    if (!rawListId) {
      return res
        .status(400)
        .json({ error: true, message: "listId is required" });
    }

    // ---------- normalise listId (accept string or ObjectId) ----------
    const listIdStr =
      typeof rawListId === "object" && rawListId.toString
        ? rawListId.toString()
        : String(rawListId);

    if (!ObjectId.isValid(listIdStr)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid listId" });
    }
    const listObjectId = new ObjectId(listIdStr);

    // ---------- verify the list belongs to this user ----------
    const list = await listsColl().findOne({ _id: listObjectId, userId });
    if (!list) {
      return res
        .status(404)
        .json({ error: true, message: "List not found for this user" });
    }

    // ---------- enum validation ----------
    const taskStatus = status ?? "inbox";
    if (!VALID_STATUSES.includes(taskStatus)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid status value" });
    }
    const taskPriority = priority ?? "medium";
    if (!VALID_PRIORITIES.includes(taskPriority)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid priority value" });
    }

    // ---------- create the document ----------
    const now = new Date();
    const doc = {
      userId,
      listId: listObjectId,
      name,
      description: description || null,
      status: taskStatus,
      priority: taskPriority,
      createdAt: now,
      updatedAt: now,
    };

    const result = await tasksColl().insertOne(doc);

    // Return the alias the tests look for (`title`)
    return res
      .status(201)
      .json({ _id: result.insertedId, title: doc.name, ...doc });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   READ MANY – GET /api/tasks
   ------------------------------------------------------------------ */
async function getTasks(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const { listId, status } = req.query || {};
    const query = { userId };

    if (listId) {
      if (!ObjectId.isValid(listId)) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid listId" });
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

    // Add the `title` alias so the test can check `res.body.title`
    const withTitle = tasks.map(t => ({ ...t, title: t.name }));
    return res.json(withTitle);
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   READ ONE – GET /api/tasks/:id
   ------------------------------------------------------------------ */
async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const task = await tasksColl().findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ error: true, message: "Task not found" });
    }

    // Return the alias the test expects
    return res.json({ ...task, title: task.name });
  } catch (err) {
    next(err);
  }
}

// ------------------------------------------------------------------
// UPDATE – PATCH /api/tasks/:id
// ------------------------------------------------------------------
// UPDATE – PATCH /api/tasks/:id
// ------------------------------------------------------------------
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      priority,
      listId: rawListId,
    } = req.body || {};

    // --------------------------------------------------------------
    // 1️⃣ Validate the task ID
    // --------------------------------------------------------------
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid id" });
    }

    // --------------------------------------------------------------
    // 2️⃣ Build the set of fields to update
    // --------------------------------------------------------------
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

    // --------------------------------------------------------------
    // 3️⃣ Optional listId change – normalise and verify ownership
    // --------------------------------------------------------------
    if (rawListId !== undefined) {
      if (rawListId === null) {
        updates.listId = null;
      } else {
        // Accept string or ObjectId
        const listIdStr =
          typeof rawListId === "object" && rawListId.toString
            ? rawListId.toString()
            : String(rawListId);

        if (!ObjectId.isValid(listIdStr)) {
          return res
            .status(400)
            .json({ error: true, message: "Invalid listId" });
        }

        const userId = getUserObjectId(req);
        const listObjectId = new ObjectId(listIdStr);
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

    // --------------------------------------------------------------
    // 4️⃣ Always bump the updatedAt timestamp
    // --------------------------------------------------------------
    updates.updatedAt = new Date();

    // --------------------------------------------------------------
    // 5️⃣ Guard – reject if the client sent nothing updatable
    // --------------------------------------------------------------
    // (updates always contains at least `updatedAt`; we need >1 key)
    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ error: true, message: "No updatable fields provided" });
    }

    // --------------------------------------------------------------
    // 6️⃣ Perform the update (filter only on _id)
    // --------------------------------------------------------------
    const updateResult = await tasksColl().updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    // If nothing matched, the task truly does not exist
    if (updateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Task not found" });
    }

    // --------------------------------------------------------------
    // 7️⃣ Fetch the freshly‑updated document
    // --------------------------------------------------------------
    const updatedDoc = await tasksColl().findOne({
      _id: new ObjectId(id),
    });

    // --------------------------------------------------------------
    // 8️⃣ Return the document, exposing the `title` alias
    // --------------------------------------------------------------
    return res.json({ ...updatedDoc, title: updatedDoc.name });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   DELETE – DELETE /api/tasks/:id
   ------------------------------------------------------------------ */
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const result = await tasksColl().deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Task not found" });
    }

    // 204 No Content – nothing in the body
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------
   Export
   ------------------------------------------------------------------ */
module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};