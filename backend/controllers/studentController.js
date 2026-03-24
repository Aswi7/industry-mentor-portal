const User = require("../models/User");
const Session = require("../models/Session");
const Resource = require("../models/Resource");

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

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { studentSkills, studentDomain, bio, profilePicture } = req.body;

    if (studentSkills) student.studentSkills = studentSkills;
    if (studentDomain) student.studentDomain = studentDomain;
    if (bio) student.bio = bio;
    if (profilePicture) student.profilePicture = profilePicture;

    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(200).json({ student: studentResponse });
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
    const upcomingCount = allSessions.filter(
      (s) => s.status === "REQUESTED" || s.status === "ACCEPTED"
    ).length;

    // Count completed sessions
    const completedSessions = allSessions.filter(s => s.status === "COMPLETED");
    const completedCount = completedSessions.length;

    const eligibleSessions = await Session.find({
      student: studentId,
      status: { $in: ["ACCEPTED", "COMPLETED"] }
    }).select("mentor");

    const mentorIds = [...new Set(eligibleSessions.map((s) => s.mentor.toString()))];
    const resourcesCount = mentorIds.length
      ? await Resource.countDocuments({ mentor: { $in: mentorIds } })
      : 0;

    // For skills, get from user profile
    const student = await User.findById(studentId);
    const studentSkills = student?.studentSkills || [];
    
    // Calculate sessions per skill
    const skillDetails = studentSkills.map(skill => {
      const count = completedSessions.filter(s => 
        s.topic.toLowerCase().includes(skill.toLowerCase())
      ).length;
      return { skill, sessions: count };
    });

    res.status(200).json({
      stats: {
        upcoming: upcomingCount,
        completed: completedCount,
        resources: resourcesCount,
        skills: studentSkills.length,
        skillDetails: skillDetails
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
  updateStudentProfile,
  getStudentStats,
  getStudentSessions,
  getStudentMentors
};
