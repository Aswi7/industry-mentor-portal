const Session = require("../models/Session");
const User = require("../models/User");
const { google } = require("googleapis");

const createGoogleMeetForSession = async ({ mentor, student, session, startsAt, endsAt }) => {
  if (!mentor?.googleRefreshToken) {
    throw new Error("Google Calendar not connected. Connect your Google account first.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:5000/api/auth/google/calendar/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Google auth is not configured");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: mentor.googleRefreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const requestId = `mentor-session-${session._id}-${Date.now()}`;

  const event = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Mentor Session: ${session.topic}`,
      description: `Mentor: ${mentor.name}\nStudent: ${student?.name || "N/A"}`,
      start: {
        dateTime: startsAt.toISOString(),
      },
      end: {
        dateTime: endsAt.toISOString(),
      },
      attendees: student?.email ? [{ email: student.email }] : [],
      conferenceData: {
        createRequest: {
          requestId,
        },
      },
    },
  });

  return {
    meetingLink:
      event.data?.hangoutLink ||
      event.data?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
      "",
    googleEventId: event.data?.id || "",
  };
};

const requestSession = async (req, res) => {
  try {
    const { sessionId, mentorId, topic } = req.body;

    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.status !== "OPEN") {
        return res.status(400).json({ message: "This session is no longer open" });
      }

      session.student = req.user.id;
      session.status = "REQUESTED";
      await session.save();

      return res.status(201).json({ message: "Session requested", session });
    }

    // Backward-compatible flow: request directly from a mentor card
    if (!mentorId || !topic) {
      return res.status(400).json({ message: "sessionId or mentorId+topic is required" });
    }

    const existing = await Session.findOne({
      student: req.user.id,
      mentor: mentorId,
      topic,
      status: "REQUESTED"
    });

    if (existing) {
      return res.status(200).json({ message: "Session already requested", session: existing });
    }

    const session = await Session.create({
      student: req.user.id,
      mentor: mentorId,
      topic,
      status: "REQUESTED"
    });

    return res.status(201).json({ message: "Session requested", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mentor creates an open session
const createSessionByMentor = async (req, res) => {
  try {
    const { topic, title, startsAt, endsAt } = req.body;
    const normalizedTopic = (topic || title || "").trim();

    if (!normalizedTopic) {
      return res.status(400).json({ message: "topic is required" });
    }

    if (!startsAt || !endsAt) {
      return res.status(400).json({ message: "startsAt and endsAt are required" });
    }

    const startInput = new Date(startsAt);
    const endInput = new Date(endsAt);

    if (Number.isNaN(startInput.getTime()) || Number.isNaN(endInput.getTime()) || endInput <= startInput) {
      return res.status(400).json({ message: "Invalid startsAt/endsAt values" });
    }

    const mentor = await User.findById(req.user.id).select("name email googleRefreshToken");
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const session = await Session.create({
      mentor: req.user.id,
      topic: normalizedTopic,
      startsAt: startInput,
      endsAt: endInput,
      status: "OPEN"
    });

    const { meetingLink, googleEventId } = await createGoogleMeetForSession({
      mentor,
      student: null,
      session,
      startsAt: startInput,
      endsAt: endInput,
    });

    session.meetingLink = meetingLink;
    session.googleEventId = googleEventId;
    await session.save();

    return res.status(201).json({ message: "Open session created", session });
  } catch (err) {
    console.error(err);
    if (err.message === "Google Calendar not connected. Connect your Google account first.") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "Google auth is not configured") {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Mentor cancels a session they created
const mentorCancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({ message: "Completed sessions cannot be canceled" });
    }

    await Session.deleteOne({ _id: session._id });

    return res.status(200).json({ message: "Session canceled successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// CANCEL SESSION (student can cancel a pending request)
const cancelSession = async (req, res) => {
  try {
    console.log("cancelSession called by", req.user.id, "sessionId", req.params.sessionId);
    const session = await Session.findById(req.params.sessionId);
    console.log("found session", session);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (!session.student || session.student.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "REQUESTED")
      return res.status(400).json({ message: "Only requested sessions can be canceled" });

    session.student = null;
    session.status = "OPEN";
    await session.save();

    res.status(200).json({ message: "Session request canceled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ACCEPT SESSION
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "REQUESTED" || !session.student) {
      return res.status(400).json({ message: "Only requested student sessions can be accepted" });
    }

    session.status = "ACCEPTED";
    await session.save();

    res.json({ message: "Session accepted", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// REJECT SESSION
const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "REQUESTED" || !session.student) {
      return res.status(400).json({ message: "Only requested student sessions can be rejected" });
    }

    session.status = "REJECTED";
    await session.save();

    res.status(200).json({ message: "Session rejected", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL SESSIONS FOR A MENTOR
const getMentorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ mentor: req.user.id });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ student: req.user.id })
      .populate("mentor", "name email")
      .populate("student", "name email");

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getOpenSessionsForStudents = async (req, res) => {
  try {
    const sessions = await Session.find({ status: "OPEN" })
      .populate("mentor", "name email skills domain")
      .sort({ createdAt: -1 });

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// COMPLETE SESSION
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.mentor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (session.status !== "ACCEPTED")
      return res.status(400).json({ message: "Only accepted sessions can be completed" });

    session.status = "COMPLETED";
    await session.save();

    res.status(200).json({ message: "Session completed", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




// EXPORT ALL
module.exports = {
  createSessionByMentor,
  mentorCancelSession,
  requestSession,
  acceptSession,
  rejectSession,
  cancelSession,
  getMentorSessions,
  getStudentSessions,
  getOpenSessionsForStudents,
  completeSession
};
