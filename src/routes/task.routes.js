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

router.post("/", createTask);

router.put("/:taskId", updateTask);

router.delete("/:taskId", deleteTask);

router.get("/", getTasks);

router.get("/priority", getTasksByPriority);

module.exports = router;
