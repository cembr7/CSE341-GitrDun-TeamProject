const router = require("express").Router();
const listController = require("../controllers/listController");

//------------- Item CRUD Routes ------------------//
//Create
router.post("/", listController.createItem);

//Read
router.get("/", listController.getAllItems);
router.get("/:id", listController.getItemById);

//Update
router.patch("/:id", listController.updateItem);


//Delete
router.delete("/:id", listController.deleteItem);


//------------- Item Status Routes ------------------//

//Doing Routes
router.get("/doing", listController.getDoingItems);
router.put("/doing/:id", listController.updateDoingItem);
router.delete("/doing/:id", listController.deleteDoingItem);

//Done Routes
router.get("/done", listController.getDoneItems);
router.delete("/done/:id", listController.deleteDoneItem);

//Delegate Routes
router.get("/delegate", listController.getDelegateItems);
router.put("/delegate", listController.updateDelegateItem);
router.delete("/delegate/:id", listController.deleteDelegateItem);

module.exports = router;