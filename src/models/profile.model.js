const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: "https://default-avatar.com/default.png",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    skills: [String],
    resume: String,
    settings: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);
module.exports = Profile;
