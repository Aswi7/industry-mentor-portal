import { Users, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import CreateSessionModal from "../student/CreateSessionModal";

const MentorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const loadCalendarStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const meRes = await axios.get("http://localhost:5000/api/auth/me", { headers });
      const latestUser = meRes.data?.user;
      if (latestUser) {
        setIsCalendarConnected(Boolean(latestUser.googleCalendarConnectedAt || latestUser.googleRefreshToken));
        localStorage.setItem("user", JSON.stringify(latestUser));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get("http://localhost:5000/api/mentor/sessions", { headers });
      const allSessions = (res.data.sessions || []).filter(
        (session) => session.status !== "REQUESTED" && session.status !== "REJECTED"
      );
      setSessions(allSessions);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    loadCalendarStatus();
  }, []);

  const connectGoogleCalendar = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      return;
    }
    setConnecting(true);
    window.location.href = `http://localhost:5000/api/auth/google/calendar?token=${encodeURIComponent(token)}&next=${encodeURIComponent("/mentor/sessions")}`;
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`http://localhost:5000/api/sessions/mentor-cancel/${sessionId}`, { headers });
      await fetchSessions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel session");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading sessions...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const upcomingSessions = sessions.filter(
    (session) => session.status === "OPEN" || session.status === "ACCEPTED"
  );
  const completedSessions = sessions.filter((session) => session.status === "COMPLETED");

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Session Management
          </h1>
          <p className="text-gray-500">
            Manage mentoring sessions and track students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={connectGoogleCalendar}
            disabled={connecting}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
              connecting ? "bg-gray-400 text-white cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {connecting ? "Redirecting..." : isCalendarConnected ? "Reconnect Google Calendar" : "Connect Google Calendar"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Create Session
          </button>
        </div>
        {showModal && (
          <CreateSessionModal
            onClose={() => setShowModal(false)}
            onCreate={async (data) => {
              try {
                const localStart = new Date(`${data.date}T${data.time}`);
                const durationMin = Number(data.duration || 60);
                const localEnd = new Date(localStart.getTime() + durationMin * 60 * 1000);
                if (Number.isNaN(localStart.getTime()) || Number.isNaN(localEnd.getTime())) {
                  alert("Please provide valid date and time");
                  return;
                }

                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post(
                  "http://localhost:5000/api/sessions/mentor-create",
                  {
                    topic: data.title,
                    startsAt: localStart.toISOString(),
                    endsAt: localEnd.toISOString(),
                  },
                  { headers }
                );
                alert("Session created successfully!");
                setShowModal(false);
                await fetchSessions();
              } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to create session");
              }
            }}
          />
        )}
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Upcoming Sessions
      </h2>

      {/* Session Cards */}
      <div className="space-y-6">
        {upcomingSessions.length > 0 ? (
          upcomingSessions.map((session) => (
            <div
              key={session._id}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {session.topic}
                    </h3>

                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      session.status === "OPEN" ? "bg-gray-100 text-gray-700" :
                      session.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                      session.status === "REQUESTED" ? "bg-yellow-100 text-yellow-700" :
                      session.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <p className="text-gray-500 mt-2">
                    Student: <span className="font-semibold">{session.student?.name || "Open to all students"}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCancelSession(session._id)}
                    className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded-full hover:bg-red-200 transition"
                  >
                    Cancel Session
                  </button>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="flex gap-6 mt-5 text-gray-600 text-sm items-center">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {session.student?.email || "No student yet"}
                </div>
                {session.startsAt && (
                  <div>
                    {new Date(session.startsAt).toLocaleString()}
                  </div>
                )}
                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Open Meet
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl text-center text-gray-400">
            No upcoming sessions
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mt-10 mb-4">
        Completed Sessions
      </h2>

      <div className="space-y-6">
        {completedSessions.length > 0 ? (
          completedSessions.map((session) => (
            <div
              key={session._id}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {session.topic}
                    </h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      COMPLETED
                    </span>
                  </div>

                  <p className="text-gray-500 mt-2">
                    Student: <span className="font-semibold">{session.student?.name || "N/A"}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-6 mt-5 text-gray-600 text-sm items-center">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {session.student?.email || "No email"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl text-center text-gray-400">
            No completed sessions
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSessions;
