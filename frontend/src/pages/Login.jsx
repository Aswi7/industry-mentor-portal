import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, GraduationCap, ShieldCheck, User } from "lucide-react";
import API from "../services/api";

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[450px] p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
            <GraduationCap size={32} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-600 font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
              Login as
            </label>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    role === r.id
                      ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Password
              </label>
              <a href="#" className="text-[11px] font-bold text-blue-600 hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          <p className="text-center mt-8 text-sm font-medium text-slate-600">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 font-bold hover:underline">
              Create one now
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
