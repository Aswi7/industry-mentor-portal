import { NavLink, Outlet } from "react-router-dom";
import NotificationDropdown from "../components/NotificationDropdown";

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S";

  return (
    <div className="flex h-screen bg-gray-100 font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-white flex flex-col shadow-xl">

        {/* Logo */}
        <div className="p-6 text-xl font-display font-black border-b border-white/10 flex items-center gap-2">
          <span className="bg-blue-500 p-1.5 rounded-lg shadow-lg">🎓</span>
          <span className="tracking-tighter whitespace-nowrap">Mentor<span className="text-blue-400">Connect</span></span>
        </div>

        {/* Menu */}
        <div className="flex-1 p-6 space-y-2">

          {/* Overview */}
          <NavLink
            to=""
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-all ${
                isActive ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Overview
          </NavLink>

          {/* Sessions */}
          <NavLink
            to="sessions"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-all ${
                isActive ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Sessions
          </NavLink>

          {/* Resources */}
          <NavLink
            to="resources"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-all ${
                isActive ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Resources
          </NavLink>

          {/* Find Mentor */}
          <NavLink
            to="find-mentor"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-3.5 text-sm font-bold transition-all ${
                isActive ? "bg-white/10 text-white shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            Find Mentor
          </NavLink>

        </div>

        {/* User Info */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black text-sm shadow-lg">
              {initials}
            </div>
            <div className="overflow-hidden text-left">
              <p className="font-bold text-sm truncate">{user.name || "Student"}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Member</p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex justify-end items-center px-10 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <NotificationDropdown />
            
            <div className="h-8 w-px bg-gray-100"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">Student</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
              </div>
              <div className="bg-primary-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl shadow-primary-900/20 rotate-3">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-10 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default StudentDashboard;