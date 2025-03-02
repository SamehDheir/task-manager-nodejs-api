const express = require("express");

const {
  login,
  register,
  dashboard,
  logout,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../utils/generateToken");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/dashboard", verifyToken, dashboard);
router.post("/logout", logout);

module.exports = router;
