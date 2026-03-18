import { useState, useEffect } from "react";
import axios from "axios";

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get("http://localhost:5000/api/student/sessions", { headers });
        const filteredSessions = (res.data.sessions || []).filter(
          (s) => s.status === "REQUESTED" || s.status === "ACCEPTED" || s.status === "COMPLETED"
        );
        setSessions(filteredSessions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
        setLoading(false);
      }
    };

    fetchSessions();

    const listener = () => {
      setLoading(true);
      fetchSessions();
    };

    window.addEventListener("sessionChanged", listener);
    return () => window.removeEventListener("sessionChanged", listener);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-600";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-600";
      case "COMPLETED":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "REQUESTED":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const getJoinMeta = (session) => {
    if (!session.meetingLink || session.status !== "ACCEPTED") {
      return { canJoin: false, label: "Join Unavailable", hint: "" };
    }

    const startMs = session.startsAt ? new Date(session.startsAt).getTime() : null;
    const endMs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    const graceAfterEndMs = 60 * 60 * 1000;

    if (!startMs || Number.isNaN(startMs)) {
      return { canJoin: false, label: "Join Unavailable", hint: "Waiting for mentor schedule" };
    }

    if (now < startMs) {
      return { canJoin: false, label: "Join (Locked)", hint: "Enabled at scheduled start time" };
    }

    if (endMs && !Number.isNaN(endMs) && now > endMs + graceAfterEndMs) {
      return { canJoin: false, label: "Session Ended", hint: "Join window is closed" };
    }

    return { canJoin: true, label: "Join Now", hint: "" };
  };

  const getCountdownText = (session) => {
    if (!session.startsAt) return "Time not set";
    const startMs = new Date(session.startsAt).getTime();
    const endMs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    if (Number.isNaN(startMs)) return "Time not set";

    if (session.status === "COMPLETED") return "Completed";
    if (now < startMs) {
      const diffMs = startMs - now;
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;

      if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
      return `Starts in ${minutes}m`;
    }

    if (endMs && !Number.isNaN(endMs) && now > endMs) return "Ended";
    return "Started";
  };

  const getScheduleText = (session) => {
    if (!session.startsAt) return "Schedule not set";
    const startDate = new Date(session.startsAt);
    if (Number.isNaN(startDate.getTime())) return "Schedule not set";
    if (!session.endsAt) return startDate.toLocaleString();

    const endDate = new Date(session.endsAt);
    if (Number.isNaN(endDate.getTime())) return startDate.toLocaleString();
    return `${startDate.toLocaleString()} - ${endDate.toLocaleTimeString()}`;
  };

  if (loading) return <div className="p-6 text-center">Loading sessions...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Sessions</h1>
        <p className="text-gray-500">View and manage your mentoring sessions</p>
      </div>

      <div className="space-y-5">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            const joinMeta = getJoinMeta(session);
            return (
              <div
                key={session._id}
                className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{session.topic}</h2>

                <p className="text-gray-600 text-sm">with {session.mentor?.name || "Mentor"}</p>

                  <p className="text-gray-600 text-sm">
                    {new Date(session.createdAt).toLocaleDateString()} | Mentoring Session
                  </p>

                  <p className="text-gray-700 text-sm">
                    Scheduled: {getScheduleText(session)}
                  </p>

                  <p className="text-xs text-amber-600">
                    {getCountdownText(session)}
                  </p>

                  {session.status === "ACCEPTED" && (
                    <div className="pt-1">
                      <button
                        type="button"
                        disabled={!joinMeta.canJoin}
                        onClick={() => window.open(session.meetingLink, "_blank", "noopener,noreferrer")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                          joinMeta.canJoin
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {joinMeta.label}
                      </button>
                      {joinMeta.hint && (
                        <p className="text-xs text-gray-500 mt-1">{joinMeta.hint}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                      session.status
                    )}`}
                  >
                    {getStatusLabel(session.status)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            No sessions yet. Find a mentor to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSessions;
