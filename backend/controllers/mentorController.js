const User = require("../models/User");
const Session = require("../models/Session");
const { google } = require("googleapis");

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
          conferenceSolutionKey: { type: "hangoutsMeet" },
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

// Get mentor profile
const getMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id).select("-password");
    res.status(200).json({ mentor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update mentor profile
const updateMentorProfile = async (req, res) => {
  try {
    const mentor = await User.findById(req.user.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    const { skills, domain, bio, profilePicture } = req.body;

    if (skills) mentor.skills = skills;
    if (domain) mentor.domain = domain;
    if (bio) mentor.bio = bio;
    if (profilePicture) mentor.profilePicture = profilePicture;

    await mentor.save();

    const mentorResponse = mentor.toObject();
    delete mentorResponse.password;

    res.status(200).json({ mentor: mentorResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor dashboard stats
const getMentorStats = async (req, res) => {
  try {
    const mentorId = req.user.id;
    await markExpiredSessionsAsCompleted();

    // Get all sessions for this mentor
    const allSessions = await Session.find({ mentor: mentorId }).populate("student", "name email");

    // Count mentees (unique students)
    const menteeIds = new Set(
      allSessions
        .filter((s) => s.student)
        .map((s) => s.student._id.toString())
    );
    const menteesCount = menteeIds.size;

    // Count upcoming sessions (OPEN and ACCEPTED)
    const upcomingCount = allSessions.filter(
      (s) => s.status === "OPEN" || s.status === "ACCEPTED"
    ).length;

    // Count pending requests (REQUESTED status)
    const pendingCount = allSessions.filter(s => s.status === "REQUESTED").length;

    // Count completed sessions
    const completedCount = allSessions.filter(s => s.status === "COMPLETED").length;

    res.status(200).json({
      stats: {
        mentees: menteesCount,
        upcoming: upcomingCount,
        pending: pendingCount,
        completed: completedCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor's sessions
const getMentorSessions = async (req, res) => {
  try {
    const mentorId = req.user.id;
    await markExpiredSessionsAsCompleted();

    const sessions = await Session.find({ mentor: mentorId })
      .populate("student", "name email skills domain")
      .sort({ createdAt: -1 });

    // Best-effort backfill for accepted sessions missing a Meet link.
    const mentor = await User.findById(mentorId).select("name email googleRefreshToken");
    if (mentor?.googleRefreshToken) {
      let attempts = 0;
      for (const session of sessions) {
        if (attempts >= 5) break;
        if (session.status !== "ACCEPTED") continue;
        if (session.meetingLink && session.googleEventId) continue;
        if (!session.startsAt || !session.endsAt) continue;

        const startInput = new Date(session.startsAt);
        const endInput = new Date(session.endsAt);
        if (Number.isNaN(startInput.getTime()) || Number.isNaN(endInput.getTime()) || endInput <= startInput) {
          continue;
        }

        try {
          const { meetingLink, googleEventId } = await createGoogleMeetForSession({
            mentor,
            student: session.student || null,
            session,
            startsAt: startInput,
            endsAt: endInput,
          });

          if (meetingLink) session.meetingLink = meetingLink;
          if (googleEventId) session.googleEventId = googleEventId;
          await session.save();
          attempts += 1;
        } catch (googleErr) {
          console.warn("Google Meet backfill skipped:", googleErr?.message || googleErr);
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

// Get mentor's mentees
const getMentorMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const sessions = await Session.find({ mentor: mentorId, status: { $in: ["ACCEPTED", "COMPLETED"] } })
      .populate("student", "name email studentSkills studentDomain bio");

    // Get unique mentees
    const menteeMap = new Map();
    sessions.forEach(session => {
      if (!session.student) return;
      menteeMap.set(session.student._id.toString(), session.student);
    });

    const mentees = Array.from(menteeMap.values());

    res.status(200).json({ mentees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending mentorship requests
const getPendingRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const pendingRequests = await Session.find({ mentor: mentorId, status: "REQUESTED" })
      .populate("student", "name email skills domain bio")
      .sort({ createdAt: -1 });

    res.status(200).json({ pendingRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  updateMentorProfile, 
  getMentorProfile,
  getMentorStats,
  getMentorSessions,
  getMentorMentees,
  getPendingRequests
};
