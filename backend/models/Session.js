const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["REQUESTED", "ACCEPTED", "REJECTED", "COMPLETED"],
    default: "REQUESTED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
