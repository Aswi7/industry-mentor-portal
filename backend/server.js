const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1️⃣ Middleware
app.use(express.json());
app.use(cors());

// 2️⃣ Routes

const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const studentRoutes = require("./routes/studentRoutes"); 
const sessionRoutes = require("./routes/sessionRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { markExpiredSessionsAsCompleted } = require("./services/sessionStatus");
// ✅ ADD THIS

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static("uploads")); // ✅ ADD THIS

// 3️⃣ Test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// 4️⃣ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Auto-complete sessions once they pass their scheduled end time.
    const intervalMs = Number(process.env.SESSION_AUTO_COMPLETE_INTERVAL_MS || 60000);
    if (intervalMs > 0) {
      try {
        await markExpiredSessionsAsCompleted();
      } catch (err) {
        console.warn("Session auto-complete (startup) failed:", err?.message || err);
      }

      const timer = setInterval(async () => {
        try {
          await markExpiredSessionsAsCompleted();
        } catch (err) {
          console.warn("Session auto-complete failed:", err?.message || err);
        }
      }, intervalMs);

      timer.unref?.();
    }
  })
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// 5️⃣ Start server (LAST)
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
