import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, GraduationCap, ShieldCheck, User, AlertCircle } from "lucide-react";
import API from "../services/api";
import ThemeToggle from "./components/ThemeToggle";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const userRole = res.data.user.role.toLowerCase();

      if (userRole === "student") {
        navigate("/student");
      } else if (userRole === "mentor") {
        const mentorStatus = res.data.user.mentorStatus;
        if (mentorStatus === "VERIFIED" || mentorStatus === "ACTIVE") {
          navigate("/mentor");
        } else {
          navigate("/mentor/pending");
        }
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "student", label: "Student", icon: <GraduationCap size={16} /> },
    { id: "mentor", label: "Mentor", icon: <User size={16} /> },
    { id: "admin", label: "Admin", icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] card p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-900 dark:bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/20 rotate-3">
            <GraduationCap size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-subtext font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-dark-subtext uppercase tracking-widest ml-1">
              Login as
            </label>
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-100 dark:border-dark-border">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                    role === r.id
                      ? "bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-md ring-1 ring-gray-200 dark:ring-dark-border"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-dark-text"
                  }`}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-black text-gray-400 dark:text-dark-subtext uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-gray-900/20 focus:bg-white dark:focus:bg-dark-card focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-sm dark:text-dark-text"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label htmlFor="password" title="Password" className="text-[10px] font-black text-gray-400 dark:text-dark-subtext uppercase tracking-widest">
                Password
              </label>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-gray-900/20 focus:bg-white dark:focus:bg-dark-card focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium text-sm dark:text-dark-text"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="uppercase tracking-widest text-xs font-black">Sign In</span>
              </>
            )}
          </button>

          <p className="text-center mt-6 text-sm font-medium text-gray-500 dark:text-dark-subtext">
            Don't have an account?{" "}
            <a href="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Create one now
            </a>
          </p>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-gray-100 dark:bg-dark-border flex-1" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry Professional?</span>
            <div className="h-px bg-gray-100 dark:bg-dark-border flex-1" />
          </div>

          <button
            type="button"
            onClick={() => navigate("/register?role=MENTOR")}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <User size={16} className="text-primary-600 dark:text-primary-400" />
            Become a Mentor
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
