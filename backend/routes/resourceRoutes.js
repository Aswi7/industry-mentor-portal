
const express = require("express");
const Resource = require("../models/Resource");
const Session = require("../models/Session");
const { protect, mentorOnly } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const router = express.Router();

// Mentor uploads resource

router.post(
  "/",
  protect,
  mentorOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const resource = await Resource.create({
        title: req.body.title,
        description: req.body.description,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
        link: req.body.link || null,
        mentor: req.user._id,
      });

      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Students view resources from their mentors (only from accepted/completed sessions)
router.get("/", protect, async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all ACCEPTED or COMPLETED sessions for this student
    const sessions = await Session.find({
      student: studentId,
      status: { $in: ["ACCEPTED", "COMPLETED"] }
    });

    // Get mentor IDs from those sessions
    const mentorIds = sessions.map(session => session.mentor);

    // Return only resources from those mentors
    const resources = await Resource.find({ mentor: { $in: mentorIds } }).populate("mentor", "name");
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;   // ✅ VERY IMPORTANT