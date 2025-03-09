const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Ensure this is a secure environment variable
    pass: process.env.EMAIL_PASS, // Ensure this is a secure environment variable
  },
});

// Send email notification
const sendNotification = async (email, username, task) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔔 Reminder: Upcoming Task",
      html: `
        <h3>Hello ${username},</h3>
        <p>You have an upcoming task: <strong>"${task.title}"</strong></p>
        <p>Due on: <strong>${new Date(
          task.dueDate
        ).toLocaleString()}</strong></p>
        <p>Make sure to complete it on time!</p>
        <br>
        <p>Best regards,<br>Task Manager App</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`📩 Reminder sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send notification:", error.message);
  }
};

module.exports = sendNotification;
