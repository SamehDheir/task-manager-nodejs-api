const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/generateToken");
const User = require("../models/user.model");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 604800000,
    });
    if (!token) {
      return res.status(500).json({ message: "Failed to generate token" });
    }

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, Email and password are required" });
    }
    // Check if there is a user with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
