import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Menu, 
  X, 
  Search, 
  GraduationCap
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';

const DashboardLayout = ({ navItems, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || role.charAt(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-primary-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Mentor<span className="text-blue-400">Connect</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-white/70 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info / Profile Section */}
        <div className="p-6 mt-auto border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-md ring-2 ring-white/20">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user.name || role}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{user.email || 'Member'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors w-full px-1"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Menu size={24} />
            </button>
            
            <div className="relative w-64 md:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-bg border-transparent rounded-xl focus:bg-white dark:focus:bg-dark-card focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm dark:text-dark-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            <NotificationDropdown />
            
            <div className="h-8 w-px bg-gray-200 dark:bg-dark-border"></div>
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => role === 'MENTOR' && navigate('/mentor/profile')}>
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-900 dark:text-dark-text uppercase tracking-tighter leading-tight">{role}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="bg-primary-900 dark:bg-primary-700 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300 ring-2 ring-primary-100 dark:ring-primary-900/50">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
