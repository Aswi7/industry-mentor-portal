import { useEffect, useState, useRef } from "react"
import axios from "axios"

export default function FindMentor() {
  const [mentors, setMentors] = useState([])
  // mentorId -> { pending: boolean, sessionId?: string, loading?: boolean }
  const [requestedMap, setRequestedMap] = useState({})
  const [filteredMentors, setFilteredMentors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")
  const [loading, setLoading] = useState(false)

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
    "API Development"
  ]

  const pollingRefsRef = useRef({}) // mentorId -> intervalId

  const handleRequestSession = async (mentorId, mentorName) => {
    try {
      // indicate loading state so button can't be clicked twice
      setRequestedMap(prev => ({ ...prev, [mentorId]: { loading: true } }))

      const token = localStorage.getItem("token")

      const response = await axios.post(
        "http://localhost:5000/api/sessions/request",
        {
          mentorId,
          topic: `Mentorship with ${mentorName}`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.status === 201) {
        alert("Session request sent successfully!")
        // clear any canceled marker for this mentor so new request is tracked
        try {
          const cancelled = JSON.parse(localStorage.getItem("cancelledMentors") || "[]");
          const idx = cancelled.indexOf(mentorId);
          if (idx !== -1) {
            cancelled.splice(idx, 1);
            localStorage.setItem("cancelledMentors", JSON.stringify(cancelled));
          }
        } catch (e) {
          console.warn("failed to clear cancelledMentors", e);
        }
      } else if (response.status === 200) {
        // backend returns existing session when duplicate
        alert(response.data.message || "Session already requested")
      }

      // record session id if provided
      const returnedSession = response.data?.session
      if (returnedSession && returnedSession._id) {
        setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: true, sessionId: returnedSession._id } }))
      } else {
        // clear loading if no session returned
        setRequestedMap(prev => ({ ...prev, [mentorId]: { loading: false } }))
      }

      // If session is still REQUESTED, poll until mentor responds
      const startPolling = () => {
        // avoid multiple intervals
        if (pollingRefsRef.current[mentorId]) return

        const intervalId = setInterval(async () => {
          try {
            const tokenInner = localStorage.getItem("token")
            const res = await axios.get("http://localhost:5000/api/student/sessions", { headers: { Authorization: `Bearer ${tokenInner}` } })
            const sessions = res.data.sessions || []

            const match = sessions.find(s => s.mentor._id === mentorId && s.topic === `Mentorship with ${mentorName}`)
            if (!match) {
              // no matching session found; re-enable
              clearInterval(pollingRefsRef.current[mentorId])
              delete pollingRefsRef.current[mentorId]
              setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }))
              return
            }

            if (match.status !== "REQUESTED") {
              // mentor has acted; re-enable button
              clearInterval(pollingRefsRef.current[mentorId])
              delete pollingRefsRef.current[mentorId]
              setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }))
            }
          } catch (err) {
            console.error(err)
          }
        }, 5000)

        pollingRefsRef.current[mentorId] = intervalId
      }

      if (!returnedSession || returnedSession.status === "REQUESTED") {
        startPolling()
      } else {
        // No pending request — re-enable
        setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }))
      }

      // safety: stop polling after 10 minutes
      setTimeout(() => {
        if (pollingRefsRef.current[mentorId]) {
          clearInterval(pollingRefsRef.current[mentorId])
          delete pollingRefsRef.current[mentorId]
          setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }))
        }
      }, 10 * 60 * 1000)

    } catch (error) {
      alert(error.response?.data?.message || "Failed to request session")
      console.error(error)
      setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }))
    }
  }

  const handleCancelRequest = async (mentorId) => {
    let sessionId = requestedMap[mentorId]?.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      alert("Unable to cancel: session ID is missing or invalid");
      return;
    }

    // mark this mentor as cancelled locally so we don't re-enable immediately on reload
    try {
      const cancelled = JSON.parse(localStorage.getItem("cancelledMentors") || "[]");
      if (!cancelled.includes(mentorId)) {
        cancelled.push(mentorId);
        localStorage.setItem("cancelledMentors", JSON.stringify(cancelled));
      }
    } catch (e) {
      console.warn("failed to update cancelledMentors", e);
    }

    // basic ObjectId format check
    if (!/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      console.warn("invalid sessionId format", sessionId);
      alert("Unable to cancel: session ID appears invalid");
      setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }));
      return;
    }

    try {
      console.log("cancelling session", sessionId);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/sessions/cancel/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // stop polling if any
      if (pollingRefsRef.current[mentorId]) {
        clearInterval(pollingRefsRef.current[mentorId]);
        delete pollingRefsRef.current[mentorId];
      }
      setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }));
      alert("Session request cancelled");
+      // notify other components (like a sessions list) that a change occurred
+      window.dispatchEvent(new Event('sessionChanged'));
    } catch (err) {
      console.error("cancel error", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "Unknown error";
      if (status === 404) {
        // session already removed
        setRequestedMap(prev => ({ ...prev, [mentorId]: { pending: false } }));
        alert("Session no longer exists");
      } else {
        alert(`Failed to cancel request: ${msg}`);
      }
    }
  }

  // 🔥 Search mentors with filters
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        // Build query params
        let url = "http://localhost:5000/api/student/mentors"
        const params = new URLSearchParams()
        
        if (selectedSkill) {
          params.append("skill", selectedSkill)
        }
        
        if (params.toString()) {
          url += "?" + params.toString()
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setMentors(res.data.mentors)
        setFilteredMentors(res.data.mentors)
        
        // also update pending status from server till cancellation list
        const sessRes = await axios.get("http://localhost:5000/api/student/sessions", { headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }, params: { t: Date.now() } });
        const sessions = sessRes.data.sessions || [];
        const pending = {};
        const cancelled = JSON.parse(localStorage.getItem("cancelledMentors") || "[]");
        sessions.forEach(s => {
          if (s.status === "REQUESTED" && s.mentor) {
            // skip mentors recently cancelled locally
            if (cancelled.includes(s.mentor._id)) return;
            pending[s.mentor._id] = { pending: true, sessionId: s._id };
          }
        });

        // clear any cancelled entries that no longer correspond to a pending session
        const remaining = cancelled.filter(id => !(id in pending));
        localStorage.setItem("cancelledMentors", JSON.stringify(remaining));

        setRequestedMap(prev => ({ ...prev, ...pending }));
      } catch (error) {
        console.error(error)
        setMentors([])
        setFilteredMentors([])
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [selectedSkill])

  // On mount, load any existing REQUESTED sessions so they remain disabled after reload
  useEffect(() => {
    const markPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/student/sessions", { headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }, params: { t: Date.now() } });
        const sessions = res.data.sessions || [];
        const pending = {};
        sessions.forEach(s => {
          if (s.status === "REQUESTED" && s.mentor) {
            pending[s.mentor._id] = { pending: true, sessionId: s._id };
          }
        });
        setRequestedMap(prev => ({ ...prev, ...pending }));
      } catch (err) {
        console.error(err);
      }
    };

    markPending();

    return () => {
      Object.values(pollingRefsRef.current).forEach(id => clearInterval(id));
      pollingRefsRef.current = {};
    };
  }, [])

  // 🔥 Client-side search by name
  useEffect(() => {
    let updated = mentors

    if (searchQuery) {
      updated = updated.filter((mentor) =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredMentors(updated)
  }, [searchQuery, mentors])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Find a Mentor</h1>
      <p className="text-gray-500 mb-6">
        Search mentors by name, company, or skill
      </p>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search mentors by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-xl border rounded-lg px-4 py-2 mb-4"
      />

      {/* 🎯 Skill Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {skillsList.map((skill) => (
          <button
            key={skill}
            onClick={() =>
              setSelectedSkill(selectedSkill === skill ? "" : skill)
            }
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

      {/* 👨‍🏫 Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading mentors...</p>
        ) : filteredMentors.length === 0 ? (
          <p className="text-gray-500">No mentors found matching your search.</p>
        ) : (
          filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              className="bg-white shadow rounded-xl p-6 border"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                  {mentor.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{mentor.name}</h2>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {mentor.bio || "No bio provided"}
              </p>

              {mentor.domain && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Domain:</span> {mentor.domain}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.skills && mentor.skills.length > 0 ? (
                  mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-200 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No skills listed</span>
                )}
              </div>

              <button
                onClick={() => handleRequestSession(mentor._id, mentor.name)}
                disabled={requestedMap[mentor._id]?.pending || requestedMap[mentor._id]?.loading}
                className={`w-full ${requestedMap[mentor._id]?.pending || requestedMap[mentor._id]?.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 rounded-lg`}
              >
                {requestedMap[mentor._id]?.pending ? 'Requested' : requestedMap[mentor._id]?.loading ? 'Requested...' : 'Request Session'}
              </button>
              {requestedMap[mentor._id]?.pending && (
                <button
                  onClick={() => handleCancelRequest(mentor._id)}
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
  )
}