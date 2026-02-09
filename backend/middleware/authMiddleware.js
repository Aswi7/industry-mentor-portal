const jwt = require("jsonwebtoken");

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
const mentorOnly = (req, res, next) => {
  if (req.user && req.user.role === "MENTOR") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Mentor only",
    });
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
  mentorOnly,
  studentOnly,
};
