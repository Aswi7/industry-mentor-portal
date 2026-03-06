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
} from "recharts";

const AdminReports = () => {
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
          axios.get("http://localhost:5000/api/admin/users", { headers }),
          axios.get("http://localhost:5000/api/admin/sessions", { headers }),
        ]);

        setUsers(usersRes.data.users || []);
        setSessions(sessionsRes.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports data");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

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
      const createdAt = new Date(session.createdAt);
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

  if (loading) return <div className="p-8">Loading reports...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-50">

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Sessions by Topic
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData.length ? topicData : [{ name: "No data", sessions: 0 }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#1E40AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Weekly Session Trend
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData.length ? weeklyData : [{ week: "Week 1", sessions: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#2563EB"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-4xl font-bold text-blue-600">{totalUsers}</p>
          <p className="text-gray-600 mt-2">Total Users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-4xl font-bold text-green-600">{completedSessions}</p>
          <p className="text-gray-600 mt-2">Sessions Completed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-4xl font-bold text-blue-500">{totalSessions}</p>
          <p className="text-gray-600 mt-2">Total Sessions</p>
        </div>

      </div>

    </div>
  );
};

export default AdminReports;
