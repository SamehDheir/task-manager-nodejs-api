const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  
  
};

exports.verifyToken = (req, res) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.json({ user: decoded });
  });
};