import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3, Users, Calendar, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AdminReports = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const { isDarkMode } = useTheme();

  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, sessionsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/admin/users`, { headers }),
          axios.get(`${API_BASE}/api/admin/sessions`, { headers }),
        ]);

        setUsers(usersRes.data.users || []);
        setSessions(sessionsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [API_BASE]);

  const topicData = useMemo(() => {
    const counts = sessions.reduce((acc, session) => {
      const topic = session.topic?.trim() || "Untitled";
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({ name, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 8);
  }, [sessions]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 27);
    start.setHours(0, 0, 0, 0);

    const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    const buckets = labels.map((week) => ({ week, sessions: 0 }));

    sessions.forEach((session) => {
      const createdAt = new Date(session.createdAt || session.startsAt);
      if (createdAt < start || createdAt > now) return;

      const dayDiff = Math.floor((createdAt - start) / (1000 * 60 * 60 * 24));
      const bucketIndex = Math.min(3, Math.max(0, Math.floor(dayDiff / 7)));
      buckets[bucketIndex].sessions += 1;
    });

    return buckets;
  }, [sessions]);

  const totalUsers = users.length;
  const completedSessions = sessions.filter((session) => session.status === "COMPLETED").length;
  const totalSessions = sessions.length;

  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tickColor = isDarkMode ? "#9CA3AF" : "#64748b";
  const tooltipBg = isDarkMode ? "#1F2937" : "#ffffff";
  const tooltipText = isDarkMode ? "#F9FAFB" : "#111827";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
          <div className="h-96 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
          <div className="h-32 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
          <div className="h-32 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 card">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Reports</h3>
        <p className="text-gray-500 dark:text-dark-subtext mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-1 dark:text-white tracking-tight">Analytical Reports</h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext font-medium">Detailed breakdown of platform engagement and session metrics</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportStatCard label="Total Users" value={totalUsers} icon={<Users size={24} />} color="text-blue-600 dark:text-blue-400" bg="bg-blue-100 dark:bg-blue-400/20" />
        <ReportStatCard label="Completed Sessions" value={completedSessions} icon={<CheckCircle size={24} />} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-400/20" />
        <ReportStatCard label="Total Sessions" value={totalSessions} icon={<Calendar size={24} />} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-100 dark:bg-indigo-400/20" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Bar Chart Container */}
        <div className="card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold dark:text-white tracking-tight">Popular Session Topics</h2>
              <p className="text-xs text-gray-400 dark:text-dark-subtext mt-1 font-medium">Top 8 most requested topics</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-400/10 rounded-xl text-blue-600 dark:text-blue-400">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData.length ? topicData : [{ name: "No data", sessions: 0 }]} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: tickColor }} 
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: tickColor }} />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.2)',
                    color: tooltipText,
                    padding: '12px'
                  }}
                  itemStyle={{ color: tooltipText, fontWeight: 700, fontSize: '13px' }}
                  cursor={{ fill: isDarkMode ? '#374151' : '#f8fafc' }}
                />
                <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={45}>
                   {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#4f46e5"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart Container */}
        <div className="card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold dark:text-white tracking-tight">Growth Trends</h2>
              <p className="text-xs text-gray-400 dark:text-dark-subtext mt-1 font-medium">Weekly session activity (Last 30 days)</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-400/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 30, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: tickColor }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: tickColor }} />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.2)',
                    color: tooltipText,
                    padding: '12px'
                  }}
                  itemStyle={{ color: tooltipText, fontWeight: 700, fontSize: '13px' }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#3b82f6"
                  strokeWidth={5}
                  dot={{ r: 7, fill: "#3b82f6", strokeWidth: 3, stroke: isDarkMode ? "#1f2937" : "#fff" }}
                  activeDot={{ r: 10, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportStatCard = ({ label, value, icon, color, bg }) => (
  <div className="card p-10 flex flex-col items-center text-center group hover:border-primary-500/40 transition-all duration-500 shadow-sm hover:shadow-xl">
    <div className={`p-5 rounded-[2rem] ${bg} ${color} mb-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      {icon}
    </div>
    <p className="text-5xl font-black dark:text-white mb-2 tracking-tighter">{value}</p>
    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-dark-subtext">{label}</p>
  </div>
);

export default AdminReports;
