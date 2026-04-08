import { Users, Plus, Calendar, Clock, Video, XCircle, CheckCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import API from "../../services/api";
import CreateSessionModal from "../student/CreateSessionModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MentorSessions = () => {
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());

  const loadCalendarStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const meRes = await API.get("/auth/me", { headers });
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

      const res = await API.get("/mentor/sessions", { headers });
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

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStudentCount = (session) => {
    if (Array.isArray(session.students)) return session.students.length;
    return session.student ? 1 : 0;
  };

  const formatCountdown = (startsAt) => {
    if (!startsAt) return null;
    const startTs = new Date(startsAt).getTime();
    if (Number.isNaN(startTs)) return null;
    const diff = startTs - nowTs;
    if (diff <= 0) return "Started";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getJoinMeta = (session) => {
    const startTs = session.startsAt ? new Date(session.startsAt).getTime() : NaN;
    const endTs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    const graceBeforeStartMs = 10 * 60 * 1000; 
    const graceAfterEndMs = 60 * 60 * 1000;

    if (session.status !== "ACCEPTED" && session.status !== "OPEN") {
      return { canJoin: false, reason: "Inactive" };
    }

    if (Number.isNaN(startTs)) return { canJoin: false, reason: "No Date" };

    // Strict 10-minute window
    if (nowTs < startTs - graceBeforeStartMs) {
      return { canJoin: false, reason: "Scheduled" };
    }

    if (endTs && !Number.isNaN(endTs) && nowTs > endTs + graceAfterEndMs) {
      return { canJoin: false, reason: "Expired" };
    }

    // Always allow clicking if it's "time", we handle missing links in the click handler
    return { canJoin: true };
  };

  const handleJoinClick = async (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
      return;
    }

    // Link missing, try to generate it now
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await API.post(`/sessions/refresh-link/${session._id}`, {}, { headers });
      
      if (res.data.session?.meetingLink) {
        window.open(res.data.session.meetingLink, "_blank");
        await fetchSessions();
      } else {
        throw new Error("Link could not be generated");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("calendar not connected") || msg.toLowerCase().includes("expired")) {
        if (window.confirm("Google Calendar is not connected or session expired. Connect now to enable meeting?")) {
          handleConnectCalendar();
        }
      } else {
        alert("Failed to join: " + (msg || "Check your Google connection"));
      }
    }
  };

  const handleRefreshLink = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await API.post(`/sessions/refresh-link/${sessionId}`, {}, { headers });
      await fetchSessions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to refresh link");
    }
  };

  const handleConnectCalendar = () => {
    const token = localStorage.getItem("token");
    window.location.href = `${API_BASE}/api/auth/google/calendar?token=${token}&next=/mentor/sessions`;
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await API.delete(`/sessions/mentor-cancel/${sessionId}`, { headers });
      await fetchSessions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel session");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
    </div>
  );

  const upcomingSessions = sessions.filter(s => s.status === "OPEN" || s.status === "ACCEPTED");
  const pastSessions = sessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELED");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Session Management</h1>
          <p className="text-gray-700 dark:text-dark-subtext mt-1 text-sm font-medium">Create, track and manage your mentoring sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2 shadow-blue-600/20"
        >
          <Plus size={20} />
          Create New Session
        </button>
      </div>

      {/* Grid of Sessions */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
          Active & Upcoming
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => {
              const joinMeta = getJoinMeta(session);
              const countdown = formatCountdown(session.startsAt);
              return (
                <div key={session._id} className="mentor-card flex flex-col p-6 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`badge-status ${
                      session.status === 'ACCEPTED' 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' 
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
                    }`}>
                      {session.status}
                    </span>
                    {session.type === 'PAID' && (
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/50">
                        ₹{session.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{session.topic}</h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-subtext mb-6 flex items-center gap-1.5">
                    <Users size={14} className="text-gray-600 dark:text-dark-subtext" />
                    {session.student?.name || "Open Enrollment"}
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-dark-subtext bg-gray-50 dark:bg-dark-bg p-3 rounded-xl">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(session.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-dark-subtext bg-gray-50 dark:bg-dark-bg p-3 rounded-xl">
                      <Clock size={16} className="text-blue-500" />
                      {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {countdown && (
                        <span className="ml-auto text-blue-600 dark:text-blue-400 font-extrabold">{countdown}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-dark-border flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinClick(session)}
                        disabled={!joinMeta.canJoin}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          joinMeta.canJoin 
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-dark-border"
                        }`}
                      >
                        <Video size={16} /> Join Now
                      </button>
                      
                      <button
                        onClick={() => handleCancelSession(session._id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                        title="Cancel Session"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>

                    {!joinMeta.canJoin && (
                      <p className="text-[10px] text-center font-bold text-gray-500 dark:text-dark-subtext italic">
                        {joinMeta.reason === "Scheduled" ? `Available in ${formatCountdown(session.startsAt)}` : joinMeta.reason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white dark:bg-dark-card rounded-3xl border border-dashed border-gray-300 dark:border-dark-border">
              <p className="text-gray-600 dark:text-dark-subtext italic">No upcoming sessions found.</p>
            </div>
          )}
        </div>
      </section>

      {/* History Table */}
      <section className="card overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-dark-border bg-gray-50/30 dark:bg-dark-bg/30">
          <h2 className="text-lg font-bold dark:text-white">Session History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-600 dark:text-dark-subtext uppercase tracking-widest border-b border-gray-50 dark:border-dark-border">
                <th className="px-8 py-4 dark:bg-dark-bg/50">Topic</th>
                <th className="px-6 py-4 dark:bg-dark-bg/50">Student</th>
                <th className="px-6 py-4 dark:bg-dark-bg/50">Date</th>
                <th className="px-6 py-4 dark:bg-dark-bg/50">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {pastSessions.length > 0 ? (
                pastSessions.map(session => (
                  <tr key={session._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{session.topic}</p>
                      <p className="text-[10px] text-gray-600 dark:text-dark-subtext font-black uppercase">{session.type}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-dark-text font-medium">
                      {session.student?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-dark-text font-medium">
                      {new Date(session.startsAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                        session.status === 'COMPLETED' 
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' 
                          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-8 text-center text-gray-600 dark:text-dark-subtext italic text-sm">
                    No session history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <CreateSessionModal
          onClose={() => setShowModal(false)}
          onCreate={async (data) => {
            try {
              const localStart = new Date(`${data.date}T${data.time}`);
              const durationMin = Number(data.duration || 60);
              const localEnd = new Date(localStart.getTime() + durationMin * 60 * 1000);
              const token = localStorage.getItem("token");
              const headers = { Authorization: `Bearer ${token}` };
              await API.post(
                "/sessions/mentor-create",
                {
                  topic: data.title,
                  startsAt: localStart.toISOString(),
                  endsAt: localEnd.toISOString(),
                  type: data.type,
                  price: data.price
                },
                { headers }
              );
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
  );
};

export default MentorSessions;