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

async function getUserListAccess(req, listId) {
  const db = getDB();
  const userId = getUserObjectId(req);

  if (!ObjectId.isValid(listId)) {
    return { ok: false, role: null };
  }

  const listIdObj = new ObjectId(listId);

  // Access check
  const access = await db.collection("accessList").findOne({ userId, listId: listIdObj });
  if (access) {
    return { ok: true, role: String(access.role || "read").toLowerCase() };
  }

  return { ok: false, role: null };
}

function getAllAccessibleLists(userId) {
  const db = getDB();
  return db.collection("accessList").find({ userId }).toArray();
}

function getTasksInAccessibleLists(userId, baseTaskFilter) {
  const db = getDB();
  return db.collection("accessList").find({ userId }).toArray()
}

// Return ALL tasks that belong to lists the user can access
async function getTasksInAccessibleLists(userId) {
  const db = getDB();

  // 1) Get the access records for this user
  const accessDocs = await db
    .collection("accessList")
    .find({ userId: userId })
    .toArray();

  // 2) Pull out the listIds from those records
  const listIds = accessDocs
    .map(doc => doc.listId)
    .filter(id => id);

  // If they don't have access to any lists, they have no shared tasks
  if (listIds.length === 0) return [];

  // Make sure listIds are ObjectIds
  const listObjectIds = listIds.map(id => (id instanceof ObjectId ? id : new ObjectId(id)));

  // 3) Find tasks whose listId is in that list of accessible list ids
  const tasks = await db
    .collection("task")
    .find({ listId: { $in: listObjectIds } })
    .toArray();

  return tasks;
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

    // listId is required
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
    const accessList = await getUserListAccess(req, listId);
    if (!list && !accessList.ok) {
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
      listId: listObjectId,
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
// GET /api/tasks?status=
async function getTasks(req, res, next) {
  try {
    const userId = getUserObjectId(req);
    const { status } = req.query || {};

    const baseTaskFilter = {};
    if (status) baseTaskFilter.status = String(status).toLowerCase();

    // 1) Tasks directly tied to the user
    const ownedTasks = await tasksColl()
      .find({ userId, ...baseTaskFilter })
      .toArray();

    // 2) List IDs from accessList for this user
    const accessDocs = await getDB()
      .collection("accessList")
      .find({ userId })
      .project({ listId: 1 })
      .toArray();

    const accessibleListIds = accessDocs
      .map(d => d.listId)
      .filter(Boolean)
      .map(id => (id instanceof ObjectId ? id : new ObjectId(id)));

    // 3) Tasks tied to those accessible list IDs
    let sharedTasks = [];
    if (accessibleListIds.length > 0) {
      sharedTasks = await tasksColl()
        .find({ listId: { $in: accessibleListIds }, ...baseTaskFilter })
        .toArray();
    }

    // 4) Combine
    const tasks = [...ownedTasks, ...sharedTasks];

    return res.status(200).json({
      success: true,
      count: tasks.length,
      message:
        tasks.length === 0
          ? "Success, but there are no tasks available yet."
          : "Success.",
      tasks,
    });
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

    const tasksAccessList = await getTasksInAccessibleLists(userId);
    const hasTaskAccess = tasksAccessList.some(t => String(t._id) === String(id));

    if (!hasTaskAccess && !task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    return res.json(task ? task : tasksAccessList.find(t => String(t._id) === String(id)));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, status, priority } = req.body || {};

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid id" });
    }

    const userId = getUserObjectId(req);
    const taskIdObj = new ObjectId(id);

    // 1) Check if user owns the task
    const ownedTask = await tasksColl().findOne({ _id: taskIdObj, userId });

    // 2) If not owned, check if task is in shared-access tasks
    let sharedTask = null;
    if (!ownedTask) {
      const accessTasks = await getTasksInAccessibleLists(userId);
      sharedTask = accessTasks.find(t => String(t._id) === String(id));
    }

    if (!ownedTask && !sharedTask) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    // 3) Build updates (NO listId changes)
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: true, message: "Invalid status value" });
      }
      updates.status = status;
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: true, message: "Invalid priority value" });
      }
      updates.priority = priority;
    }

    updates.updatedAt = new Date();

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({ error: true, message: "No updatable fields provided" });
    }

    // 4) Update by task id (authorization already done above)
    const updateResult = await tasksColl().updateOne(
      { _id: taskIdObj },
      { $set: updates }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    const updatedTask = await tasksColl().findOne({ _id: taskIdObj });
    return res.json(updatedTask);
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
