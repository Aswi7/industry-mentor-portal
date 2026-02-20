import React from "react";

const AdminSessions = () => {
  const sessions = [
    {
      title: "System Design Fundamentals",
      mentor: "Rajesh Kumar",
      student: "Arjun Sharma",
      date: "2026-02-15 10:00 AM",
      status: "upcoming",
    },
    {
      title: "ML Model Deployment",
      mentor: "Sneha Reddy",
      student: "Priya Patel",
      date: "2026-02-14 2:00 PM",
      status: "upcoming",
    },
    {
      title: "DSA Problem Solving",
      mentor: "Rajesh Kumar",
      student: "Arjun Sharma",
      date: "2026-02-10 11:00 AM",
      status: "completed",
    },
    {
      title: "Python for Data Science",
      mentor: "Sneha Reddy",
      student: "Priya Patel",
      date: "2026-02-08 3:00 PM",
      status: "completed",
    },
    {
      title: "Web Dev Best Practices",
      mentor: "Rajesh Kumar",
      student: "Priya Patel",
      date: "2026-02-16 4:00 PM",
      status: "pending",
    },
    {
      title: "Data Analytics Workshop",
      mentor: "Sneha Reddy",
      student: "Arjun Sharma",
      date: "2026-02-05 1:00 PM",
      status: "cancelled",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Sessions</h1>
        <p className="text-gray-500">
          Monitor all platform sessions
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Mentor</th>
              <th className="p-4">Student</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-4">{session.title}</td>
                <td className="p-4">{session.mentor}</td>
                <td className="p-4">{session.student}</td>
                <td className="p-4">{session.date}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminSessions;