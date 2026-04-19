import { useState, useEffect } from "react";
import { X, Clock, Globe, Eye } from "lucide-react";
import API from "../../services/api";

const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

const MentorDetailsModal = ({ mentor, onClose }) => {
  if (!mentor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            {mentor.profilePicture ? (
              <img
                src={`${API_BASE}${mentor.profilePicture}`}
                alt={`${mentor.name} profile`}
                className="w-20 h-20 rounded-full object-cover shadow-inner border border-blue-100"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl shadow-inner">
                {mentor.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
              <p className="text-blue-600 font-medium">{mentor.designation || "Mentor"}</p>
              <p className="text-gray-500 text-sm">{mentor.company || "Independent"}</p>
            </div>
          </div>

          <div className="space-y-6">
            {mentor.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Clock size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Experience</p>
                  <p className="text-sm text-gray-700 font-semibold">{mentor.yearsOfExperience || 0}+ Years</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Globe size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Domain</p>
                  <p className="text-sm text-gray-700 font-semibold">{mentor.domain || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills?.length ? (
                  mentor.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await API.get("/student/sessions", { headers });
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
    const graceBeforeStartMs = 10 * 60 * 1000; // 10 mins
    const graceAfterEndMs = 60 * 60 * 1000; // 60 mins

    if (!startMs || Number.isNaN(startMs)) {
      return { canJoin: false, label: "Join Unavailable", hint: "Waiting for mentor schedule" };
    }

    // Enable 10 minutes before start
    if (now < startMs - graceBeforeStartMs) {
      return { canJoin: false, label: "Join Now", hint: "Enabled 10 mins before start" };
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
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{session.topic}</h2>
                    {session.type === "PAID" ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        PAID: ₹{session.price}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        FREE
                      </span>
                    )}
                  </div>

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

                  {session.mentor && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedMentor(session.mentor)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Mentor Profile
                      </button>
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

      {selectedMentor && (
        <MentorDetailsModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </div>
  );
};

export default StudentSessions;
