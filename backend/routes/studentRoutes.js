const express = require("express");
const router = express.Router();
const { protect, studentOnly } = require("../middleware/authMiddleware");
const { searchMentors } = require("../controllers/studentController");

// GET mentors by skill or domain
router.get("/mentors", protect, studentOnly, searchMentors);

module.exports = router;
