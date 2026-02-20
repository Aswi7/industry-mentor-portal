import { Users, UserCheck, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Overview = () => {
  const sessionData = [
    { name: "Completed", value: 2 },
    { name: "Upcoming", value: 2 },
    { name: "Pending", value: 1 },
    { name: "Cancelled", value: 1 },
  ];

  const userData = [
    { name: "Students", value: 2 },
    { name: "Mentors", value: 2 },
    { name: "Admins", value: 1 },
  ];

  const COLORS = ["#3B82F6", "#16A34A", "#F59E0B"];

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <Users className="text-blue-500" />
          <div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-gray-600">Total Users</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <UserCheck className="text-green-500" />
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-gray-600">Active Mentors</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <Calendar className="text-indigo-500" />
          <div>
            <p className="text-2xl font-bold">6</p>
            <p className="text-gray-600">Total Sessions</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
          <BarChart3 className="text-yellow-500" />
          <div>
            <p className="text-2xl font-bold">33%</p>
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