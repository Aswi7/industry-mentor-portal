import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

function Login() {

  // ✅ Navigation
  const navigate = useNavigate()

  // ✅ States
  const [role, setRole] = useState("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ✅ Login Function
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role
      })

      // Save token
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      // Convert role to lowercase (VERY IMPORTANT)
      const userRole = res.data.user.role.toLowerCase()

      if (userRole === "student") {
        navigate("/student")
      } 
      else if (userRole === "mentor") {
        navigate("/mentor")
      } 
      else {
        navigate("/admin")
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // ✅ RETURN STARTS HERE

    return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <form
      onSubmit={handleLogin}
      className="bg-white w-[420px] p-8 rounded-2xl shadow-lg"
    >

      <div className="flex justify-center mb-4">
        <div className="bg-blue-600 text-white p-4 rounded-xl text-2xl">
          🎓
        </div>
      </div>

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
          {["student", "mentor", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg border ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm mb-1 text-gray-600">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm mb-1 text-gray-600">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          Register
        </a>
      </p>

    </form>
  </div>
   )
}


export default Login


