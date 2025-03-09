const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Profile = require("./profile.model");
const { errorMonitor } = require("nodemailer/lib/xoauth2");

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true, default: undefined },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create an automatic profile when saving a new user
userSchema.post("save", async function (doc, next) {
  try {
    const existingProfile = await Profile.findOne({ userId: doc._id });
    if (!existingProfile) {
      await new Profile({ userId: doc._id }).save();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      console.log("Password not modified.");
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(password);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
