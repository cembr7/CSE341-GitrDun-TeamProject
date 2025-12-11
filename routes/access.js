const router = require("express").Router();
const requireAuth = require("../middleware/requireauth");
const accessController = require("../controllers/accessController");

router.use(requireAuth);



router.get(accessController.displayAccess)

router.post(accessController.giveAccess)

router.patch(accessController.updateAccess)

router.delete(accessController.revokeAccess)



module.exports = router;