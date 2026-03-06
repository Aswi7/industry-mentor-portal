const User = require("../models/User");
const Session = require("../models/Session");

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

// Reject a mentor
const rejectMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await User.findById(mentorId);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    if (mentor.role !== "MENTOR") {
      return res.status(400).json({ message: "User is not a mentor" });
    }

    mentor.mentorStatus = "REJECTED";
    await mentor.save();

    res.status(200).json({ message: "Mentor rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users for admin users page
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all sessions for admin sessions page
const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({})
      .populate("mentor", "name email")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPendingMentors, approveMentor, rejectMentor, getAllUsers, getAllSessions };
