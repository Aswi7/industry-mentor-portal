import React from "react";
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
  const topicData = [
    { name: "System Design", sessions: 5 },
    { name: "Machine Learning", sessions: 8 },
    { name: "Python", sessions: 6 },
    { name: "Data Analytics", sessions: 4 },
  ];

  const weeklyData = [
    { week: "Week 1", sessions: 3 },
    { week: "Week 2", sessions: 5 },
    { week: "Week 3", sessions: 4 },
    { week: "Week 4", sessions: 6 },
  ];

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
            <BarChart data={topicData}>
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
            <LineChart data={weeklyData}>
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
          <p className="text-4xl font-bold text-blue-600">5</p>
          <p className="text-gray-600 mt-2">Total Users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-4xl font-bold text-green-600">2</p>
          <p className="text-gray-600 mt-2">Sessions Completed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-4xl font-bold text-blue-500">300</p>
          <p className="text-gray-600 mt-2">Total Minutes</p>
        </div>

      </div>

    </div>
  );
};

export default AdminReports;