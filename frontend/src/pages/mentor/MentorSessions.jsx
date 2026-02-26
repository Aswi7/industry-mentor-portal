import { Calendar, Clock, Users, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const MentorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get("http://localhost:5000/api/mentor/sessions", { headers });
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

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`http://localhost:5000/api/sessions/${sessionId}`, {
        status: newStatus
      }, { headers });

      // Refresh sessions
      const res = await axios.get("http://localhost:5000/api/mentor/sessions", { headers });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading sessions...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Session Management
          </h1>
          <p className="text-gray-500">
            Manage mentoring sessions and track students
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} />
          Create Session
        </button>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        All Sessions
      </h2>

      {/* Session Cards */}
      <div className="space-y-6">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {session.topic}
                    </h3>

                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      session.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                      session.status === "REQUESTED" ? "bg-yellow-100 text-yellow-700" :
                      session.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <p className="text-gray-500 mt-2">
                    Student: <span className="font-semibold">{session.student.name}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex gap-2">
                  {session.status === "REQUESTED" && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(session._id, "ACCEPTED")}
                        className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full hover:bg-green-200 transition"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(session._id, "REJECTED")}
                        className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded-full hover:bg-red-200 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Info */}
              <div className="flex gap-6 mt-5 text-gray-600 text-sm items-center">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {session.student.email}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl text-center text-gray-400">
            No sessions found. Create your first session!
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSessions;