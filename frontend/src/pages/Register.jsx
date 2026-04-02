import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const initialRole = (queryParams.get("role") || "STUDENT").toUpperCase();
  
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [skillInput, setSkillInput] = useState("");
  const [domain, setDomain] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = {
        role: role.toUpperCase(),
        name,
        email,
        phone,
        password,
        ...(role.toUpperCase() === "STUDENT" && { 
          studentSkills: skillInput.split(",").map((s) => s.trim()).filter(Boolean),
          studentDomain: domain
        })
      };

      const { data } = await API.post("/auth/register", userData);

      const token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (role.toUpperCase() === "MENTOR") {
        navigate("/mentor/profile");
      } else if (role.toUpperCase() === "STUDENT") {
        navigate("/student");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "STUDENT", label: "Student", icon: <GraduationCap size={16} />, color: "blue" },
    { id: "MENTOR", label: "Mentor", icon: <User size={16} />, color: "indigo" },
    { id: "ADMIN", label: "Admin", icon: <ShieldCheck size={16} />, color: "slate" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 py-12">
      <div className="bg-white w-full max-w-[800px] p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <GraduationCap size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Create Your Account
          </h2>
          <p className="text-slate-600 font-medium">
            Join the community and start your journey today
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-8">
          
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
              Join as a
            </label>
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    role === r.id
                      ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  {r.icon}
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold flex items-center gap-3 animate-shake">
              <CheckCircle2 size={18} className="text-red-500 rotate-180" />
              {error}
            </div>
          )}

          {role === "MENTOR" && (
            <div className="p-5 rounded-[2rem] bg-blue-50 border border-blue-100 text-blue-900">
              <h3 className="text-sm font-black uppercase tracking-widest">Profile setup comes next</h3>
              <p className="mt-2 text-sm font-medium text-blue-800">
                Create your account first, then complete the same mentor profile page used for editing and approval submission.
              </p>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={role === "MENTOR"}
                />
              </div>
            </div>

            {role === "STUDENT" && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Interests & Skills</label>
                  <input
                    type="text"
                    placeholder="React, Python..."
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Target Domain</label>
                  <input
                    type="text"
                    placeholder="Web Development..."
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Register Now
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </div>

          <p className="text-center text-sm font-medium text-slate-600">
            Already have an account? <a href="/" className="text-blue-600 font-bold hover:underline">Sign In</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
