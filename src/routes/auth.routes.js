const express = require("express");

const { login, register } = require("../controllers/auth.controller");
const { verifyToken } = require("../utils/generateToken");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/verify-token", verifyToken);

module.exports = router;
