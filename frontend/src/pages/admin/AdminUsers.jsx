import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, Users, GraduationCap, Briefcase } from "lucide-react";

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
        const res = await axios.get("http://localhost:5000/api/admin/users", { headers });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
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

  if (loading) return <div className="p-10 text-center text-gray-500">Loading users...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 mt-2">Manage and monitor all platform participants</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              roleFilter === "ALL" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users size={16} /> All
          </button>
          <button
            onClick={() => setRoleFilter("STUDENT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              roleFilter === "STUDENT" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <GraduationCap size={16} /> Students
          </button>
          <button
            onClick={() => setRoleFilter("MENTOR")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              roleFilter === "MENTOR" ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Briefcase size={16} /> Mentors
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Expertise / Skills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {getInitials(user.name)}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === "STUDENT" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm italic">
                  {getUserDetails(user)}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                  No users match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
