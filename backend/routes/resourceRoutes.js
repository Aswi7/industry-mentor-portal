const express = require("express");
const Resource = require("../models/Resource");
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

// Students view all resources
router.get("/", protect, async (req, res) => {
  try {
    const resources = await Resource.find().populate("mentor", "name");
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;   // ✅ VERY IMPORTANT