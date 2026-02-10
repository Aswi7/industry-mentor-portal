const express = require("express");
const router = express.Router();
const {
  protect,
  adminOnly,
  mentorOnly,
  studentOnly,
} = require("../middleware/authMiddleware");

// Any logged-in user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile accessed",
    user: req.user,
  });
});

// Admin only
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin dashboard" });
});

// Mentor only
router.get("/mentor", protect, mentorOnly, (req, res) => {
  res.json({ message: "Mentor dashboard" });
});

// Student only
router.get("/student", protect, studentOnly, (req, res) => {
  res.json({ message: "Student dashboard" });
});

module.exports = router;
