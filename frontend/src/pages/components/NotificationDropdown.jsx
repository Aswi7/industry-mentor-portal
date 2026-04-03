import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, CheckCircle2, Calendar, X, Info } from "lucide-react";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/notifications/mark-as-read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      handleMarkAsRead();
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const highlightText = (text) => {
    if (!text) return text;

    // Split by parts to highlight: "Topic", dates, times, and status words
    const parts = text.split(/("[^"]+"|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}:\d{2}\s?(?:AM|PM)|Accepted|Rejected|Requested)/gi);

    return parts.map((part, i) => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return <span key={i} className="text-blue-600 dark:text-blue-400 font-bold">{part}</span>;
      }
      if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(part)) {
        return <span key={i} className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{part}</span>;
      }
      if (/\d{1,2}:\d{2}\s?(?:AM|PM)/i.test(part)) {
        return <span key={i} className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 px-1 rounded">{part}</span>;
      }
      if (/Accepted/i.test(part)) {
        return <span key={i} className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-tighter">{part}</span>;
      }
      if (/Rejected/i.test(part)) {
        return <span key={i} className="text-red-600 dark:text-red-400 font-black uppercase tracking-tighter">{part}</span>;
      }
      if (/Requested/i.test(part)) {
        return <span key={i} className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter">{part}</span>;
      }
      return part;
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "SESSION_ACCEPTED":
        return (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
        );
      case "SESSION_REJECTED":
        return (
          <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <X size={18} />
          </div>
        );
      case "SESSION_REQUESTED":
        return (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Calendar size={18} />
          </div>
        );
      case "SESSION_CREATED":
        return (
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calendar size={18} />
          </div>
        );
      case "SESSION_CANCELED":
        return (
          <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <X size={18} />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
            <Info size={18} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group"
      >
        <Bell size={22} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-dark-card flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-[360px] bg-white dark:bg-dark-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-dark-border z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
          <div className="p-5 border-b border-gray-50 dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-card">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Activity</h3>
              <p className="text-[10px] font-bold text-gray-400 dark:text-dark-subtext uppercase tracking-widest mt-0.5">Your notifications</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAsRead}
                className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full uppercase hover:bg-blue-600 hover:text-white transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-5 border-b border-gray-50 dark:border-dark-border last:border-0 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all flex gap-4 cursor-pointer relative group ${!notif.isRead ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}
                >
                  {!notif.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  
                  <div className="flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-bold text-gray-900 dark:text-white pr-2 ${!notif.isRead ? 'font-black' : ''}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-dark-subtext whitespace-nowrap">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-dark-subtext leading-relaxed">
                      {highlightText(notif.message)}
                    </div>
                    
                    {!notif.isRead && (
                       <div className="mt-2 flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                         <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight">New update</span>
                       </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center px-10">
                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg rounded-[2rem] flex items-center justify-center mx-auto text-gray-300 dark:text-gray-600 mb-6 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <Bell size={40} className="opacity-20" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">All caught up!</h4>
                <p className="text-xs text-gray-400 dark:text-dark-subtext mt-2 leading-relaxed">
                  You don't have any new notifications at the moment.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50/50 dark:bg-dark-bg/50 border-t border-gray-50 dark:border-dark-border">
            <button className="w-full py-3 text-xs font-black text-gray-500 dark:text-dark-subtext hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-dark-card rounded-2xl transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50 shadow-sm uppercase tracking-widest">
              See past activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
