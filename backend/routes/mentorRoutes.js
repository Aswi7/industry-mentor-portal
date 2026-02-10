const express = require("express");
const router = express.Router();
const { protect, mentorOnly } = require("../middleware/authMiddleware");
const { updateMentorProfile, getMentorProfile } = require("../controllers/mentorController");

// GET own profile
router.get("/profile", protect, mentorOnly, getMentorProfile);

// PUT update profile
router.put("/profile", protect, mentorOnly, updateMentorProfile);

module.exports = router;
