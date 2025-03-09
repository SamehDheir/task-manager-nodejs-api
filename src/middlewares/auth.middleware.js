const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ message: "Session expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid or malformed token." });
  }
};

module.exports = authMiddleware;
