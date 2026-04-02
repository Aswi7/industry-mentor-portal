const mongoose = require('mongoose');

// Define allowed roles
const roles = ["STUDENT", "MENTOR", "ADMIN"];
const mentorStatus = ["PENDING", "VERIFIED", "ACTIVE", "REJECTED"];

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
  phone: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  linkedinId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleRefreshToken: {
    type: String,
  },
  googleCalendarConnectedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: roles,
    default: "STUDENT", // Default role is Student
  },
  // Only for mentors
  company: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  skills: {
    type: [String], // Array of skills for mentor search
  },
  domain: {
    type: String, // Mentor domain
  },
  // Only for students
  studentSkills: {
    type: [String], // Array of skills student wants to learn/improve
  },
  studentDomain: {
    type: String, // Student's area of interest
  },
  mentorStatus: {
    type: String,
    enum: mentorStatus,
    default: "ACTIVE", // Set to ACTIVE by default as requested
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
