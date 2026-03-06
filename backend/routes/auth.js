const express = require("express");
const {
  registerUser,
  loginUser,
  linkedinAuth,
  linkedinCallback,
  getCurrentUser,
} = require("../controllers/authControl");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Current user (token-based)
router.get("/me", protect, getCurrentUser);

// LinkedIn OAuth
router.get("/linkedin", linkedinAuth);
router.get("/linkedin/callback", linkedinCallback);

module.exports = router;
