const Task = require("../models/task.model");

// Create a new Task
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
      dueDate,
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
exports.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, dueDate, status, priority, reminderTime } =
    req.body;
  const userId = req.user.id;

  try {
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update only fields that are submitted
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.reminderTime =
      reminderTime !== undefined ? reminderTime : task.reminderTime;

    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    next(error);
  }
};

// Delete task
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
