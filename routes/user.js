const express = require("express");
const auth = require("../middleware/auth");
const { createUser, loginUser } = require("../controllers/user");
const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(loginUser);

module.exports = router;
