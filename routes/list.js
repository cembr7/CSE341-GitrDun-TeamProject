const router = require("express").Router();
const requireAuth = require("../middleware/requireauth");
const listsController = require("../controllers/listController");
const validate = require("../middleware/validation");

router.use(requireAuth);

// Create
router.post(
  "/lists",
  validate.createListRules,
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Create a new list' */
  listsController.createList
);

// Read all
router.get(
  "/lists",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get all lists for the current user' */
  listsController.getLists
);

// Read one
router.get(
  "/lists/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get a single list by id' */
  listsController.getListById
);

// Update
router.patch(
  "/lists/:id",
  validate.updateListRules,
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Update a list' */
  listsController.updateList
);

// Delete
router.delete(
  "/lists/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Delete a list' */
  listsController.deleteList
);

module.exports = router;
