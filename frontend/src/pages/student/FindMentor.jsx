import { useEffect, useState } from "react"
import axios from "axios"

export default function FindMentor() {
  const [mentors, setMentors] = useState([])
  const [filteredMentors, setFilteredMentors] = useState([])
  const [search, setSearch] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")

  const skillsList = [
    "System Design",
    "DSA",
    "Web Development",
    "Machine Learning",
    "Data Analytics",
    "Python",
  ]

  // 🔥 Fetch mentors from backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem("token")

        const res = await axios.get(
          "http://localhost:5000/api/users/mentors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setMentors(res.data)
        setFilteredMentors(res.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchMentors()
  }, [])

  // 🔥 Search + Filter logic
  useEffect(() => {
    let updated = mentors

    if (search) {
      updated = updated.filter((mentor) =>
        mentor.name.toLowerCase().includes(search.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(search.toLowerCase()) ||
        mentor.skills?.some((skill) =>
          skill.toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    if (selectedSkill) {
      updated = updated.filter((mentor) =>
        mentor.skills?.includes(selectedSkill)
      )
    }

    setFilteredMentors(updated)
  }, [search, selectedSkill, mentors])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Find a Mentor</h1>
      <p className="text-gray-500 mb-6">
        Search mentors by name, company, or skill
      </p>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search mentors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
        {filteredMentors.map((mentor) => (
          <div
            key={mentor._id}
            className="bg-white shadow rounded-xl p-6 border"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                {mentor.name?.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{mentor.name}</h2>
                <p className="text-sm text-gray-500">
                  {mentor.title} • {mentor.company}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {mentor.bio}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-200 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Request Session
            </button>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <p className="text-gray-500 mt-8">
          No mentors found.
        </p>
      )}
    </div>
  )
}