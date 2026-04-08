import { Users, Calendar, Clock, CheckCircle, ArrowUpRight, MoreHorizontal, AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MentorOverview() {
  const navigate = useNavigate();
  
  const [mentorName, setMentorName] = useState("");
  const [stats, setStats] = useState({ mentees: 0, upcoming: 0, pending: 0, completed: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [actioningId, setActioningId] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, statsRes, requestsRes, sessionsRes] = await Promise.all([
        API.get("/mentor/profile", { headers }),
        API.get("/mentor/stats", { headers }),
        API.get("/mentor/pending-requests", { headers }),
        API.get("/mentor/sessions", { headers })
      ]);

      setMentorName(profileRes.data.mentor.name);
      setStats(statsRes.data.stats);
      setPendingRequests((requestsRes.data.pendingRequests || []).slice(0, 5));

      const upcoming = (sessionsRes.data.sessions || [])
        .filter((s) => s.status === "OPEN" || s.status === "ACCEPTED")
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
        .slice(0, 5);
      setUpcomingSessions(upcoming);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestAction = async (sessionId, action) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      setActioningId(sessionId);

      await API.put(`/sessions/${action}/${sessionId}`, {}, { headers });
      await fetchData();
      window.dispatchEvent(new Event("sessionChanged"));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} session`);
    } finally {
      setActioningId("");
    }
  };

  const canJoinSession = (session) => {
    if (!session?.meetingLink || (session.status !== "ACCEPTED" && session.status !== "OPEN")) return false;
    const startTs = session.startsAt ? new Date(session.startsAt).getTime() : NaN;
    const endTs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    const graceAfterEndMs = 60 * 60 * 1000;
    if (Number.isNaN(startTs)) return false;
    if (nowTs < startTs - 10 * 60 * 1000) return false;
    if (endTs && !Number.isNaN(endTs) && nowTs > endTs + graceAfterEndMs) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
          <div className="h-96 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 card">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Dashboard Error</h3>
        <p className="text-gray-500 dark:text-dark-subtext mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black mb-1 dark:text-white">
            Welcome back, {mentorName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtext flex items-center gap-2">
            <Calendar size={14} />
            {formattedDate}
          </p>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Mentees" value={stats.mentees} icon={<Users size={24} />} color="text-blue-500" bg="bg-blue-500/10" />
        <StatWidget label="Upcoming" value={stats.upcoming} icon={<Calendar size={24} />} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatWidget label="Requests" value={stats.pending} icon={<Clock size={24} />} color="text-amber-500" bg="bg-amber-500/10" />
        <StatWidget label="Completed" value={stats.completed} icon={<CheckCircle size={24} />} color="text-emerald-500" bg="bg-emerald-500/10" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* UPCOMING SESSIONS */}
        <div className="xl:col-span-2 card">
          <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
            <h2 className="text-lg font-bold dark:text-white">Upcoming Sessions</h2>
            <button className="text-primary-600 dark:text-primary-400 text-xs font-bold hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 dark:bg-dark-bg/50 dark:text-dark-subtext">Topic & Student</th>
                  <th className="px-6 py-4 dark:bg-dark-bg/50 dark:text-dark-subtext">Date & Time</th>
                  <th className="px-6 py-4 dark:bg-dark-bg/50 dark:text-dark-subtext">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map(session => (
                    <tr key={session._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
                            {session.topic?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-dark-text">{session.topic}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-subtext">with {session.student?.name || "TBD Student"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-gray-700 dark:text-dark-text">
                          {new Date(session.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-subtext">
                          {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        {canJoinSession(session) ? (
                          <button
                            onClick={() => window.open(session.meetingLink, "_blank")}
                            className="btn-primary py-1.5 text-xs"
                          >
                            Join Now
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 dark:text-dark-subtext uppercase tracking-widest bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar size={32} className="opacity-20" />
                        <p>No upcoming sessions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PENDING REQUESTS */}
        <div className="card flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
            <h2 className="text-lg font-bold dark:text-white">Pending Requests</h2>
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </div>
          
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[480px]">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request._id} className="p-4 rounded-xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card hover:border-primary-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                        {request.student?.name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 dark:text-dark-text truncate">{request.student?.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-dark-subtext uppercase font-bold tracking-widest">Student</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-dark-subtext mb-4 line-clamp-1 italic">
                    "{request.topic}"
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAction(request._id, "accept")}
                      disabled={actioningId === request._id}
                      className="flex-1 btn-primary py-2 text-[11px] font-bold"
                    >
                      {actioningId === request._id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRequestAction(request._id, "reject")}
                      disabled={actioningId === request._id}
                      className="btn-secondary py-2 px-3 flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-400 space-y-3 italic">
                <Clock size={32} className="opacity-20" />
                <p className="text-sm font-medium">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, icon, color, bg }) {
  return (
    <div className="card p-6 flex items-center gap-5 hover:border-primary-500/30 transition-all duration-300">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 dark:text-dark-subtext uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black dark:text-white">{value}</p>
      </div>
    </div>
  );
}
