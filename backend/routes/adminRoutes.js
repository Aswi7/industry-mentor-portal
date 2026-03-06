const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  approveMentor,
  rejectMentor,
  getPendingMentors,
  getAllUsers,
  getAllSessions,
} = require("../controllers/adminController");

// GET all users
router.get("/users", protect, adminOnly, getAllUsers);

// GET all sessions
router.get("/sessions", protect, adminOnly, getAllSessions);

// GET all pending mentors
router.get("/mentors/pending", protect, adminOnly, getPendingMentors);

// PUT approve a mentor
router.put("/mentors/approve/:mentorId", protect, adminOnly, approveMentor);

// PUT reject a mentor
router.put("/mentors/reject/:mentorId", protect, adminOnly, rejectMentor);

module.exports = router;
