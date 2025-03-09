const crypto = require("crypto");
const transporter = require("../config/email");

const verificationCodes = new Map();

async function sendResetCode(email) {
  const resetCode = crypto.randomInt(100000, 999999).toString();
  verificationCodes.set(email, {
    code: resetCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  console.log(`🔹 Reset code for ${email}: ${resetCode}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔒 Reset Your Password",
    html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">🔑 Password Reset Request</h2>
                <p style="font-size: 16px; color: #555;">You have requested to reset your password.</p>
                <p style="font-size: 20px; font-weight: bold; color: #007BFF;">Your reset code: <span style="color: #d9534f;">${resetCode}</span></p>
                <p style="color: #888;">This code is valid for 10 minutes.</p>
                <p style="font-size: 14px; color: #aaa;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);

  // Delete code after 10 minutes automatically
    setTimeout(() => verificationCodes.delete(email), 10 * 60 * 1000);
}


function verifyCode(email, code) {
  const entry = verificationCodes.get(email);
  if (!entry) return false; // لا يوجد كود لهذا البريد

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email);
    return false; // الكود منتهي الصلاحية
  }

  return entry.code === code;
}



function removeCode(email) {
  verificationCodes.delete(email);
}

module.exports = { sendResetCode, verifyCode, removeCode };
