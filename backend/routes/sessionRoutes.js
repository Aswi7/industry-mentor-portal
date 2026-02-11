const express = require("express");
const router = express.Router();
const { protect, studentOnly, mentorOnly } = require("../middleware/authMiddleware");
const { requestSession, acceptSession } = require("../controllers/sessionController");

// Student requests session
router.post("/request", protect, studentOnly, requestSession);

// Mentor accepts session
router.put("/accept/:sessionId", protect, mentorOnly, acceptSession);

module.exports = router;
