import {
  Users,
  UserCheck,
  Calendar,
  BarChart3,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const AdminDashboard = () => {
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
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-[#0B1F3A] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🎓 MentorConnect
        </div>

        <div className="flex-1 p-4 space-y-3">
          <div className="bg-gray-700 rounded-lg p-3 cursor-pointer">
            Overview
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Users
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Sessions
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Approvals
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Reports
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
              AU
            </div>
            <div>
              <p className="font-semibold">Admin User</p>
              <p className="text-sm text-gray-300">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="flex items-center gap-4">
            🔔
            <div className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center">
              AU
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">

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

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6">

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Session Analytics
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              User Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {userData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;