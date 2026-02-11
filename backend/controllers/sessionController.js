const Session = require("../models/Session");

const requestSession = async (req, res) => {
  try {
    const { mentorId, topic } = req.body;

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
  getMentorSessions,
  getStudentSessions,
  completeSession
};
