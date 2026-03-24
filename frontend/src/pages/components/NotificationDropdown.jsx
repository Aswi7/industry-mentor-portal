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

  const getIcon = (type) => {
    switch (type) {
      case "SESSION_ACCEPTED": return <CheckCircle2 size={16} className="text-green-500" />;
      case "SESSION_REQUESTED": return <Calendar size={16} className="text-blue-500" />;
      case "SESSION_CANCELED": return <X size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">New</span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{notif.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Bell size={24} />
                </div>
                <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50/50 border-t border-gray-50">
            <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
