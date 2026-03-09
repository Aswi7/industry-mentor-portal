const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    default: null
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
    enum: ["OPEN", "REQUESTED", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELED"],
    default: "OPEN"
  },
  startsAt: {
    type: Date,
  },
  endsAt: {
    type: Date,
  },
  meetingLink: {
    type: String,
  },
  googleEventId: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
