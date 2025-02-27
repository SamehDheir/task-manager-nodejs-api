const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Send email notification
const sendNotification = async (email, username, task) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔔 Reminder: Upcoming Task",
      text: `Hello ${username},\n\nYou have an upcoming task: "${task.title}" due on ${task.dueDate}.\n\nMake sure to complete it on time!\n\nBest regards,\nTask Manager App`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Reminder sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
  }
};


module.exports = sendNotification;
