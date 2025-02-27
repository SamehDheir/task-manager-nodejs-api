const cron = require("node-cron");
const Task = require("../models/task.model");
const sendNotification = require("./notification.service");
const moment = require("moment");

console.log("🚀 Task Reminder Service Started...");

// تشغيل الكرون كل ساعة
cron.schedule("0 * * * *", async () => {
  console.log(
    "🕒 Task reminder job started at:",
    moment().format("YYYY-MM-DD HH:mm:ss")
  );

  try {
    const now = new Date();

    // البحث عن المهام التي لم يتم إرسال إشعار لها بعد
    const tasks = await Task.find({ notified: false }).populate(
      "userId",
      "email username"
    );

    console.log(`🔍 Found ${tasks.length} tasks to check.`); // عرض عدد المهام التي تحتاج إشعارًا

    if (tasks.length === 0) {
      console.log("✅ No upcoming tasks.");
      return;
    }

    for (let task of tasks) {
      // حساب وقت التذكير بناءً على الوقت المحدد من قبل المستخدم
      const reminderTimeInMs = task.reminderTime * 60 * 60 * 1000;
      const reminderTime = new Date(task.dueDate.getTime() - reminderTimeInMs);

      console.log(`⏰ Task "${task.title}" reminder at:`, reminderTime);
      console.log(`🕒 Current time:`, now);

      // Check if the current time is equal to or greater than the reminder time
      if (now >= reminderTime) {
        const { email, username } = task.userId;

        console.log(`🚀 Sending notification for task: ${task.title}`);

        // Send notification
        await sendNotification(email, username, task);

        // Update the notification status so that it is not sent again
        task.notified = true;
        await task.save();
        console.log(`🔔 Task "${task.title}" marked as notified.`);
      }
    }

    console.log(`✅ Checked ${tasks.length} tasks for reminders.`);
  } catch (error) {
    console.error("❌ Error in task reminder job:", error);
  }
});
