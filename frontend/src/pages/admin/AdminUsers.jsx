import React from "react";

const users = [
  {
    initials: "AS",
    name: "Arjun Sharma",
    email: "arjun@student.edu",
    role: "student",
    details: "React, Python, Data Structures",
  },
  {
    initials: "PP",
    name: "Priya Patel",
    email: "priya@student.edu",
    role: "student",
    details: "Java, Machine Learning, SQL",
  },
  {
    initials: "RK",
    name: "Rajesh Kumar",
    email: "rajesh@mentor.com",
    role: "mentor",
    details: "Google",
  },
  {
    initials: "SR",
    name: "Sneha Reddy",
    email: "sneha@mentor.com",
    role: "mentor",
    details: "Microsoft",
  },
];

export default function AdminUsers() {
  return (
    <div style={{ padding: "30px", background: "#f4f6f9", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "600" }}>User Management</h2>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Manage all platform users
      </p>

      <input
        type="text"
        placeholder="Search users..."
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
            {users.map((user, index) => (
              <tr key={index} style={{ borderTop: "1px solid #eee" }}>
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
                      {user.initials}
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
                        user.role === "student" ? "#e0edff" : "#d1fae5",
                      color:
                        user.role === "student" ? "#2563eb" : "#059669",
                      fontWeight: "500",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={tdStyle}>{user.details}</td>
              </tr>
            ))}
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