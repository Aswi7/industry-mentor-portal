const User = require("../models/User");

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

module.exports = { updateMentorProfile, getMentorProfile };
