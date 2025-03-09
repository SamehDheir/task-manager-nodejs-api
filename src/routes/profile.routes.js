const express = require("express");
const { verifyToken } = require("../utils/generateToken");
const {
  getProfile,
  deleteProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
} = require("../controllers/profile.controller");
const uploadMiddleware = require("../services/upload.service");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The unique identifier of the user associated with this profile
 *         phone:
 *           type: string
 *           description: User's phone number
 *           example: "+1234567890"
 *         avatar:
 *           type: string
 *           description: URL to the user's avatar image
 *           example: "https://default-avatar.com/default.png"
 *         bio:
 *           type: string
 *           description: Short biography of the user
 *           example: "Software engineer with a passion for web development"
 *         jobTitle:
 *           type: string
 *           description: User's job title
 *           example: "Frontend Developer"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user's skills
 *           example: ["JavaScript", "React", "Node.js"]
 *         resume:
 *           type: string
 *           description: URL to the user's resume (if available)
 *           example: "https://resume-link.com/johndoe"
 *         settings:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: ["light", "dark"]
 *               description: User's preferred theme
 *               example: "dark"
 *             notifications:
 *               type: boolean
 *               description: Whether the user wants to receive notifications
 *               example: true
 *       example:
 *         userId: "65e8a2f3c9b7ab001f2d4c6d"
 *         phone: "+1234567890"
 *         avatar: "https://default-avatar.com/default.png"
 *         bio: "Software engineer with a passion for web development"
 *         jobTitle: "Frontend Developer"
 *         skills: ["JavaScript", "React", "Node.js"]
 *         resume: "https://resume-link.com/johndoe"
 *         settings:
 *           theme: "dark"
 *           notifications: true
 */


/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: API endpoints related to user profile
 */

/**
 * @swagger
 * /profile/upload-avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file format or size
 *       401:
 *         description: Unauthorized
 */
router.post("/upload-avatar", verifyToken, uploadMiddleware, uploadAvatar);

/**
 * @swagger
 * /profile/upload-resume:
 *   post:
 *     summary: Upload user resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file format or size
 *       401:
 *         description: Unauthorized
 */
router.post("/upload-resume", verifyToken, uploadMiddleware, uploadResume);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 */
router.get("/", verifyToken, getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New full name
 *               email:
 *                 type: string
 *                 description: New email address
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.put("/", verifyToken, updateProfile);

/**
 * @swagger
 * /profile:
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not allowed to delete this profile
 */
router.delete("/", verifyToken, deleteProfile);

module.exports = router;
