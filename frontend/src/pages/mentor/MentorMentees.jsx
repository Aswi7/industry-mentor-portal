import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorMentees() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const requestsRes = await axios.get("http://localhost:5000/api/mentor/pending-requests", { headers });

      setPendingRequests(requestsRes.data.pendingRequests || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load requests");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleRequestAction = async (sessionId, action) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`http://localhost:5000/api/sessions/${action}/${sessionId}`, {}, { headers });
      await fetchPendingRequests();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} session`);
    }
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <div className="p-8 text-center">Loading mentees...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        My Mentees
      </h1>
      <p className="text-gray-600 mt-1">
        Student session requests
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending student requests</p>
        ) : (
          pendingRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {getInitials(request.student?.name)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {request.student?.name || "Unknown student"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {request.student?.email || "No email"}
                  </p>
                  <p className="mt-3 text-sm text-gray-700">
                    Requested Session: <span className="font-semibold">{request.topic}</span>
                  </p>

                  {/* Skills */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {request.student?.skills && request.student.skills.length > 0 ? (
                      request.student.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No skills listed</span>
                    )}
                  </div>

                  {/* Domain */}
                  <div className="mt-3 text-sm text-gray-700">
                    <p>Domain: <span className="font-semibold">{request.student?.domain || "Not specified"}</span></p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleRequestAction(request._id, "accept")}
                      className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full hover:bg-green-200 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestAction(request._id, "reject")}
                      className="bg-red-100 text-red-700 px-3 py-1 text-sm rounded-full hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
