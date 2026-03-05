import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function FindMentor() {
  const [sessions, setSessions] = useState([]);
  const [requestedMap, setRequestedMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const skillsList = [
    "System Design",
    "DSA",
    "Web Development",
    "Machine Learning",
    "Data Analytics",
    "Python",
    "React",
    "Node.js",
    "Database Design",
    "API Development",
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [openRes, myRes] = await Promise.all([
        axios.get("http://localhost:5000/api/sessions/open", { headers }),
        axios.get("http://localhost:5000/api/student/sessions", { headers }),
      ]);

      const openSessions = openRes.data.sessions || [];
      const myRequestedSessions = (myRes.data.sessions || []).filter(
        (s) => s.status === "REQUESTED"
      );

      // Keep requested sessions visible on Find Mentor so students can cancel.
      const openMap = new Map(openSessions.map((s) => [s._id, s]));
      myRequestedSessions.forEach((s) => openMap.set(s._id, s));
      setSessions(Array.from(openMap.values()));

      const pending = {};
      myRequestedSessions.forEach((s) => {
        pending[s._id] = true;
      });
      setRequestedMap(pending);
    } catch (err) {
      console.error(err);
      setSessions([]);
      setRequestedMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const mentor = session.mentor || {};
      const query = searchQuery.trim().toLowerCase();

      const matchesQuery =
        !query ||
        mentor.name?.toLowerCase().includes(query) ||
        mentor.email?.toLowerCase().includes(query) ||
        session.topic?.toLowerCase().includes(query) ||
        mentor.domain?.toLowerCase().includes(query);

      const matchesSkill =
        !selectedSkill ||
        (mentor.skills || []).includes(selectedSkill) ||
        session.topic?.toLowerCase().includes(selectedSkill.toLowerCase());

      return matchesQuery && matchesSkill;
    });
  }, [sessions, searchQuery, selectedSkill]);

  const handleRequestSession = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        "http://localhost:5000/api/sessions/request",
        { sessionId },
        { headers }
      );

      setRequestedMap((prev) => ({ ...prev, [sessionId]: true }));
      window.dispatchEvent(new Event("sessionChanged"));
      await fetchData();
      alert("Session request sent successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request session");
      console.error(error);
    }
  };

  const handleCancelRequest = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sessions/cancel/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.dispatchEvent(new Event("sessionChanged"));
      await fetchData();
      alert("Session request cancelled");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel request");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Find a Mentor</h1>
      <p className="text-gray-500 mb-6">
        Browse open sessions created by mentors and request one
      </p>

      <input
        type="text"
        placeholder="Search by mentor name, topic, or domain..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-xl border rounded-lg px-4 py-2 mb-4"
      />

      <div className="flex flex-wrap gap-3 mb-8">
        {skillsList.map((skill) => (
          <button
            key={skill}
            onClick={() => setSelectedSkill(selectedSkill === skill ? "" : skill)}
            className={`px-4 py-1 rounded-full border text-sm ${
              selectedSkill === skill
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading sessions...</p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-gray-500">No open sessions found.</p>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="bg-white shadow rounded-xl p-6 border">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                  {session.mentor?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{session.topic}</h2>
                  <p className="text-sm text-gray-500">by {session.mentor?.name || "Mentor"}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{session.mentor?.email}</p>
              {session.mentor?.domain && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Domain:</span> {session.mentor.domain}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {session.mentor?.skills && session.mentor.skills.length > 0 ? (
                  session.mentor.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-200 text-sm rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No skills listed</span>
                )}
              </div>

              <button
                onClick={() => handleRequestSession(session._id)}
                disabled={requestedMap[session._id]}
                className={`w-full ${
                  requestedMap[session._id]
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white py-2 rounded-lg`}
              >
                {requestedMap[session._id] ? "Requested" : "Request Session"}
              </button>

              {requestedMap[session._id] && (
                <button
                  onClick={() => handleCancelRequest(session._id)}
                  className="w-full mt-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  Cancel Request
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
