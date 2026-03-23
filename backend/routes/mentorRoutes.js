const express = require("express");
const router = express.Router();
const { protect, mentorOnly, mentorRoleOnly } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const { 
  updateMentorProfile, 
  getMentorProfile,
  getMentorStats,
  getMentorSessions,
  getMentorMentees,
  getPendingRequests,
  uploadMentorProfilePicture,
  submitMentorForApproval
} = require("../controllers/mentorController");

// GET own profile
router.get("/profile", protect, mentorRoleOnly, getMentorProfile);

// PUT update profile
router.put("/profile", protect, mentorRoleOnly, updateMentorProfile);
router.post("/profile-picture", protect, mentorRoleOnly, upload.single("profilePicture"), uploadMentorProfilePicture);
router.put("/submit-for-approval", protect, mentorRoleOnly, submitMentorForApproval);

// GET mentor dashboard stats
router.get("/stats", protect, mentorOnly, getMentorStats);

// GET mentor's sessions
router.get("/sessions", protect, mentorOnly, getMentorSessions);

// GET mentor's mentees
router.get("/mentees", protect, mentorOnly, getMentorMentees);

// GET pending mentorship requests
router.get("/pending-requests", protect, mentorOnly, getPendingRequests);

module.exports = router;
