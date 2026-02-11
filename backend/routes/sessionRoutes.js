const express = require("express");
const router = express.Router();
const { protect, studentOnly } = require("../middleware/authMiddleware");
const { requestSession } = require("../controllers/sessionController");

router.post("/request", protect, studentOnly, requestSession);

module.exports = router;
