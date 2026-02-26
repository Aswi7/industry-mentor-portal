import { Users, Calendar, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function MentorOverview() {
  const [mentorName, setMentorName] = useState("")
  const [stats, setStats] = useState({ mentees: 0, upcoming: 0, pending: 0, completed: 0 })
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch mentor profile (for name)
        const profileRes = await axios.get("http://localhost:5000/api/mentor/profile", { headers })
        setMentorName(profileRes.data.mentor.name)

        // Fetch stats
        const statsRes = await axios.get("http://localhost:5000/api/mentor/stats", { headers })
        setStats(statsRes.data.stats)

        // Fetch pending requests
        const requestsRes = await axios.get("http://localhost:5000/api/mentor/pending-requests", { headers })
        setPendingRequests(requestsRes.data.pendingRequests.slice(0, 1)) // Show first pending request

        // Fetch sessions
        const sessionsRes = await axios.get("http://localhost:5000/api/mentor/sessions", { headers })
        const upcoming = sessionsRes.data.sessions.filter(s => s.status === "ACCEPTED").slice(0, 1)
        setUpcomingSessions(upcoming)

        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Failed to load data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-red-500 py-10">{error}</div>

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {mentorName || "Mentor"}!</h1>
        <p className="text-gray-500">Your mentoring dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users />} value={stats.mentees} label="Mentees" />
        <StatCard icon={<Calendar />} value={stats.upcoming} label="Upcoming" />
        <StatCard icon={<Clock />} value={stats.pending} label="Pending Requests" />
        <StatCard icon={<CheckCircle />} value={stats.completed} label="Completed" />
      </div>

      {/* Lower Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            Upcoming Sessions
          </h2>

          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => (
              <div key={session._id} className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {session.topic}
                  </p>
                  <p className="text-sm text-gray-500">
                    with {session.student.name}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  Scheduled
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No upcoming sessions</p>
          )}
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            Pending Requests
          </h2>

          {pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <div key={request._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {request.topic}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.student.name}
                  </p>
                </div>
                <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No pending requests</p>
          )}
        </div>

      </div>
    </>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )
}