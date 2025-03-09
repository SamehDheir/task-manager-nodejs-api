const Task = require("../models/task.model");

// Create a new Task
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task with title, description, dueDate, priority, and reminderTime.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: "medium"
 *               reminderTime:
 *                 type: integer
 *                 description: Time in hours before the due date to remind
 *             required:
 *               - title
 *               - dueDate
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 task:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Complete project"
 *                     description:
 *                       type: string
 *                       example: "Complete the project by end of this week."
 *                     dueDate:
 *                       type: string
 *                       example: "2025-03-12T10:00:00Z"
 *                     priority:
 *                       type: string
 *                       example: "medium"
 *                     reminderTime:
 *                       type: integer
 *                       example: 24
 *       400:
 *         description: Title is required
 */

exports.createTask = async (req, res, next) => {
  const { title, description, dueDate, priority, reminderTime } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const newTask = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      userId,
      priority: priority || "medium",
      reminderTime: reminderTime || 24,
    });

    await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    next(error);
  }
};

// Update task
/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update an existing task
 *     description: Update an existing task with new values for title, description, dueDate, status, priority, and reminderTime.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               reminderTime:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *                 task:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Complete project"
 *                     description:
 *                       type: string
 *                       example: "Complete the project by end of this week."
 *                     dueDate:
 *                       type: string
 *                       example: "2025-03-12T10:00:00Z"
 *                     status:
 *                       type: string
 *                       example: "in-progress"
 *       404:
 *         description: Task not found
 *       400:
 *         description: Invalid dueDate format
 */
exports.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, dueDate, status, priority, reminderTime } = req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update only fields that are submitted
    if (title) task.title = title;
    if (description) task.description = description;
    
    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid dueDate format. Please provide a valid date." });
      }
      task.dueDate = parsedDate;
    }

    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (reminderTime !== undefined) task.reminderTime = reminderTime;

    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    next(error);
  }
};

// Delete task
/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete an existing task
 *     description: Delete a task by its ID.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: The ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found or not authorized
 */
exports.deleteTask = async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a user

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for a user
 *     description: Retrieve all tasks for the authenticated user with optional filters for title, dueDate, status, and priority.
 *     parameters:
 *       - in: query
 *         name: title
 *         description: Title to search for
 *         schema:
 *           type: string
 *       - in: query
 *         name: dueDate
 *         description: Filter tasks by due date
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Filter tasks by status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *       - in: query
 *         name: priority
 *         description: Filter tasks by priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Returns the list of tasks for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Complete project"
 *                       description:
 *                         type: string
 *                         example: "Complete the project by end of this week."
 *                       dueDate:
 *                         type: string
 *                         example: "2025-03-12T10:00:00Z"
 *                       priority:
 *                         type: string
 *                         example: "medium"
 *                       reminderTime:
 *                         type: integer
 *                         example: 24
 *       404:
 *         description: No tasks found matching the filter criteria
 */
exports.getTasks = async (req, res, next) => {
  const userId = req.user.id;

  const { title, dueDate, status, priority } = req.query;

  try {
    const filter = { userId };

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (dueDate) {
      filter.dueDate = new Date(dueDate);
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    // Retrieve tasks based on filter
    const tasks = await Task.find(filter);

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found matching the filter criteria" });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Get task by priority
/**
 * @swagger
 * /tasks/priority:
 *   get:
 *     summary: Get tasks by priority
 *     description: Retrieves tasks filtered by priority.
 *     parameters:
 *       - name: priority
 *         in: query
 *         required: true
 *         description: Filter tasks by priority (low, medium, high)
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: A list of tasks filtered by priority
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       404:
 *         description: No tasks found
 *       500:
 *         description: Internal server error
 */
exports.getTasksByPriority = async (req, res, next) => {
  const userId = req.user.id;
  const { priority } = req.query;

  try {
    // If a certain priority is specified, we only search for tasks with that priority
    const filter = priority ? { userId, priority } : { userId };

    const tasks = await Task.find(filter);

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Get task by id
/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task by ID
 *     description: Retrieves a task by its ID.
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: The ID of the task
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
exports.getTasksById = async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};
