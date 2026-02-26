const express = require("express");
const router = express.Router();
const { protect, mentorOnly } = require("../middleware/authMiddleware");
const { 
  updateMentorProfile, 
  getMentorProfile,
  getMentorStats,
  getMentorSessions,
  getMentorMentees,
  getPendingRequests
} = require("../controllers/mentorController");

// GET own profile
router.get("/profile", protect, mentorOnly, getMentorProfile);

// PUT update profile
router.put("/profile", protect, mentorOnly, updateMentorProfile);

// GET mentor dashboard stats
router.get("/stats", protect, mentorOnly, getMentorStats);

// GET mentor's sessions
router.get("/sessions", protect, mentorOnly, getMentorSessions);

// GET mentor's mentees
router.get("/mentees", protect, mentorOnly, getMentorMentees);

// GET pending mentorship requests
router.get("/pending-requests", protect, mentorOnly, getPendingRequests);

module.exports = router;
