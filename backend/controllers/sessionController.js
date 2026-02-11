const Session = require("../models/Session");

const requestSession = async (req, res) => {
  try {
    const { mentorId, topic } = req.body;

    const session = await Session.create({
      student: req.user.id,
      mentor: mentorId,
      topic
    });

    res.status(201).json({ message: "Session requested", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { requestSession };
