const User = require("../models/User");
const Session = require("../models/Session");

// Get mentor profile
const getMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id).select("-password");
    res.status(200).json({ mentor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update mentor profile
const updateMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    const { skills, domain, bio, profilePicture } = req.body;

    if (skills) mentor.skills = skills;
    if (domain) mentor.domain = domain;
    if (bio) mentor.bio = bio;
    if (profilePicture) mentor.profilePicture = profilePicture;

    await mentor.save();

    const mentorResponse = mentor.toObject();
    delete mentorResponse.password;

    res.status(200).json({ mentor: mentorResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor dashboard stats
const getMentorStats = async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Get all sessions for this mentor
    const allSessions = await Session.find({ mentor: mentorId }).populate("student", "name email");

    // Count mentees (unique students)
    const menteeIds = new Set(allSessions.map(s => s.student._id.toString()));
    const menteesCount = menteeIds.size;

    // Count upcoming sessions (REQUESTED and ACCEPTED)
    const upcomingCount = allSessions.filter(s => 
      (s.status === "REQUESTED" || s.status === "ACCEPTED") && new Date(s.createdAt) > new Date(Date.now() - 7*24*60*60*1000)
    ).length;

    // Count pending requests (REQUESTED status)
    const pendingCount = allSessions.filter(s => s.status === "REQUESTED").length;

    // Count completed sessions
    const completedCount = allSessions.filter(s => s.status === "COMPLETED").length;

    res.status(200).json({
      stats: {
        mentees: menteesCount,
        upcoming: upcomingCount,
        pending: pendingCount,
        completed: completedCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor's sessions
const getMentorSessions = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const sessions = await Session.find({ mentor: mentorId })
      .populate("student", "name email skills domain")
      .sort({ createdAt: -1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor's mentees
const getMentorMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const sessions = await Session.find({ mentor: mentorId, status: { $in: ["ACCEPTED", "COMPLETED"] } })
      .populate("student", "name email skills domain bio");

    // Get unique mentees
    const menteeMap = new Map();
    sessions.forEach(session => {
      menteeMap.set(session.student._id.toString(), session.student);
    });

    const mentees = Array.from(menteeMap.values());

    res.status(200).json({ mentees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending mentorship requests
const getPendingRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const pendingRequests = await Session.find({ mentor: mentorId, status: "REQUESTED" })
      .populate("student", "name email skills domain bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ pendingRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  updateMentorProfile, 
  getMentorProfile,
  getMentorStats,
  getMentorSessions,
  getMentorMentees,
  getPendingRequests
};
