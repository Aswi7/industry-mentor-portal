import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Users, UserCheck, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Overview = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
          axios.get(`${API_BASE}/api/admin/users`, { headers }),
          axios.get(`${API_BASE}/api/admin/sessions`, { headers }),
        ]);

        setUsers(usersRes.data.users || []);
        setSessions(sessionsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [API_BASE]);

  const sessionData = useMemo(() => {
    const counts = { completed: 0, upcoming: 0, pending: 0, cancelled: 0 };

    for (const session of sessions) {
      const status = session?.status;
      if (status === "COMPLETED") counts.completed += 1;
      else if (status === "ACCEPTED") counts.upcoming += 1;
      else if (status === "CANCELED" || status === "REJECTED") counts.cancelled += 1;
      else counts.pending += 1; // OPEN / REQUESTED / unknown
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
      if (!user?.role) continue;
      if (counts[user.role] === undefined) continue;
      counts[user.role] += 1;
    }

    return [
      { name: "Students", value: counts.STUDENT },
      { name: "Mentors", value: counts.MENTOR },
      { name: "Admins", value: counts.ADMIN },
    ];
  }, [users]);

  const totalUsers = users.length;
  const activeMentors = useMemo(
    () =>
      users.filter(
        (u) => u.role === "MENTOR" && ["VERIFIED", "ACTIVE"].includes(u.mentorStatus)
      ).length,
    [users]
  );
  const totalSessions = sessions.length;
  const completionRate = useMemo(() => {
    if (totalSessions === 0) return 0;
    const completed = sessions.filter((s) => s.status === "COMPLETED").length;
    return Math.round((completed / totalSessions) * 100);
  }, [sessions, totalSessions]);

  const COLORS = ["#3B82F6", "#16A34A", "#F59E0B"];

  if (loading) return <div className="p-8">Loading overview...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <Users className="text-blue-500" />
          <div>
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-gray-600">Total Users</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <UserCheck className="text-green-500" />
          <div>
            <p className="text-2xl font-bold">{activeMentors}</p>
            <p className="text-gray-600">Active Mentors</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <Calendar className="text-indigo-500" />
          <div>
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-gray-600">Total Sessions</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <BarChart3 className="text-yellow-500" />
          <div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-gray-600">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Session Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1E40AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={userData} dataKey="value" nameKey="name" outerRadius={100} label>
                {userData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Overview;
