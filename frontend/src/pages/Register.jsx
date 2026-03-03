import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Register() {
  const [role, setRole] = useState("STUDENT")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [skills, setSkills] = useState("")
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s)
      
      const userData = {
        role: role.toUpperCase(),
        name,
        email,
        password,
        ...(role.toUpperCase() === "MENTOR" && { 
          skills: skillsArray,
          domain 
        }),
        ...(role.toUpperCase() === "STUDENT" && { 
          studentSkills: skillsArray,
          studentDomain: domain
        })
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData
      )

      // Store token
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect based on role
      const dashboardRoutes = {
        STUDENT: "/student",
        MENTOR: "/mentor",
        ADMIN: "/admin"
      }

      navigate(dashboardRoutes[role.toUpperCase()])
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-lg">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 text-white p-4 rounded-xl text-2xl">
            🎓
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join MentorConnect Community today
        </p>

        <form onSubmit={handleRegister}>

          {/* Role Selection */}
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-600">I want to join as a</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "STUDENT"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => setRole("MENTOR")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "MENTOR"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Mentor
              </button>

              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "ADMIN"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-600">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-600">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Skills / Domain - Different for Student and Mentor */}
          <div className="mb-6">
            <label className="block text-sm mb-1 text-gray-600">
              {role === "MENTOR" ? "Skills" : "Skills / Interests"}
            </label>
            <input
              type="text"
              placeholder={role === "MENTOR" ? "React, Python, ML" : "React, Python, ML"}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
          </div>

          {/* Domain / Area of Interest */}
          <div className="mb-6">
            <label className="block text-sm mb-1 text-gray-600">
              {role === "MENTOR" ? "Expertise Domain" : "Area of Interest"}
            </label>
            <input
              type="text"
              placeholder={role === "MENTOR" ? "Web Development, AI/ML, etc." : "Frontend, Backend, etc."}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </p>

      </div>
    </div>
  )
}

export default Register
