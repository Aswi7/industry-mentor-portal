const mongoose = require('mongoose');

// Define allowed roles
const roles = ["STUDENT", "MENTOR", "ADMIN"];
const mentorStatus = ["PENDING", "VERIFIED", "ACTIVE"];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: roles,
    default: "STUDENT", // Default role is Student
  },
  // Only for mentors
  skills: {
    type: [String], // Array of skills for mentor search
  },
  domain: {
    type: String, // Mentor domain
  },
  mentorStatus: {
    type: String,
    enum: mentorStatus,
    default: "PENDING", // Mentor approval workflow
  },
  // Optional profile info
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
