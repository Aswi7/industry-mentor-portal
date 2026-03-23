const Session = require("../models/Session");

const markExpiredSessionsAsCompleted = async () => {
  const now = new Date();
  await Session.updateMany(
    {
      status: { $in: ["OPEN", "REQUESTED", "ACCEPTED"] },
      $or: [
        { endsAt: { $type: "date", $lt: now } },
        {
          $and: [
            { $or: [{ endsAt: { $exists: false } }, { endsAt: null }] },
            { startsAt: { $type: "date", $lt: now } },
          ],
        },
      ],
    },
    { $set: { status: "COMPLETED" } }
  );
};

module.exports = {
  markExpiredSessionsAsCompleted,
};

