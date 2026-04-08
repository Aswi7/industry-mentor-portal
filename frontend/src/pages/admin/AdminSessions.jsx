import { useEffect, useState } from "react";
import API from "../../services/api";
import { Calendar, Clock, Filter, Search, MoreHorizontal, AlertCircle, Inbox, Tag } from "lucide-react";

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await API.get("/admin/sessions", { headers });
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const normalizeStatus = (status) => {
    if (status === "COMPLETED") return "COMPLETED";
    if (status === "CANCELED" || status === "REJECTED") return "CANCELED";
    return "PENDING";
  };

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === "ALL" || normalizeStatus(session.status) === statusFilter;
    const matchesSearch = 
      session.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.mentor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "PENDING") return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    if (normalized === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
    return "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="h-12 bg-gray-200 dark:bg-dark-border rounded-xl w-full lg:w-96"></div>
          <div className="h-12 bg-gray-200 dark:bg-dark-border rounded-xl w-full lg:w-80"></div>
        </div>
        <div className="h-96 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 card">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Sessions</h3>
        <p className="text-gray-500 dark:text-dark-subtext mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black mb-1 dark:text-white">Session Management</h1>
          <p className="text-sm text-gray-500 dark:text-dark-subtext">
            Monitor and manage all mentoring activity
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-dark-card p-1.5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm overflow-x-auto no-scrollbar">
          {["ALL", "PENDING", "COMPLETED", "CANCELED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary-900 dark:bg-primary-600 text-white shadow-lg"
                  : "text-gray-500 dark:text-dark-subtext hover:bg-white dark:hover:bg-white/5"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search topic, mentor or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-dark-text shadow-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container shadow-soft">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Session Topic</th>
              <th>Participants</th>
              <th>Pricing Type</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <tr key={session._id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        {session.topic?.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-dark-text max-w-[200px] truncate" title={session.topic}>
                        {session.topic}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-gray-400 dark:text-dark-subtext tracking-tighter">Mentor:</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-dark-text">{session.mentor?.name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-gray-400 dark:text-dark-subtext tracking-tighter">Student:</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-dark-text">{session.student?.name || "Anonymous"}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {session.type === "PAID" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">
                        <Tag size={10} />
                        ₹{session.price}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-dark-subtext dark:border-dark-border">
                        FREE
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-dark-text">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(session.startsAt || session.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-dark-subtext font-medium mt-0.5">
                        <Clock size={12} className="text-gray-400" />
                        {new Date(session.startsAt || session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(
                        session.status
                      )}`}
                    >
                      {normalizeStatus(session.status)}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <Inbox size={48} className="opacity-20" />
                    <div>
                      <p className="text-lg font-bold">No sessions found</p>
                      <p className="text-sm italic">Try adjusting your filters or search query</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminSessions;
