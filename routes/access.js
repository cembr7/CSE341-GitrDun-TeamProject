// routes/access.js
const router = require("express").Router();
const requireAuth = require("../middleware/requireauth");
const accessController = require("../controllers/accessController");

//router.use(requireAuth);

// List access grants (for the signed-in user)
router.get(
    "/access",
    /* #swagger.tags = ['Access'] */
    /* #swagger.summary = 'Displays Lists the User has been given access to' */ 
    accessController.displayAccess);

// Give another user access to a list
router.post(
    "/access",
    /* #swagger.tags = ['Access'] */
    /* #swagger.summary = 'Grants a User Access to a List you Own' */ 
    accessController.giveAccess);

// Update role for an existing grant (by grant id)
router.patch(
    "/access/:id",
    /* #swagger.tags = ['Access'] */
    /* #swagger.summary = 'Updates Preivous Access Entry' */ 
    accessController.updateAccess);

// Revoke access (by grant id)
router.delete(
    "/access/:id",
    /* #swagger.tags = ['Access'] */
    /* #swagger.summary = 'Revokes Access of a Given User to a List you own' */  
    accessController.revokeAccess);

module.exports = router;