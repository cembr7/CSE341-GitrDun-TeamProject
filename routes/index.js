/* TESTING SWAGGER */
const express = require("express");
const router = express.Router();

/**
 * @route GET /user
 * @description Test swagger
 * @returns {object} 200
 * @returns {Error} 400
 */

router.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = router;
/* END TESTING SWAGGER */
