import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { Search, Users, GraduationCap, Briefcase, UserX, AlertCircle } from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");

const getUserDetails = (user) => {
  if (user.role === "MENTOR") {
    if (user.skills?.length) return user.skills.join(", ");
    return user.domain || "-";
  }
  if (user.role === "STUDENT") {
    if (user.studentSkills?.length) return user.studentSkills.join(", ");
    return user.studentDomain || "-";
  }
  return "-";
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await API.get("/admin/users", { headers });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(
      (user) => !(user.role === "MENTOR" && user.mentorStatus === "REJECTED")
    );

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((user) => {
      const details = getUserDetails(user).toLowerCase();
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        details.includes(q)
      );
    });
  }, [users, query, roleFilter]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-12 bg-gray-200 dark:bg-dark-border rounded-xl w-full md:w-96"></div>
          <div className="h-12 bg-gray-200 dark:bg-dark-border rounded-xl w-full md:w-64"></div>
        </div>
        <div className="h-96 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 card">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Users</h3>
        <p className="text-gray-500 dark:text-dark-subtext mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black mb-1 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">Manage and monitor all platform participants</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-dark-text shadow-sm"
          />
        </div>

        <div className="flex bg-gray-100 dark:bg-dark-card p-1.5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Users", icon: <Users size={16} /> },
            { id: "STUDENT", label: "Students", icon: <GraduationCap size={16} /> },
            { id: "MENTOR", label: "Mentors", icon: <Briefcase size={16} /> }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setRoleFilter(filter.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                roleFilter === filter.id 
                  ? "bg-primary-900 dark:bg-primary-600 text-white shadow-lg" 
                  : "text-gray-500 dark:text-dark-subtext hover:bg-white dark:hover:bg-white/5"
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container shadow-soft">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>User Information</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Expertise / Skills</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 flex items-center justify-center font-black text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-dark-text">{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-gray-600 dark:text-dark-subtext font-medium">{user.email}</span>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      user.role === "STUDENT" 
                        ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-500 dark:text-dark-subtext text-xs italic line-clamp-1 max-w-xs">
                      {getUserDetails(user)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <UserX size={48} className="opacity-20" />
                    <div>
                      <p className="text-lg font-bold">No users found</p>
                      <p className="text-sm italic">Try adjusting your search or filters</p>
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
}
