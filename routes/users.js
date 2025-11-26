const router = require("express").Router();
const userController = require("../controllers/userController");

// Create
router.post(
  "/users",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Create a new user' */
  /* #swagger.description = 'Create a new application user with name, email, and optional role.' */
  userController.createUser
);

// Read all
router.get(
  "/users",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Get all users' */
  /* #swagger.description = 'Return all users stored in the database.' */
  userController.getAllUsers
);

// Read by id
router.get(
  "/users/:id",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Get a single user' */
  /* #swagger.description = 'Look up a user by their MongoDB ObjectId.' */
  userController.getUserById
);

// Update
router.patch(
  "/users/:id",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Update a user' */
  /* #swagger.description = 'Partially update a user’s name, email, and/or role.' */
  userController.updateUser
);

// Delete
router.delete(
  "/users/:id",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Delete a user' */
  /* #swagger.description = 'Permanently delete a user by id.' */
  userController.deleteUser
);

module.exports = router;
