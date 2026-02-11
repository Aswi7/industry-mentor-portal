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


// ✅ ADD THIS FUNCTION
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Make sure only assigned mentor accepts
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    session.status = "ACCEPTED";
    await session.save();

    res.json({
      message: "Session accepted",
      session
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ EXPORT BOTH
module.exports = { requestSession, acceptSession };
