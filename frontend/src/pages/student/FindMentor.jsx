import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import { X, Clock, Globe, Eye, Calendar } from "lucide-react";

const API_BASE = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000");

const MentorDetailsModal = ({ mentor, onClose }) => {
  if (!mentor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-200"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            {mentor.profilePicture ? (
              <img
                src={`${API_BASE}${mentor.profilePicture}`}
                alt={`${mentor.name} profile`}
                className="h-20 w-20 rounded-full border border-blue-100 object-cover shadow-inner dark:border-blue-900/60"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 shadow-inner dark:bg-blue-950/70 dark:text-blue-200">
                {mentor.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{mentor.name}</h2>
              <p className="font-medium text-blue-600 dark:text-blue-300">{mentor.designation || "Mentor"}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{mentor.company || "Independent"}</p>
            </div>
          </div>

          <div className="space-y-6">
            {mentor.bio && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">About</h3>
                <p className="leading-relaxed text-gray-700 dark:text-slate-300">{mentor.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Clock size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-slate-500">Experience</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{mentor.yearsOfExperience || 0}+ Years</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-blue-500"><Globe size={18} /></div>
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-slate-500">Domain</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{mentor.domain || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills?.length ? (
                  mentor.skills.map((skill, i) => (
                    <span key={i} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm italic text-gray-400 dark:text-slate-500">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end bg-gray-50 p-4 dark:bg-slate-950/60">
          <button 
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
    <div className="p-8 text-slate-900 dark:text-slate-100">
      <h1 className="mb-1 text-2xl font-semibold">Find a Mentor</h1>
      <p className="mb-6 text-gray-500 dark:text-slate-400">
        Browse open sessions created by mentors and request one
      </p>

      <input
        type="text"
        placeholder="Search by mentor name, topic, or domain..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full max-w-xl rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />

      <div className="flex flex-wrap gap-3 mb-8">
        {skillsList.map((skill) => (
          <button
            key={skill}
            onClick={() => setSelectedSkill(selectedSkill === skill ? "" : skill)}
            className={`px-4 py-1 rounded-full border text-sm transition-all ${
              selectedSkill === skill
                ? "border-blue-600 bg-blue-600 text-white shadow-md"
                : "border-slate-200 bg-gray-100 text-slate-700 hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500 dark:text-slate-400">Loading sessions...</p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No open sessions found.</p>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="rounded-xl border border-slate-200 bg-white p-6 shadow transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-4 mb-3">
                <div 
                  onClick={() => setSelectedMentor(session.mentor)}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-200 dark:bg-blue-950/70 dark:text-blue-200 dark:hover:bg-blue-900/70"
                  title="View Profile Details"
                >
                  {session.mentor?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{session.topic}</h2>
                    {session.type === "PAID" ? (
                      <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        ₹{session.price}
                      </span>
                    ) : (
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        FREE
                      </span>
                    )}
                  </div>
                  <p 
                    onClick={() => setSelectedMentor(session.mentor)}
                    className="cursor-pointer text-sm text-gray-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
                  >
                    by {session.mentor?.name || "Mentor"}
                  </p>
                </div>
              </div>

              <p className="mb-2 text-sm text-gray-600 dark:text-slate-300">{session.mentor?.email}</p>
              {(session.mentor?.designation || session.mentor?.company) && (
                <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Role:</span>{" "}
                  {[session.mentor?.designation, session.mentor?.company].filter(Boolean).join(" at ")}
                </p>
              )}
              {session.mentor?.domain && (
                <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Domain:</span> {session.mentor.domain}
                </p>
              )}
              {session.mentor?.yearsOfExperience === 0 || session.mentor?.yearsOfExperience ? (
                <p className="mb-3 text-sm text-gray-500 dark:text-slate-400">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">Experience:</span> {session.mentor.yearsOfExperience} years
                </p>
              ) : null}

              <div className="mb-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="font-semibold">Date:</span>
                  <span>{getScheduleDate(session)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-semibold">Time:</span>
                  <span>{getScheduleTime(session)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {session.mentor?.skills && session.mentor.skills.length > 0 ? (
                  session.mentor.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm italic text-gray-400 dark:text-slate-500">No skills listed</span>
                )}
                {session.mentor?.skills?.length > 3 && (
                  <span className="self-center text-[10px] text-gray-400 dark:text-slate-500">+{session.mentor.skills.length - 3} more</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMentor(session.mentor)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
                    className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
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
