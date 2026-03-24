import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  BookOpen, 
  Bell, 
  Search,
  LogOut,
  Settings
} from "lucide-react";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const navItems = [
    { to: "", label: "Dashboard", icon: <LayoutDashboard size={20} />, end: true },
    { to: "sessions", label: "Sessions", icon: <CalendarDays size={20} /> },
    { to: "mentees", label: "My Mentees", icon: <Users size={20} /> },
    { to: "resources", label: "Library", icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-72 bg-primary-900 text-white flex flex-col sticky top-0 h-screen shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Mentor<span className="text-blue-400">Connect</span>
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-md">
                {user.name?.charAt(0) || "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name || "Mentor Name"}</p>
                <p className="text-xs text-gray-300 truncate">{user.email || "mentor@example.com"}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-red-400 transition-colors w-full py-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search sessions, mentees..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-tighter">Status</p>
                <p className="text-[10px] text-green-600 font-bold uppercase">Online</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {user.name?.charAt(0) || "M"}
              </div>
            </div>
          </div>
        </header>

        {/* VIEWPORT */}
        <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Sub-component placeholder for logo icon if missing in lucide
const GraduationCap = ({ className, size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);