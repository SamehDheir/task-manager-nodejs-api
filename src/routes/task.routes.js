// src/routes/task.routes.js
const express = require("express");
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByPriority,
} = require("../controllers/task.controller");
const { verifyToken } = require("../utils/generateToken");

router.post("/", verifyToken, createTask);

router.put("/:taskId", verifyToken, updateTask);

router.delete("/:taskId", verifyToken, deleteTask);

router.get("/", verifyToken, getTasks);

router.get("/priority", verifyToken, getTasksByPriority);

module.exports = router;
