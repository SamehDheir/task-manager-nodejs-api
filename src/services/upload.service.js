const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_avatars_taskManager", // Folder in Cloudinary
    format: async (req, file) => "png", // Convert all images to PNG
    public_id: (req, file) => `avatar_${Date.now()}`, // Unique public ID
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Resize the image
  },
});

// File validation: only allow specific types (e.g., .jpg, .jpeg, .png)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid = allowedTypes.test(file.mimetype);
  if (isValid) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Invalid file type. Only JPG, JPEG, and PNG are allowed."),
      false
    );
  }
};

// Set file size limit (max 2MB) and file validation
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
  fileFilter,
});

// Use upload middleware in your route and handle errors directly
const uploadMiddleware = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      // Handle error
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

module.exports = uploadMiddleware;
