const Session = require("../models/Session");

const requestSession = async (req, res) => {
  try {
    const { mentorId, topic } = req.body;

    // Prevent duplicate requests from the same student to the same mentor for the same topic
    const existing = await Session.findOne({
      student: req.user.id,
      mentor: mentorId,
      topic,
      status: "REQUESTED"
    });

    if (existing) {
      return res.status(200).json({ message: "Session already requested", session: existing });
    }

    const session = await Session.create({
      student: req.user.id,
      mentor: mentorId,
      topic,
      status: "REQUESTED"
    });

    res.status(201).json({ message: "Session requested", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// CANCEL SESSION (student can cancel a pending request)
const cancelSession = async (req, res) => {
  try {
    console.log("cancelSession called by", req.user.id, "sessionId", req.params.sessionId);
    const session = await Session.findById(req.params.sessionId);
    console.log("found session", session);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.student.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "REQUESTED")
      return res.status(400).json({ message: "Only requested sessions can be canceled" });

    // delete any stray pending sessions for this student/mentor
    await Session.deleteMany({
      student: req.user.id,
      mentor: session.mentor,
      status: "REQUESTED"
    });

    res.status(200).json({ message: "Session request canceled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ACCEPT SESSION
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    session.status = "ACCEPTED";
    await session.save();

    res.json({ message: "Session accepted", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// REJECT SESSION
const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    session.status = "REJECTED";
    await session.save();

    res.status(200).json({ message: "Session rejected", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL SESSIONS FOR A MENTOR
const getMentorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentor: req.user.id });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ student: req.user.id })
      .populate("mentor", "name email")
      .populate("student", "name email");

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// COMPLETE SESSION
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "ACCEPTED")
      return res.status(400).json({ message: "Only accepted sessions can be completed" });

    session.status = "COMPLETED";
    await session.save();

    res.status(200).json({ message: "Session completed", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




// EXPORT ALL
module.exports = {
  requestSession,
  acceptSession,
  rejectSession,
  cancelSession,
  getMentorSessions,
  getStudentSessions,
  completeSession
};
