const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { approveMentor, getPendingMentors, getAllUsers } = require("../controllers/adminController");

// GET all users
router.get("/users", protect, adminOnly, getAllUsers);

// GET all pending mentors
router.get("/mentors/pending", protect, adminOnly, getPendingMentors);

// PUT approve a mentor
router.put("/mentors/approve/:mentorId", protect, adminOnly, approveMentor);

module.exports = router;
