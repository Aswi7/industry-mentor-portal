import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { Users, UserCheck, Calendar, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { useTheme } from "../../context/ThemeContext";

const AdminOverview = () => {
  const { isDarkMode } = useTheme();

  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [usersRes, sessionsRes] = await Promise.all([
          API.get("/admin/users", { headers }),
          API.get("/admin/sessions", { headers }),
        ]);

        setUsers(usersRes.data.users || []);
        setSessions(sessionsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load overview data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const sessionData = useMemo(() => {
    const counts = { completed: 0, upcoming: 0, pending: 0, cancelled: 0 };
    for (const session of sessions) {
      const status = session?.status;
      if (status === "COMPLETED") counts.completed += 1;
      else if (status === "ACCEPTED") counts.upcoming += 1;
      else if (status === "CANCELED" || status === "REJECTED") counts.cancelled += 1;
      else counts.pending += 1;
    }
    return [
      { name: "Completed", value: counts.completed },
      { name: "Upcoming", value: counts.upcoming },
      { name: "Pending", value: counts.pending },
      { name: "Cancelled", value: counts.cancelled },
    ];
  }, [sessions]);

  const userData = useMemo(() => {
    const counts = { STUDENT: 0, MENTOR: 0, ADMIN: 0 };
    for (const user of users) {
      if (user?.role && counts[user.role] !== undefined) {
        counts[user.role] += 1;
      }
    }
    return [
      { name: "Students", value: counts.STUDENT },
      { name: "Mentors", value: counts.MENTOR },
      { name: "Admins", value: counts.ADMIN },
    ];
  }, [users]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeMentors = users.filter(u => u.role === "MENTOR" && ["VERIFIED", "ACTIVE"].includes(u.mentorStatus)).length;
    const totalSessions = sessions.length;
    const completed = sessions.filter(s => s.status === "COMPLETED").length;
    const completionRate = totalSessions === 0 ? 0 : Math.round((completed / totalSessions) * 100);

    return [
      { label: "Total Users", value: totalUsers, icon: <Users size={24} />, color: "text-blue-600 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-400/20" },
      { label: "Active Mentors", value: activeMentors, icon: <UserCheck size={24} />, color: "text-emerald-600 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-400/20" },
      { label: "Total Sessions", value: totalSessions, icon: <Calendar size={24} />, color: "text-indigo-600 dark:text-indigo-300", bg: "bg-indigo-100 dark:bg-indigo-400/20" },
      { label: "Completion Rate", value: `${completionRate}%`, icon: <TrendingUp size={24} />, color: "text-amber-600 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-400/20" },
    ];
  }, [users, sessions]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];
  const gridColor = isDarkMode ? "#374151" : "#f0f0f0";
  const tickColor = isDarkMode ? "#9CA3AF" : "#64748b";
  const tooltipBg = isDarkMode ? "#1F2937" : "#ffffff";
  const tooltipText = isDarkMode ? "#F9FAFB" : "#111827";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div>
        <h1 className="text-2xl font-black mb-1 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">Monitor portal activity and user distribution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 flex items-center gap-5 hover:border-primary-500/30 transition-all duration-300">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm ring-1 ring-black/5 dark:ring-white/10`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-dark-subtext uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold dark:text-white">Session Analytics</h2>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="h-[350px] w-full">
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: tickColor }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: tickColor }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      color: tooltipText
                    }}
                    itemStyle={{ color: tooltipText, fontWeight: 600 }}
                    cursor={{ fill: isDarkMode ? '#374151' : '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#45669a" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                <p>No session data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold dark:text-white">User Distribution</h2>
            <Users className="text-gray-400" size={20} />
          </div>
          <div className="h-[350px] w-full flex flex-col items-center">
            {users.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={userData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={80} 
                    outerRadius={110} 
                    paddingAngle={5}
                    stroke="none"
                    cx="50%"
                    cy="45%"
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      color: tooltipText
                    }}
                    itemStyle={{ color: tooltipText, fontWeight: 600 }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle" 
                    iconSize={10}
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      color: tickColor, 
                      fontSize: '13px', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }} 
                    formatter={(value, entry) => {
                      const item = userData.find(d => d.name === value);
                      return `${value}: ${item ? item.value : 0}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                <p>No user data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
