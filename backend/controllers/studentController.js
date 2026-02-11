const User = require("../models/User");

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

module.exports = { searchMentors };
