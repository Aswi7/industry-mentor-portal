const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 5000;

// 1️⃣ Middleware
app.use(express.json());

// 2️⃣ Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// 3️⃣ Test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// 4️⃣ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// 5️⃣ Start server (LAST)
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
