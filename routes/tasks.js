const router = require("express").Router();
const taskController = require("../controllers/taskController");

// Create
router.post(
  "/task",
  taskController.createTask
);

module.exports = router;
