import { useEffect, useState } from "react"
import axios from "axios"

export default function FindMentor() {
  const [mentors, setMentors] = useState([])
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

  const handleRequestSession = async (mentorId, mentorName) => {
    try {
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

      alert("Session request sent successfully!")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request session")
      console.error(error)
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
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Request Session
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}