import { NavLink, Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-[#0B1F3A] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🎓 MentorConnect
        </div>

        <div className="flex-1 p-4 space-y-3">

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block rounded-lg p-3 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `block rounded-lg p-3 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/sessions"
            className={({ isActive }) =>
              `block rounded-lg p-3 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Sessions
          </NavLink>

          <NavLink
            to="/admin/approvals"
            className={({ isActive }) =>
              `block rounded-lg p-3 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Approvals
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `block rounded-lg p-3 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            Reports
          </NavLink>

        </div>

        {/* Profile */}
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
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminDashboard;