import { NavLink, Outlet } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-[#0B1F3A] text-white flex flex-col">

        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🎓 MentorConnect
        </div>

        <div className="flex-1 p-4 space-y-3">

          <NavLink
            to=""
            end
            className={({ isActive }) =>
              `block rounded-lg p-3 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="sessions"
            className={({ isActive }) =>
              `block rounded-lg p-3 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
            }
          >
            Sessions
          </NavLink>


          <NavLink to="resources" className="block rounded-lg p-3 hover:bg-gray-700">
            Resources
          </NavLink>

          <NavLink to="messages" className="block rounded-lg p-3 hover:bg-gray-700">
            Messages
          </NavLink>

        </div>

        <div className="p-4 border-t border-gray-700">
          <p className="font-semibold">Arjun Sharma</p>
          <p className="text-sm text-gray-300">Student</p>
        </div>

      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <div className="h-16 bg-white shadow flex justify-end items-center px-6">
          🔔
          <div className="bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center ml-6">
            AS
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;