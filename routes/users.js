const router = require("express").Router();
const userController = require("../controllers/userController");
const requireAuth = require("../middleware/requireauth");
const validate = require("../middleware/validation");
// Simple admin-only middleware for this router
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      error: true,
      message: "Forbidden: admin access required.",
    });
  }
  next();
}

// All /api/users routes: must be authenticated AND admin
router.use(requireAuth, requireAdmin);

// Create
router.post(
  "/users",
  validate.createUserRules,
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
  /* #swagger.description = 'Get a list of all application users (admin only).' */
  userController.getAllUsers
);

// Read one
router.get(
  "/users/:id",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Get a single user' */
  /* #swagger.description = 'Get a user by id (admin only).' */
  userController.getUserById
);

// Update
router.patch(
  "/users/:id",
  validate.updateUserRules,
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Update a user' */
  /* #swagger.description = 'Partially update a user’s name, email, and/or role (admin only).' */
  userController.updateUser
);

// Delete
router.delete(
  "/users/:id",
  /* #swagger.tags = ['Users'] */
  /* #swagger.summary = 'Delete a user' */
  /* #swagger.description = 'Permanently delete a user by id (admin only).' */
  userController.deleteUser
);

module.exports = router;
