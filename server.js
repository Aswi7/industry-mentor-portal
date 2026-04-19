const cors = require("cors");
const express = require("express");
const mongoose = require("./backend/lib/mongoose");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const authRoutes = require("./backend/routes/auth");
const testRoutes = require("./backend/routes/testRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");
const mentorRoutes = require("./backend/routes/mentorRoutes");
const studentRoutes = require("./backend/routes/studentRoutes");
const sessionRoutes = require("./backend/routes/sessionRoutes");
const resourceRoutes = require("./backend/routes/resourceRoutes");
const notificationRoutes = require("./backend/routes/notificationRoutes");
const { markExpiredSessionsAsCompleted } = require("./backend/services/sessionStatus");

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "backend", "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");

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
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = app;
