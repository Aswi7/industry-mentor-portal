const Session = require("../models/Session");

const markExpiredSessionsAsCompleted = async () => {
  const now = new Date();
  const gracePeriodMs = 60 * 60 * 1000;
  const cutoff = new Date(now.getTime() - gracePeriodMs);

  await Session.updateMany(
    {
      status: { $in: ["OPEN", "REQUESTED", "ACCEPTED"] },
      $or: [
        { endsAt: { $type: "date", $lt: cutoff } },
        {
          $and: [
            { $or: [{ endsAt: { $exists: false } }, { endsAt: null }] },
            { startsAt: { $type: "date", $lt: cutoff } },
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

