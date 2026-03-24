import { Users, Calendar, Clock, CheckCircle, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MentorOverview() {
  const [mentorName, setMentorName] = useState("");
  const [stats, setStats] = useState({ mentees: 0, upcoming: 0, pending: 0, completed: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, statsRes, requestsRes, sessionsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/mentor/profile", { headers }),
          axios.get("http://localhost:5000/api/mentor/stats", { headers }),
          axios.get("http://localhost:5000/api/mentor/pending-requests", { headers }),
          axios.get("http://localhost:5000/api/mentor/sessions", { headers })
        ]);

        setMentorName(profileRes.data.mentor.name);
        setStats(statsRes.data.stats);
        setPendingRequests(requestsRes.data.pendingRequests.slice(0, 5));
        
        const upcoming = sessionsRes.data.sessions
          .filter((s) => s.status === "OPEN" || s.status === "ACCEPTED")
          .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
          .slice(0, 5);
        setUpcomingSessions(upcoming);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
      <p className="font-semibold">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Try refreshing the page</button>
    </div>
  );

  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-blue-600 font-bold text-sm tracking-wider uppercase mb-1">Overview</p>
          <h1 className="text-4xl font-display font-extrabold text-gray-900">
            Welcome back, {mentorName.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            {formattedDate}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm py-2">
            Download Report
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm py-2 shadow-blue-500/20">
            <Calendar size={16} />
            View Schedule
          </button>
        </div>
      </header>

      {/* GLASSMORPHISM STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          label="Total Mentees" 
          value={stats.mentees} 
          icon={<Users size={24} />} 
          trend="+12% this month"
          color="blue"
        />
        <StatWidget 
          label="Upcoming" 
          value={stats.upcoming} 
          icon={<Calendar size={24} />} 
          trend="Next: Tomorrow"
          color="indigo"
        />
        <StatWidget 
          label="Requests" 
          value={stats.pending} 
          icon={<Clock size={24} />} 
          trend="3 requires action"
          color="amber"
          isAlert={stats.pending > 0}
        />
        <StatWidget 
          label="Completed" 
          value={stats.completed} 
          icon={<CheckCircle size={24} />} 
          trend="Total 124 hours"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* UPCOMING SESSIONS TABLE */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Upcoming Sessions
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Monitor</span>
            </h2>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-4">Topic & Student</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map(session => (
                    <tr key={session._id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                            {session.topic?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{session.topic}</p>
                            <p className="text-xs text-gray-500">with {session.student?.name || "TBD Student"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(session.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        {session.type === "PAID" ? (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-100">
                            ₹{session.price}
                          </span>
                        ) : (
                          <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-100 uppercase">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {canJoinSession(session) ? (
                          <button
                            onClick={() => window.open(session.meetingLink, "_blank")}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                          >
                            Join Now
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 italic">Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 italic text-sm">
                      No upcoming sessions for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PENDING REQUESTS LIST */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold">Pending Requests</h2>
            <div className="h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
              {pendingRequests.length}
            </div>
          </div>
          
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[480px]">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request._id} className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {request.student?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{request.student?.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Student Request</p>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-gray-600 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mb-4 line-clamp-1 italic">
                    "{request.topic}"
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary-900 text-white text-[11px] font-bold py-2 rounded-xl hover:bg-primary-800 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                      <XIcon size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Clock size={24} />
                </div>
                <p className="text-gray-400 text-sm">Inbox is clear!</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-50">
            <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              Manage All Requests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatWidget({ label, value, icon, trend, color, isAlert }) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-200/50",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50"
  };

  return (
    <div className={`relative group p-6 rounded-[2rem] border backdrop-blur-xl bg-white/40 shadow-card hover:shadow-card-hover transition-all duration-300 ${isAlert ? 'ring-2 ring-amber-500/20' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-display font-black text-gray-900">{value}</h2>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={16} className="text-gray-300" />
      </div>
    </div>
  );
}

const XIcon = ({ size, className }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);