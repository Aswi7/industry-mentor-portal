const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔐 Protect routes – checks if user is logged in
 */
const protect = (req, res, next) => {
  let token;

  // 1️⃣ Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2️⃣ Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 3️⃣ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4️⃣ Attach decoded user data to request
      req.user = decoded;

      // 5️⃣ Allow request to continue
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not authorized, token invalid",
      });
    }
  }

  // 6️⃣ If token not found
  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

/**
 * 👑 Admin-only access
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Admin only",
    });
  }
};

/**
 * 🧑‍🏫 Mentor-only access
 */
const mentorRoleOnly = (req, res, next) => {
  if (req.user && req.user.role === "MENTOR") {
    return next();
  }
  return res.status(403).json({
    message: "Access denied: Mentor only",
  });
};

const mentorOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== "MENTOR") {
    return res.status(403).json({
      message: "Access denied: Mentor only",
    });
  }

  try {
    const mentor = await User.findById(req.user.id).select("mentorStatus");
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (!["VERIFIED", "ACTIVE"].includes(mentor.mentorStatus)) {
      return res.status(403).json({
        message: "Mentor approval pending",
        mentorStatus: mentor.mentorStatus,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🎓 Student-only access
 */
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "STUDENT") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Student only",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  mentorRoleOnly,
  mentorOnly,
  studentOnly,
};
