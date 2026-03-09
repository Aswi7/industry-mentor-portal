import { useEffect, useState } from "react";
import axios from "axios";

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get("http://localhost:5000/api/admin/sessions", { headers });
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const normalizeStatus = (status) => {
    if (status === "COMPLETED") return "COMPLETED";
    if (status === "CANCELED" || status === "REJECTED") return "CANCELED";
    return "UPCOMING";
  };

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "UPCOMING") return "bg-blue-100 text-blue-700";
    if (normalized === "COMPLETED") return "bg-green-100 text-green-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "UPCOMING") return "upcoming";
    if (normalized === "COMPLETED") return "completed";
    return "canceled";
  };

  if (loading) return <div className="p-8">Loading sessions...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

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
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => (
              <tr
                key={session._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-4">{session.topic}</td>
                <td className="p-4">{session.mentor?.name || "-"}</td>
                <td className="p-4">
                  {new Date(session.startsAt || session.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                      session.status
                    )}`}
                  >
                    {getStatusLabel(session.status)}
                  </span>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr className="border-t">
                <td className="p-4 text-gray-500" colSpan={4}>
                  No sessions found.
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
