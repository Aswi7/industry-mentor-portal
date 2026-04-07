const Session = require("../models/Session");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { google } = require("googleapis");
const { markExpiredSessionsAsCompleted } = require("../services/sessionStatus");

const createGoogleMeetForSession = async ({ mentor, student, session, startsAt, endsAt, eventId }) => {
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

  const requestBody = {
    summary: `Mentor Session: ${session.topic}`,
    description: `Mentor: ${mentor.name}\nStudent: ${student?.name || "N/A"}`,
    start: {
      dateTime: startsAt.toISOString(),
    },
    end: {
      dateTime: endsAt.toISOString(),
    },
    attendees: [
      ...(student?.email ? [{ email: student.email }] : []),
      ...(mentor?.email ? [{ email: mentor.email, responseStatus: "accepted" }] : []),
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  let event;
  if (eventId) {
    event = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      conferenceDataVersion: 1,
      requestBody: requestBody,
    });
  } else {
    event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: requestBody,
    });
  }

  return {
    meetingLink:
      event.data?.hangoutLink ||
      event.data?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
      "",
    googleEventId: event.data?.id || "",
  };
};

const formatSessionDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "an upcoming date";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

      // Create notification for mentor
      try {
        const student = await User.findById(req.user.id);
        await Notification.create({
          recipient: session.mentor,
          sender: req.user.id,
          type: "SESSION_REQUESTED",
          title: "New Session Request",
          message: `${student.name} has requested to join your session on "${session.topic}".`,
          relatedId: session._id,
          relatedModel: "Session"
        });
      } catch (notifErr) {
        console.error("Notification failed:", notifErr.message);
      }

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

    // Create notification for mentor
    try {
      const student = await User.findById(req.user.id);
      await Notification.create({
        recipient: mentorId,
        sender: req.user.id,
        type: "SESSION_REQUESTED",
        title: "New Session Request",
        message: `${student.name} has requested a session on "${topic}".`,
        relatedId: session._id,
        relatedModel: "Session"
      });
    } catch (notifErr) {
      console.error("Notification failed:", notifErr.message);
    }

    return res.status(201).json({ message: "Session requested", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mentor creates an open session
const createSessionByMentor = async (req, res) => {
  try {
    const { topic, title, startsAt, endsAt, type, price } = req.body;
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
      status: "OPEN",
      type: type || "FREE",
      price: type === "PAID" ? (price || 0) : 0
    });

    // Google Meet is optional: create it only when Calendar is connected and OAuth is configured.
    if (mentor.googleRefreshToken) {
      try {
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
      } catch (googleErr) {
        console.warn("Google Meet creation skipped:", googleErr?.message || googleErr);
        if (googleErr.message?.includes("invalid_grant") || googleErr.response?.data?.error === "invalid_grant") {
           await User.findByIdAndUpdate(req.user.id, { $unset: { googleRefreshToken: 1, googleCalendarConnectedAt: 1 } });
        }
      }
    }

    try {
      const students = await User.find({ role: "STUDENT" }).select("_id");
      if (students.length > 0) {
        const formattedDate = formatSessionDate(startInput);
        await Notification.insertMany(
          students.map((student) => ({
            recipient: student._id,
            sender: req.user.id,
            type: "SESSION_CREATED",
            title: "New Mentor Session Available",
            message: `${mentor.name} created a session on "${normalizedTopic}" scheduled for ${formattedDate}.`,
            relatedId: session._id,
            relatedModel: "Session",
          }))
        );
      }
    } catch (notifErr) {
      console.error("Session creation notification failed:", notifErr.message);
    }

    return res.status(201).json({ message: "Open session created", session });
  } catch (err) {
    console.error(err);
    if (err?.name === "ValidationError" || err?.name === "CastError") {
      return res.status(400).json({ message: err.message });
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

    session.status = "CANCELED";
    await session.save();

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

    // Ensure Google Meet is created/updated with the assigned student.
    if (session.startsAt && session.endsAt) {
      const startInput = new Date(session.startsAt);
      const endInput = new Date(session.endsAt);

      if (!Number.isNaN(startInput.getTime()) && !Number.isNaN(endInput.getTime()) && endInput > startInput) {
        const mentor = await User.findById(req.user.id).select("name email googleRefreshToken");
        const student = await User.findById(session.student).select("name email");

        if (mentor?.googleRefreshToken) {
          try {
            const { meetingLink, googleEventId } = await createGoogleMeetForSession({
              mentor,
              student,
              session,
              startsAt: startInput,
              endsAt: endInput,
              eventId: session.googleEventId,
            });

            session.meetingLink = meetingLink;
            session.googleEventId = googleEventId;
          } catch (googleErr) {
            console.warn("Google Meet update/creation skipped:", googleErr?.message || googleErr);
          }
        }
      }
    }

    await session.save();

    // Send notification to student
    try {
      const mentor = await User.findById(req.user.id);
      const dateStr = session.startsAt ? new Date(session.startsAt).toLocaleDateString() : "TBD";
      const timeStr = session.startsAt ? new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";
      
      await Notification.create({
        recipient: session.student,
        sender: req.user.id,
        type: "SESSION_ACCEPTED",
        title: "Session Request Accepted",
        message: `Your session on "${session.topic}" has been Accepted by ${mentor.name} for ${dateStr} at ${timeStr}.`,
        relatedId: session._id,
        relatedModel: "Session"
      });
    } catch (notifErr) {
      console.warn("Failed to create notification:", notifErr.message);
    }

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

    // Send notification to student
    try {
      const mentor = await User.findById(req.user.id);
      await Notification.create({
        recipient: session.student,
        sender: req.user.id,
        type: "SESSION_REJECTED",
        title: "Session Request Rejected",
        message: `Your session request for "${session.topic}" has been Rejected by ${mentor.name}.`,
        relatedId: session._id,
        relatedModel: "Session"
      });
    } catch (notifErr) {
      console.warn("Failed to create notification:", notifErr.message);
    }

    res.status(200).json({ message: "Session rejected", session });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL SESSIONS FOR A MENTOR
const getMentorSessions = async (req, res) => {
  try {
    await markExpiredSessionsAsCompleted();

    const sessions = await Session.find({ mentor: req.user.id })
      .populate("student", "name email");

    // Backfill missing Meet links for accepted sessions (best-effort) so "Join" can appear.
    const mentor = await User.findById(req.user.id).select("name email googleRefreshToken");
    if (mentor?.googleRefreshToken) {
      const now = Date.now();
      let attempts = 0;

      for (const session of sessions) {
        if (attempts >= 10) break;
        if (session.status !== "ACCEPTED" && session.status !== "OPEN") continue;
        if (session.meetingLink && session.googleEventId) continue;
        if (!session.startsAt || !session.endsAt) continue;

        const startMs = new Date(session.startsAt).getTime();
        const endMs = new Date(session.endsAt).getTime();
        if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) continue;

        // Attempt backfill if within 24 hours of start or already started/ended recently
        if (now < startMs - 24 * 60 * 60 * 1000) continue;
        if (now > endMs + 24 * 60 * 60 * 1000) continue;

        try {
          const { meetingLink, googleEventId } = await createGoogleMeetForSession({
            mentor,
            student: session.student || null,
            session,
            startsAt: new Date(session.startsAt),
            endsAt: new Date(session.endsAt),
            eventId: session.googleEventId,
          });

          session.meetingLink = meetingLink;
          session.googleEventId = googleEventId;
          await session.save();
          attempts += 1;
        } catch (googleErr) {
          console.warn("Google Meet backfill skipped:", googleErr?.message || googleErr);
          
          // If the token is invalid/revoked, clear it so the UI prompts for re-connection
          if (googleErr.message?.includes("invalid_grant") || googleErr.response?.data?.error === "invalid_grant") {
             await User.findByIdAndUpdate(req.user.id, { $unset: { googleRefreshToken: 1, googleCalendarConnectedAt: 1 } });
             break; // Stop attempting for this request
          }
          attempts += 1;
        }
      }
    }

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStudentSessions = async (req, res) => {
  try {
    await markExpiredSessionsAsCompleted();

    const sessions = await Session.find({ student: req.user.id })
      .populate("mentor", "name email skills domain bio company designation yearsOfExperience profilePicture")
      .populate("student", "name email");

    res.status(200).json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getOpenSessionsForStudents = async (req, res) => {
  try {
    await markExpiredSessionsAsCompleted();

    const sessions = await Session.find({ status: "OPEN" })
      .populate("mentor", "name email skills domain bio company designation yearsOfExperience profilePicture")
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

const refreshSessionMeetingLink = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.mentor.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const mentor = await User.findById(req.user.id).select("name email googleRefreshToken");
    if (!mentor?.googleRefreshToken) return res.status(400).json({ message: "Google Calendar not connected" });

    const student = session.student ? await User.findById(session.student).select("name email") : null;

    try {
      const { meetingLink, googleEventId } = await createGoogleMeetForSession({
        mentor,
        student,
        session,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        eventId: session.googleEventId,
      });

      session.meetingLink = meetingLink;
      session.googleEventId = googleEventId;
      await session.save();

      res.status(200).json({ message: "Meeting link refreshed", session });
    } catch (googleErr) {
      console.error("Manual refresh failed:", googleErr.message);
      if (googleErr.message?.includes("invalid_grant") || googleErr.response?.data?.error === "invalid_grant") {
        await User.findByIdAndUpdate(req.user.id, { $unset: { googleRefreshToken: 1, googleCalendarConnectedAt: 1 } });
        return res.status(400).json({ message: "Google session expired. Please reconnect your calendar." });
      }
      throw googleErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
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
  completeSession,
  refreshSessionMeetingLink
};
