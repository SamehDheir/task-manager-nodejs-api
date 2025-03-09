const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150, // ✅ Prevents excessively long titles
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    dueDate: {
      type: Date,
      required: false,
      index: true, // 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, //
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"], 
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    reminderTime: {
      type: Number,
      default: 24, // Default reminder: 24 hours before due date
      min: 0, // ✅ Prevents negative values
    },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ dueDate: 1 }, { expireAfterSeconds: 0 });

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
