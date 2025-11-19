const router = require("express").Router();
const userController = require("../controllers/userController");

//Create
router.post("/", userController.createUser)

//Read
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

//Update
router.patch("/:id", userController.updateUser)

//Delete
router.delete("/:id", userController.deleteUser)

module.exports = router;