const express = require("express");
const router = express.Router();

const { protect, studentOnly, mentorOnly } = require("../middleware/authMiddleware");

const { 
  requestSession, 
  acceptSession, 
  rejectSession, 
  getMentorSessions, 
  completeSession
} = require("../controllers/sessionController");


// Student requests session
router.post("/request", protect, studentOnly, requestSession);

// Mentor accepts session
router.put("/accept/:sessionId", protect, mentorOnly, acceptSession);

// Mentor rejects session
router.put("/reject/:sessionId", protect, mentorOnly, rejectSession);

// Mentor views all their sessions
router.get("/mentor", protect, mentorOnly, getMentorSessions);
// complete session
router.put("/complete/:sessionId", protect, mentorOnly, completeSession);


module.exports = router;
