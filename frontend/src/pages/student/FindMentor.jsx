import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { X, Clock, Globe, Eye, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MentorDetailsModal = ({ mentor, onClose }) => {
  if (!mentor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            {mentor.profilePicture ? (
              <img
                src={`${API_BASE}${mentor.profilePicture}`}
                alt={`${mentor.name} profile`}
                className="w-20 h-20 rounded-full object-cover shadow-inner border border-blue-100"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl shadow-inner">
                {mentor.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
              <p className="text-blue-600 font-medium">{mentor.designation || "Mentor"}</p>
              <p className="text-gray-500 text-sm">{mentor.company || "Independent"}</p>
            </div>
          </div>

          <div className="space-y-6">
            {mentor.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Clock size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Experience</p>
                  <p className="text-sm text-gray-700 font-semibold">{mentor.yearsOfExperience || 0}+ Years</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Globe size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Domain</p>
                  <p className="text-sm text-gray-700 font-semibold">{mentor.domain || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills?.length ? (
                  mentor.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FindMentor() {
  const [sessions, setSessions] = useState([]);
  const [requestedMap, setRequestedMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

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
        API.get("/sessions/open", { headers }),
        API.get("/student/sessions", { headers }),
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

      await API.post(
        "/sessions/request",
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
      await API.delete(`/sessions/cancel/${sessionId}`, {
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

  const getScheduleDate = (session) => {
    if (!session?.startsAt) return "Date not set";
    const start = new Date(session.startsAt);
    if (Number.isNaN(start.getTime())) return "Date not set";
    return start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScheduleTime = (session) => {
    if (!session?.startsAt) return "Time not set";
    const start = new Date(session.startsAt);
    if (Number.isNaN(start.getTime())) return "Time not set";

    if (!session?.endsAt) {
      return start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const end = new Date(session.endsAt);
    if (Number.isNaN(end.getTime())) {
      return start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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
        className="w-full max-w-xl border rounded-lg px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      <div className="flex flex-wrap gap-3 mb-8">
        {skillsList.map((skill) => (
          <button
            key={skill}
            onClick={() => setSelectedSkill(selectedSkill === skill ? "" : skill)}
            className={`px-4 py-1 rounded-full border text-sm transition-all ${
              selectedSkill === skill
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
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
            <div key={session._id} className="bg-white shadow rounded-xl p-6 border hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-3">
                <div 
                  onClick={() => setSelectedMentor(session.mentor)}
                  className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors shadow-sm"
                  title="View Profile Details"
                >
                  {session.mentor?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{session.topic}</h2>
                    {session.type === "PAID" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        ₹{session.price}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        FREE
                      </span>
                    )}
                  </div>
                  <p 
                    onClick={() => setSelectedMentor(session.mentor)}
                    className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    by {session.mentor?.name || "Mentor"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{session.mentor?.email}</p>
              {(session.mentor?.designation || session.mentor?.company) && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Role:</span>{" "}
                  {[session.mentor?.designation, session.mentor?.company].filter(Boolean).join(" at ")}
                </p>
              )}
              {session.mentor?.domain && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Domain:</span> {session.mentor.domain}
                </p>
              )}
              {session.mentor?.yearsOfExperience === 0 || session.mentor?.yearsOfExperience ? (
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-semibold text-gray-700">Experience:</span> {session.mentor.yearsOfExperience} years
                </p>
              ) : null}

              <div className="mb-4 space-y-2 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="font-semibold">Date:</span>
                  <span>{getScheduleDate(session)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-semibold">Time:</span>
                  <span>{getScheduleTime(session)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {session.mentor?.skills && session.mentor.skills.length > 0 ? (
                  session.mentor.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No skills listed</span>
                )}
                {session.mentor?.skills?.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">+{session.mentor.skills.length - 3} more</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMentor(session.mentor)}
                  className="px-4 border border-slate-300 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Eye size={18} />
                  View Profile
                </button>
                <button
                  onClick={() => handleRequestSession(session._id)}
                  disabled={requestedMap[session._id]}
                  className={`flex-1 ${
                    requestedMap[session._id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  } text-white py-2 rounded-lg font-semibold transition-all shadow-sm`}
                >
                  {requestedMap[session._id] ? "Requested" : "Request Session"}
                </button>
                {requestedMap[session._id] && (
                  <button
                    onClick={() => handleCancelRequest(session._id)}
                    className="px-4 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    title="Cancel Request"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMentor && (
        <MentorDetailsModal 
          mentor={selectedMentor} 
          onClose={() => setSelectedMentor(null)} 
        />
      )}
    </div>
  );
}
