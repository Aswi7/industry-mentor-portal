import { Calendar, BookOpen, BarChart3, Clock } from "lucide-react";

const StudentDashboard = () => {
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
            Sessions
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Progress
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Resources
          </div>
          <div className="hover:bg-gray-700 rounded-lg p-3 cursor-pointer">
            Messages
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
              AS
            </div>
            <div>
              <p className="font-semibold">Arjun Sharma</p>
              <p className="text-sm text-gray-300">Student</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="flex items-center gap-4">
            🔔
            <div className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center">
              AS
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, Arjun!
          </h1>
          <p className="text-gray-600">
            Here's your learning overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <Calendar className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-gray-600">Upcoming Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <Clock className="text-green-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <BookOpen className="text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-gray-600">Resources</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-4">
              <BarChart3 className="text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-gray-600">Skills Tracked</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">

          {/* Upcoming Sessions */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Upcoming Sessions
            </h2>

            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  System Design Fundamentals
                </p>
                <p className="text-gray-600 text-sm">
                  2026-02-15 • 10:00 AM
                </p>
              </div>
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                60min
              </div>
            </div>
          </div>

          {/* Skills Progress */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Skills Progress
            </h2>

            {[
              { name: "React", value: 70 },
              { name: "Data Structures", value: 60 },
              { name: "System Design", value: 40 },
              { name: "Python", value: 50 },
            ].map((skill, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{skill.name}</span>
                  <span>{skill.value / 10}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${skill.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;