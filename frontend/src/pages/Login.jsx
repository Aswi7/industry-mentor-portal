import { useState } from "react"

function Login() {
  const [role, setRole] = useState("student")

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
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your MentorConnect account
        </p>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-gray-600">I am a</p>
          <div className="flex gap-2">
            <button
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

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-600">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm mb-1 text-gray-600">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Sign In
        </button>

        {/* Register Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
