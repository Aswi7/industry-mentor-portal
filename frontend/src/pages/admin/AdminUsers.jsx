import { useEffect, useMemo, useState } from "react";
import axios from "axios";

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
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const details = getUserDetails(user).toLowerCase();
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        details.includes(q)
      );
    });
  }, [users, query]);

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading users...</div>;
  }

  if (error) {
    return <div style={{ padding: "30px", color: "#dc2626" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "30px", background: "#f4f6f9", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "600" }}>User Management</h2>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Manage all platform users
      </p>

      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "350px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          background: "white",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#eef1f6" }}>
            <tr>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} style={{ borderTop: "1px solid #eee" }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        background: "#d0e2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        color: "#1d4ed8",
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      background:
                        user.role === "STUDENT" ? "#e0edff" : "#d1fae5",
                      color:
                        user.role === "STUDENT" ? "#2563eb" : "#059669",
                      fontWeight: "500",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={tdStyle}>{getUserDetails(user)}</td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "15px",
  fontSize: "14px",
};

const tdStyle = {
  padding: "15px",
  fontSize: "14px",
};
