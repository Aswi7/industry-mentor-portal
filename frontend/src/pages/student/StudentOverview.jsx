import { Calendar, Clock, BookOpen, BarChart3, AlertCircle, PlayCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import API from "../../services/api";

const StudentOverview = () => {
  const [studentName, setStudentName] = useState("");
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, resources: 0, skills: 0, skillDetails: [] });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, statsRes, sessionsRes] = await Promise.all([
          API.get("/student/profile", { headers }),
          API.get("/student/stats", { headers }),
          API.get("/student/sessions", { headers })
        ]);

        setStudentName(profileRes.data.student.name);
        setStats(statsRes.data.stats);

        const upcoming = (sessionsRes.data.sessions || [])
          .filter((s) => s.status === "REQUESTED" || s.status === "ACCEPTED")
          .slice(0, 3);
        setUpcomingSessions(upcoming);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Please check your connection.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const canJoinSession = (session) => {
    if (!session?.meetingLink || session.status !== "ACCEPTED") return false;
    const startTs = session.startsAt ? new Date(session.startsAt).getTime() : NaN;
    const endTs = session.endsAt ? new Date(session.endsAt).getTime() : null;
    const graceAfterEndMs = 60 * 60 * 1000;
    if (Number.isNaN(startTs)) return false;
    if (nowTs < startTs - 5 * 60 * 1000) return false;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
          <div className="h-96 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 card">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
        <p className="text-gray-500 dark:text-dark-subtext mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black mb-1 dark:text-white">
          Welcome back, {studentName.split(' ')[0] || "Student"}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">
          Track your learning progress and upcoming sessions
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Upcoming" value={stats.upcoming} icon={<Calendar size={24} />} color="text-blue-500" bg="bg-blue-500/10" />
        <StatWidget label="Completed" value={stats.completed} icon={<Clock size={24} />} color="text-green-500" bg="bg-green-500/10" />
        <StatWidget label="Resources" value={stats.resources} icon={<BookOpen size={24} />} color="text-indigo-500" bg="bg-indigo-500/10" />
        <StatWidget label="Skills" value={stats.skills} icon={<TrendingUp size={24} />} color="text-amber-500" bg="bg-amber-500/10" />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="card">
          <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <h2 className="text-lg font-bold">Upcoming Sessions</h2>
            <button className="text-primary-600 text-xs font-bold hover:underline">View Schedule</button>
          </div>
          
          <div className="p-6 space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map(session => (
                <div key={session._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-dark-border flex justify-between items-center hover:border-primary-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm">
                      {session.topic?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-dark-text">{session.topic}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-subtext">with {session.mentor.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.type === "PAID" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        ₹{session.price}
                      </span>
                    )}
                    {canJoinSession(session) ? (
                      <button
                        type="button"
                        onClick={() => window.open(session.meetingLink, "_blank", "noopener,noreferrer")}
                        className="btn-primary py-1.5 px-4 text-xs"
                      >
                        Join Now
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400 dark:text-dark-subtext uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-dark-border">
                        {session.status === 'REQUESTED' ? 'Pending' : 'Scheduled'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 italic space-y-3">
                <PlayCircle size={32} className="opacity-20" />
                <p className="text-sm">No upcoming sessions. Time to find a mentor!</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Progress */}
        <div className="card">
          <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <h2 className="text-lg font-bold">Skills Progress</h2>
            <BarChart3 size={18} className="text-gray-400" />
          </div>

          <div className="p-6 space-y-6">
            {stats.skillDetails && stats.skillDetails.length > 0 ? (
              stats.skillDetails.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span className="dark:text-dark-text">{item.skill}</span>
                    <span className="text-primary-600 dark:text-primary-400">{item.sessions} Sessions</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.sessions / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 italic space-y-3">
                <TrendingUp size={32} className="opacity-20" />
                <p className="text-sm">Start attending sessions to track your skills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default StudentOverview;
