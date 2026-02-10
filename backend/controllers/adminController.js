const User = require("../models/User");

// Get all pending mentors
const getPendingMentors = async (req, res) => {
  try {
    const pendingMentors = await User.find({ role: "MENTOR", mentorStatus: "PENDING" });
    res.status(200).json({ pendingMentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a mentor
const approveMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await User.findById(mentorId);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    if (mentor.role !== "MENTOR") {
      return res.status(400).json({ message: "User is not a mentor" });
    }

    // Update mentor status
    mentor.mentorStatus = "VERIFIED"; // Or "ACTIVE" if you want
    await mentor.save();

    res.status(200).json({ message: "Mentor approved successfully", mentor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPendingMentors, approveMentor };
