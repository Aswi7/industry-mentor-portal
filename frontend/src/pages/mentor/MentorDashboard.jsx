import { NavLink, Outlet } from "react-router-dom"
import { Bell } from "lucide-react"

export default function MentorDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0B1C3D] text-white flex flex-col justify-between">
        <div>
          <div className="p-6 text-2xl font-bold">
            <span className="text-blue-400">Mentor</span>Connect
          </div>

          <nav className="mt-6 space-y-2 px-4">

            <NavLink
              to=""
              end
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-900"
                }`
              }
            >
              Overview
            </NavLink>

            <NavLink
              to="sessions"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-900"
                }`
              }
            >
              Sessions
            </NavLink>

            <NavLink
              to="mentees"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-900"
                }`
              }
            >
              Mentees
            </NavLink>

            <NavLink
              to="resources"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-900"
                }`
              }
            >
              Resources
            </NavLink>

            <NavLink
              to="messages"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg ${
                  isActive ? "bg-blue-900" : "hover:bg-blue-900"
                }`
              }
            >
              Messages
            </NavLink>

          </nav>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-blue-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            RK
          </div>
          <div>
            <p className="text-sm font-semibold">Rajesh Kumar</p>
            <p className="text-xs text-gray-300">Mentor</p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <div className="bg-white p-5 flex justify-end items-center shadow-sm">
          <Bell className="text-gray-500" />
        </div>

        {/* Page Content */}
        <div className="flex-1 p-8">
          <Outlet />
        </div>

      </div>
    </div>
  )
}