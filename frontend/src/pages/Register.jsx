import { useState } from "react"

function Register() {
  const [role, setRole] = useState("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [skills, setSkills] = useState("")

  const handleRegister = (e) => {
    e.preventDefault()

    const userData = {
      role,
      name,
      email,
      password,
      skills
    }

    console.log(userData)
    alert("Form submitted (connect backend next)")
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
                onClick={() => setRole("student")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "mentor"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Mentor
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2 rounded-lg border ${
                  role === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

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

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm mb-1 text-gray-600">
              Skills / Interests
            </label>
            <input
              type="text"
              placeholder="React, Python, ML"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Account
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
