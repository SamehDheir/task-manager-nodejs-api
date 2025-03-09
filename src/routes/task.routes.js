const express = require("express");
const router = express.Router();
const {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByPriority,
  getTasksById,
} = require("../controllers/task.controller");
const { verifyToken } = require("../utils/generateToken");

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - priority
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Priority level of the task
 *         userId:
 *           type: string
 *           description: ID of the task owner
 *       example:
 *         id: "65e7d0f7d63b8c001f5e4c5a"
 *         title: "Complete project"
 *         description: "Finish the pending tasks for the client"
 *         priority: "high"
 *         userId: "65e7d0a1b12a9f001f5e4c5b"
 */

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: API endpoints related to tasks
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     description: Create a new task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request, missing required fields
 */
router.post("/", verifyToken, createTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     description: Update an existing task for the authenticated user
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to update
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found or not owned by the user
 */
router.put("/:taskId", verifyToken, updateTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     description: Delete a task for the authenticated user
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found or not owned by the user
 */
router.delete("/:taskId", verifyToken, deleteTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     description: Get all tasks for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns all tasks for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: No tasks found for the user
 */
router.get("/", verifyToken, getTasks);

/**
 * @swagger
 * /tasks/priority:
 *   get:
 *     summary: Get tasks by priority
 *     tags: [Tasks]
 *     description: Get tasks for the authenticated user filtered by priority
 *     parameters:
 *       - name: priority
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Priority of tasks to filter by
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns tasks filtered by priority
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get("/priority", verifyToken, getTasksByPriority);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     description: Get a specific task for the authenticated user
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the specific task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found or not owned by the user
 */
router.get("/:taskId", verifyToken, getTasksById);

module.exports = router;
