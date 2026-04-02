const express = require("express");
const router = express.Router();

const { protect, studentOnly, mentorOnly } = require("../middleware/authMiddleware");

const { 
  createSessionByMentor,
  mentorCancelSession,
  requestSession, 
  acceptSession, 
  rejectSession, 
  cancelSession,
  getMentorSessions, 
  getOpenSessionsForStudents,
  completeSession,
  refreshSessionMeetingLink
} = require("../controllers/sessionController");


// Student requests session
router.post("/request", protect, studentOnly, requestSession);

// Mentor creates open session
router.post("/mentor-create", protect, mentorOnly, createSessionByMentor);
router.delete("/mentor-cancel/:sessionId", protect, mentorOnly, mentorCancelSession);
router.post("/refresh-link/:sessionId", protect, mentorOnly, refreshSessionMeetingLink);

// Students view all open sessions created by mentors
router.get("/open", protect, studentOnly, getOpenSessionsForStudents);

// Mentor accepts session
router.put("/accept/:sessionId", protect, mentorOnly, acceptSession);

// Student cancels their own pending request
router.delete("/cancel/:sessionId", protect, studentOnly, cancelSession);

// Mentor rejects session
router.put("/reject/:sessionId", protect, mentorOnly, rejectSession);

// Mentor views all their sessions
router.get("/mentor", protect, mentorOnly, getMentorSessions);
// complete session
router.put("/complete/:sessionId", protect, mentorOnly, completeSession);


module.exports = router;
