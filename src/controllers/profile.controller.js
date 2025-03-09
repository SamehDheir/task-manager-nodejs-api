const Profile = require("../models/profile.model");
const User = require("../models/user.model");
const { cloudinary } = require("../config/cloudinary");

// ✅ Get Profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate(
      "userId",
      "username email role"
    );
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// ✅ Delete Profile, User, and Avatar from Cloudinary
const deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete avatar image from Cloudinary if it exists
    if (profile.avatar) {
      const publicId = profile.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`profile_avatars/${publicId}`);
    }

    // Delete resume from Cloudinary if it exists
    if (profile.resume) {
      const publicId = profile.resume.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `profile_resumes_taskManager/${publicId}`,
        {
          resource_type: "raw", // Important to delete non-image files
        }
      );
    }

    // Delete the user from the database
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Profile and user deleted" });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Profile Data
const updateProfile = async (req, res, next) => {
  try {
    const { phone, bio, jobTitle, skills, resume, settings } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { phone, bio, jobTitle, skills, resume, settings },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile updated", profile });
  } catch (err) {
    next(err);
  }
};

// ✅ Upload Avatar Image
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ✅ Check that the file is an image
    if (!/^image\/(jpeg|jpg|png|gif|svg)$/.test(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only images are allowed." });
    }

    // ✅ Ensure old avatar image is deleted from Cloudinary if it exists
    if (profile.avatar) {
      try {
        const publicId = profile.avatar.match(/\/v\d+\/(.+)\./)[1]; 
        console.log("Public ID to delete:", publicId);

        const response = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary delete response:", response);
      } catch (err) {
        console.error("Error deleting old avatar:", err);
        return res.status(500).json({ message: "Error deleting old avatar" });
      }
    }

    // ✅ Upload new avatar to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_avatars",
      public_id: `avatar_${req.user.id}`,
      overwrite: true,
    });

    // ✅ Update avatar URL in the database
    profile.avatar = result.secure_url;
    await profile.save();

    return res.json({ message: "Avatar updated", avatar: profile.avatar });
  } catch (err) {
    console.error("Error updating avatar:", err);
    return res.status(500).json({ message: "Error updating avatar" });
  }
};

// ✅ Upload Resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ✅ Check that the file is a PDF or DOCX
    if (!/\.pdf$|\.docx?$/.test(req.file.originalname)) {
      return res
        .status(400)
        .json({
          message: "Invalid file type. Only PDF and DOCX files are allowed.",
        });
    }

    // Delete old resume file from Cloudinary if it exists
    if (profile.resume) {
      const publicId = profile.resume.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `profile_resumes_taskManager/${publicId}`,
        {
          resource_type: "raw", // Important to delete non-image files
        }
      );
    }

    // Upload new resume file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_resumes_taskManager",
      resource_type: "raw", // Important to upload non-image files like PDF, DOCX
      access_mode: "public", // Ensure public access
      use_filename: true, // Use the original filename
      unique_filename: false, // Don't add a random UUID to the filename
    });
    console.log("Uploaded File URL:", result.secure_url);

    // Save new resume URL in the profile
    profile.resume = result.secure_url;
    await profile.save();

    res.json({ message: "Resume uploaded", resume: profile.resume });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  uploadResume,
};
