const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const User = require("../models/user.model");
const Profile = require("../models/profile.model");
const {
  sendResetCode,
  verifyCode,
  removeCode,
} = require("../services/resetPassword.service");

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Validate request data
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //Find the user by email and include the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    //Verify the password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(403).json({ message: "Invalid credentials" });
    }

    //Generate authentication token
    const token = generateToken(user);
    if (!token) {
      return res.status(500).json({ message: "Failed to generate token" });
    }

    //Set token as a secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: process.env.JWT_COOKIE_EXPIRES || 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    //Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    //Create a new user
    user = new User({ username, email, password });
    await user.save();

    //Create a profile for the user
    const profile = new Profile({ userId: user._id });
    await profile.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    next(err);
  }
};

// Get user dashboard data
exports.dashboard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Request password reset code
exports.requestResetCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    //Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    //Send the reset code
    await sendResetCode(email);
    res.json({ message: "Reset code sent successfully." });
  } catch (err) {
    next(err);
  }
};

// Reset password using verification code
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    //Ensure user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    //Verify the reset code
    if (!verifyCode(email, code)) {
      return res.status(400).json({ error: "Invalid or expired code." });
    }

    //Ensure password meets security standards
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    //Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    console.log(user.password);

    await user.save();

    //Remove the used reset code
    removeCode(email);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};
