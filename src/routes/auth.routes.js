const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const {
  login,
  register,
  dashboard,
  logout,
  requestResetCode,
  resetPassword,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../utils/generateToken");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         googleId:
 *           type: string
 *           description: The unique Google ID of the user, if they used Google login
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user (only required if not using Google login)
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           description: The role of the user
 *       example:
 *         id: "65e7d0f7d63b8c001f5e4c5a"
 *         googleId: "google12345"
 *         username: "JohnDoe"
 *         email: "johndoe@example.com"
 *         password: "password123"
 *         role: "user"
 */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "JWT_TOKEN"
 *       400:
 *         description: Missing email or password
 *       403:
 *         description: Invalid credentials or user not registered
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       400:
 *         description: Email or username already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/dashboard:
 *   get:
 *     summary: Get user dashboard (protected)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       401:
 *         description: Unauthorized access (missing or invalid token)
 *       404:
 *         description: User not found
 */
router.get("/dashboard", verifyToken, dashboard);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect after authentication
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      res.redirect("/profile");
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.status(500).json({
        message: "Authentication failed, please try again.",
      });
    }
  }
);

/**
 * @swagger
 * /auth/send-reset-code:
 *   post:
 *     summary: Sends a reset code to the user's email (Only if user exists).
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Reset code sent successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to send email.
 */

router.post("/send-reset-code", verifyToken, requestResetCode);

/**
 * @swagger
 * /auth/verify-reset-code:
 *   post:
 *     summary: Verifies the reset code and updates the password (Only if user exists).
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "NewStrongPassword123!"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Invalid or expired code.
 *       404:
 *         description: User not found.
 */
router.post("/verify-reset-code", verifyToken, resetPassword);

module.exports = router;
