const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    enum: ["SESSION_ACCEPTED", "SESSION_REQUESTED", "SESSION_CANCELED", "SESSION_CREATED", "SESSION_REJECTED", "GENERAL"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId, // e.g. Session ID
    refPath: "relatedModel"
  },
  relatedModel: {
    type: String,
    enum: ["Session", "User", "Resource"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
