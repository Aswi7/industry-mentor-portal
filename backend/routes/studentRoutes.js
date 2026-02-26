const express = require("express");
const router = express.Router();
const { protect, studentOnly } = require("../middleware/authMiddleware");
const { 
  searchMentors,
  getStudentProfile,
  getStudentStats,
  getStudentSessions,
  getStudentMentors
} = require("../controllers/studentController");

// GET mentors by skill or domain
router.get("/mentors", protect, studentOnly, searchMentors);

// GET student profile
router.get("/profile", protect, studentOnly, getStudentProfile);

// GET student dashboard stats
router.get("/stats", protect, studentOnly, getStudentStats);

// GET student's sessions
router.get("/sessions", protect, studentOnly, getStudentSessions);

// GET student's mentors
router.get("/mentors-list", protect, studentOnly, getStudentMentors);

module.exports = router;
