const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ["Link", "Document", "Video"],
    default: "Document"
  },
  fileUrl: String,
  link: String,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
