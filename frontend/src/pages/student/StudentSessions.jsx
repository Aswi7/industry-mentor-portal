import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get("http://localhost:5000/api/student/sessions", { headers });
        setSessions(res.data.sessions);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load sessions");
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-600";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-600";
      case "COMPLETED":
        return "bg-green-100 text-green-600";
      case "REJECTED":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "REQUESTED":
        return "Pending";
      case "ACCEPTED":
        return "Upcoming";
      case "COMPLETED":
        return "Completed";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  if (loading) return <div className="p-6 text-center">Loading sessions...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">My Sessions</h1>
        <p className="text-gray-500">
          View and manage your mentoring sessions
        </p>
      </div>

      {/* Session Cards */}
      <div className="space-y-5">

        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
            >

              <div className="space-y-2">

                <h2 className="text-xl font-semibold">
                  {session.topic}
                </h2>

                <p className="text-gray-600 text-sm">
                  with {session.mentor.name}
                </p>

                <p className="text-gray-600 text-sm">
                  {new Date(session.createdAt).toLocaleDateString()} • Mentoring Session
                </p>

              </div>

              {/* Status Badge */}
              <div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                    session.status
                  )}`}
                >
                  {getStatusLabel(session.status)}
                </span>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            No sessions yet. Find a mentor to get started!
          </div>
        )}

      </div>

    </div>
  );
};

export default StudentSessions;