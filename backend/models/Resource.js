const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: String,
  link: String,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;