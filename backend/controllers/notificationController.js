const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getNotifications, markAsRead };
