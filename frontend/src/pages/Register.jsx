import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Award, 
  Globe, 
  Linkedin, 
  GraduationCap, 
  ShieldCheck, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Camera,
  Briefcase,
  Plus,
  Trash2
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
  
  // Mentor Specific Fields
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [domain, setDomain] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [bio, setBio] = useState("");
  
  // Profile Picture
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    const next = skillInput.split(",").map(s => s.trim()).filter(Boolean);
    if (next.length === 0) return;
    setSkills(prev => Array.from(new Set([...prev, ...next])));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const finalSkills = [...skills];
      if (skillInput.trim()) {
        const next = skillInput.split(",").map(s => s.trim()).filter(Boolean);
        next.forEach(s => { if (!finalSkills.includes(s)) finalSkills.push(s); });
      }

      const userData = {
        role: role.toUpperCase(),
        name,
        email,
        phone,
        password,
        ...(role.toUpperCase() === "MENTOR" && { 
          skills: finalSkills,
          domain,
          company,
          designation,
          yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
          bio
        }),
        ...(role.toUpperCase() === "STUDENT" && { 
          studentSkills: finalSkills,
          studentDomain: domain
        })
      };

      const { data } = await API.post("/auth/register", userData);

      const token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Handle Profile Picture Upload if it's a mentor and file is selected
      if (role.toUpperCase() === "MENTOR" && profileFile) {
        const formData = new FormData();
        formData.append("profilePicture", profileFile);
        try {
          await API.post("/mentor/profile-picture", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          });
        } catch (uploadErr) {
          console.error("Profile picture upload failed:", uploadErr);
        }
      }

      if (role.toUpperCase() === "MENTOR") {
        navigate("/mentor");
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

  const handleLinkedinSignup = () => {
    setLinkedinLoading(true);
    window.location.href = `http://localhost:5000/api/auth/linkedin?role=${role.toUpperCase()}`;
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

          {/* Profile Picture (Mentors Only) */}
          {role === "MENTOR" && (
            <div className="flex flex-col items-center gap-4 py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="relative group">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-200 flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
                    <User size={48} />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
                  <Camera size={20} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Profile Photo</p>
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

            {role === "MENTOR" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Current Company</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Designation</label>
                  <div className="relative group">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Senior Engineer"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Years of Experience</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Expertise Domain</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Web Development"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Skills & Expertise</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Add skills (e.g. React, Python)"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                    </div>
                    <button type="button" onClick={addSkill} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all"><Plus size={20} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}><Trash2 size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Short Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

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

            {role === "MENTOR" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Signup</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                <button
                  type="button"
                  onClick={handleLinkedinSignup}
                  disabled={linkedinLoading}
                  className="w-full bg-[#0077B5] text-white py-4 rounded-2xl font-bold hover:bg-[#006399] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/10 active:scale-[0.99] disabled:opacity-60"
                >
                  {linkedinLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Linkedin size={20} fill="white" />
                      Sign up with LinkedIn
                    </>
                  )}
                </button>
              </div>
            )}
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
