const express = require("express");
const fs = require("fs");
const path = require("path");
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
        type: req.body.type || "Document",
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
        link: req.body.link || null,
        mentor: req.user.id,
      });

      res.status(201).json(resource);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET resources
// - Mentor: own uploaded resources
// - Student: resources from mentors with ACCEPTED/COMPLETED sessions
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role === "MENTOR") {
      const resources = await Resource.find({ mentor: req.user.id }).populate("mentor", "name");
      return res.json(resources);
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Access denied" });
    }

    const studentId = req.user.id;

    const sessions = await Session.find({
      student: studentId,
      status: { $in: ["ACCEPTED", "COMPLETED"] }
    });

    const mentorIds = [...new Set(sessions.map((session) => session.mentor.toString()))];
    const resources = await Resource.find({ mentor: { $in: mentorIds } }).populate("mentor", "name");

    return res.json(resources);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Download a resource file
// - Mentor: own files only
// - Student: files from mentors with ACCEPTED/COMPLETED sessions
router.get("/:resourceId/download", protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (!resource.fileUrl) {
      return res.status(400).json({ message: "No file available for this resource" });
    }

    if (req.user.role === "MENTOR") {
      if (resource.mentor.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else if (req.user.role === "STUDENT") {
      const allowedSession = await Session.findOne({
        student: req.user.id,
        mentor: resource.mentor,
        status: { $in: ["ACCEPTED", "COMPLETED"] }
      });

      if (!allowedSession) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const fileName = path.basename(resource.fileUrl);
    const filePath = path.join(__dirname, "../uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    return res.download(filePath, fileName);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Mentor deletes own resource
router.delete("/:resourceId", protect, mentorOnly, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (resource.fileUrl) {
      const fileName = path.basename(resource.fileUrl);
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Resource.findByIdAndDelete(req.params.resourceId);
    return res.status(200).json({ message: "Resource deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
