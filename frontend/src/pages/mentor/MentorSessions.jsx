import { Users, Plus, Calendar, Clock, Video, XCircle, CheckCircle, ExternalLink } from "lucide-react";
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
  const [nowTs, setNowTs] = useState(Date.now());

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
    if (!session?.meetingLink || (session.status !== "ACCEPTED" && session.status !== "OPEN")) {
      return { canJoin: false };
    }
    const startTs = session.startsAt ? new Date(session.startsAt).getTime() : NaN;
    const endTs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    const graceAfterEndMs = 60 * 60 * 1000;
    if (Number.isNaN(startTs)) return { canJoin: false };
    if (nowTs < startTs - 10 * 60 * 1000) return { canJoin: false };
    if (endTs && !Number.isNaN(endTs) && nowTs > endTs + graceAfterEndMs) return { canJoin: false };
    return { canJoin: true };
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;
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
          <h1 className="text-3xl font-extrabold text-gray-900">Session Management</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Create, track and manage your mentoring sessions</p>
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
        <h2 className="text-lg font-bold flex items-center gap-2">
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
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {session.status}
                    </span>
                    {session.type === 'PAID' && (
                      <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        ₹{session.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{session.topic}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    {session.student?.name || "Open Enrollment"}
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(session.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Clock size={16} className="text-blue-500" />
                      {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {countdown && (
                        <span className="ml-auto text-blue-600 font-extrabold">{countdown}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                    {joinMeta.canJoin ? (
                      <button
                        onClick={() => window.open(session.meetingLink, "_blank")}
                        className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-2"
                      >
                        <Video size={14} /> Join Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 btn-secondary py-2 text-xs opacity-50 cursor-not-allowed italic"
                      >
                        Scheduled
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelSession(session._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Cancel Session"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-400 italic">No upcoming sessions found.</p>
            </div>
          )}
        </div>
      </section>

      {/* History Table */}
      <section className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-lg font-bold">Session History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-4">Topic</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pastSessions.length > 0 ? (
                pastSessions.map(session => (
                  <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-gray-900">{session.topic}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase">{session.type}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {session.student?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(session.startsAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${
                        session.status === 'COMPLETED' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-8 text-center text-gray-400 italic text-sm">
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
              await axios.post(
                "http://localhost:5000/api/sessions/mentor-create",
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