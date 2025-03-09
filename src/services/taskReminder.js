const cron = require("node-cron");
const Task = require("../models/task.model");
const sendNotification = require("./notification.service");
const moment = require("moment");

console.log("🚀 Task Reminder Service Started...");

// Run the cron job every hour
cron.schedule("0 * * * *", async () => {
  console.log(
    "🕒 Task reminder job started at:",
    moment().format("YYYY-MM-DD HH:mm:ss")
  );

  try {
    const now = new Date();

    // Fetch tasks that haven't been notified yet and are approaching reminder time
    const tasks = await Task.find({ notified: false })
      .populate("userId", "email username")
      .exec();

    console.log(`🔍 Found ${tasks.length} tasks to check.`);

    if (tasks.length === 0) {
      console.log("✅ No upcoming tasks.");
      return;
    }

    for (let task of tasks) {
      // Calculate reminder time based on the user's preference
      const reminderTimeInMs = task.reminderTime * 60 * 60 * 1000;
      const reminderTime = new Date(task.dueDate.getTime() - reminderTimeInMs);

      console.log(`⏰ Task "${task.title}" reminder time:`, reminderTime);
      console.log(`🕒 Current time:`, now);

      // Check if the current time is equal to or greater than the reminder time
      if (now >= reminderTime) {
        const { email, username } = task.userId;

        console.log(`🚀 Sending notification for task: ${task.title}`);

        // Send notification
        await sendNotification(email, username, task);

        // Mark the task as notified to prevent repeated notifications
        task.notified = true;
        await task.save();
        console.log(`🔔 Task "${task.title}" marked as notified.`);
      }
    }

    console.log(`✅ Checked ${tasks.length} tasks for reminders.`);
  } catch (error) {
    console.error("❌ Error in task reminder job:", error.message);
  }
});
