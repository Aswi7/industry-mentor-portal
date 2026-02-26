const User = require("../models/User");
const Session = require("../models/Session");

// Search mentors
const searchMentors = async (req, res) => {
  try {
    const { skill, domain } = req.query;

    let filter = {
      role: "MENTOR",
      mentorStatus: "VERIFIED"
    };

    if (skill) {
      filter.skills = { $in: [skill] };
    }

    if (domain) {
      filter.domain = domain;
    }

    const mentors = await User.find(filter).select("-password");

    res.status(200).json({ mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("-password");
    res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student dashboard stats
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all sessions for this student
    const allSessions = await Session.find({ student: studentId });

    // Count upcoming sessions (REQUESTED and ACCEPTED)
    const upcomingCount = allSessions.filter(s => 
      (s.status === "REQUESTED" || s.status === "ACCEPTED") && new Date(s.createdAt) > new Date(Date.now() - 7*24*60*60*1000)
    ).length;

    // Count completed sessions
    const completedCount = allSessions.filter(s => s.status === "COMPLETED").length;

    // For resources, get total from database (placeholder for now)
    const resourcesCount = 3;

    // For skills, get from user profile
    const student = await User.findById(studentId);
    const skillsTracked = student?.skills?.length || 5;

    res.status(200).json({
      stats: {
        upcoming: upcomingCount,
        completed: completedCount,
        resources: resourcesCount,
        skills: skillsTracked
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student's sessions
const getStudentSessions = async (req, res) => {
  try {
    const studentId = req.user.id;

    const sessions = await Session.find({ student: studentId })
      .populate("mentor", "name email skills domain bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get student's mentors
const getStudentMentors = async (req, res) => {
  try {
    const studentId = req.user.id;

    const sessions = await Session.find({ student: studentId, status: { $in: ["ACCEPTED", "COMPLETED"] } })
      .populate("mentor", "name email skills domain bio");

    // Get unique mentors
    const mentorMap = new Map();
    sessions.forEach(session => {
      mentorMap.set(session.mentor._id.toString(), session.mentor);
    });

    const mentors = Array.from(mentorMap.values());

    res.status(200).json({ mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  searchMentors,
  getStudentProfile,
  getStudentStats,
  getStudentSessions,
  getStudentMentors
};
