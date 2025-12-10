// routes/tasks.js
const router = require("express").Router();
const taskController = require("../controllers/taskController");
const requireAuth = require("../middleware/requireauth");
const validation = require("../middleware/validation");

router.use(requireAuth);

// Create task
router.post(
  "/tasks",
  validate.createTaskRules,
  /* #swagger.tags = ['Tasks'] */
  /* #swagger.summary = 'Create a new task' */
  taskController.createTask
);

// Get tasks (optionally filter by listId and status)
router.get(
  "/tasks",
  /* #swagger.tags = ['Tasks'] */
  /* #swagger.summary = 'Get tasks' */
  /* #swagger.description = 'Get tasks for the current user. Optionally filter by listId and status via query parameters.' */
  taskController.getTasks
);

// Get a single task
router.get(
  "/tasks/:id",
  /* #swagger.tags = ['Tasks'] */
  /* #swagger.summary = 'Get a single task' */
  taskController.getTaskById
);

// Update a task
router.patch(
  "/tasks/:id",
  validate.updateTaskRules,
  /* #swagger.tags = ['Tasks'] */
  /* #swagger.summary = 'Update a task' */
  taskController.updateTask
);

// Delete a task
router.delete(
  "/tasks/:id",
  /* #swagger.tags = ['Tasks'] */
  /* #swagger.summary = 'Delete a task' */
  taskController.deleteTask
);

module.exports = router;