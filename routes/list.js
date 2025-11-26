const router = require("express").Router();
const listController = require("../controllers/listController");

//------------- Item CRUD Routes ------------------//

// Create
router.post(
  "/list",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Create a new inbox list item' */
  /* #swagger.description = 'Create a new to-do item in the main inbox list.' */
  listController.createItem
);

// Read all
router.get(
  "/list",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get all inbox list items' */
  /* #swagger.description = 'Return every to-do item in the main inbox list.' */
  listController.getAllItems
);

// Read by id
router.get(
  "/list/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get a single list item' */
  /* #swagger.description = 'Look up a to-do item by its MongoDB ObjectId.' */
  listController.getItemById
);

// Update
router.patch(
  "/list/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Update a list item' */
  /* #swagger.description = 'Partially update the title and/or description of a list item.' */
  listController.updateItem
);

// Delete
router.delete(
  "/list/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Delete a list item' */
  /* #swagger.description = 'Permanently delete a list item from the inbox list.' */
  listController.deleteItem
);

//------------- Item Status Routes ------------------//

// Doing
router.get(
  "/list/doing",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get all Doing items' */
  /* #swagger.description = 'Return all items currently in the Doing list.' */
  listController.getDoingItems
);

router.put(
  "/list/doing/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Update a Doing item' */
  /* #swagger.description = 'Update the title and/or description of a Doing item.' */
  listController.updateDoingItem
);

router.delete(
  "/list/doing/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Delete a Doing item' */
  /* #swagger.description = 'Remove an item from the Doing list.' */
  listController.deleteDoingItem
);

// Done
router.get(
  "/list/done",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get all Done items' */
  /* #swagger.description = 'Return all items that have been marked Done.' */
  listController.getDoneItems
);

router.delete(
  "/list/done/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Delete a Done item' */
  /* #swagger.description = 'Remove an item from the Done list.' */
  listController.deleteDoneItem
);

// Delegate
router.get(
  "/list/delegate",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Get all Delegate items' */
  /* #swagger.description = 'Return all items that have been delegated.' */
  listController.getDelegateItems
);

router.put(
  "/list/delegate/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Update a Delegate item' */
  /* #swagger.description = 'Update the title and/or description of a delegated item.' */
  listController.updateDelegateItem
);

router.delete(
  "/list/delegate/:id",
  /* #swagger.tags = ['List'] */
  /* #swagger.summary = 'Delete a Delegate item' */
  /* #swagger.description = 'Remove an item from the Delegate list.' */
  listController.deleteDelegateItem
);

module.exports = router;
