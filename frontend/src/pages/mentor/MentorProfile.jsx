import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Briefcase, 
  Award, 
  Phone as PhoneIcon, 
  Mail, 
  Camera, 
  Globe, 
  Linkedin,
  Plus,
  ChevronRight,
  CheckCircle,
  Info,
  Save,
  Send
} from "lucide-react";
import API from "../../services/api";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getInitials = (name) => {
  if (!name) return "M";
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

export default function MentorProfile() {
  const navigate = useNavigate();
  const storedUser = useMemo(() => getStoredUser() || {}, []);
  const isApprovedMentor = ["VERIFIED", "ACTIVE"].includes(storedUser.mentorStatus);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [mentor, setMentor] = useState(() => storedUser);
  const [skills, setSkills] = useState(() => (Array.isArray(storedUser.skills) ? storedUser.skills : []));
  const [skillInput, setSkillInput] = useState("");

  const [company, setCompany] = useState(() => storedUser.company ?? "");
  const [designation, setDesignation] = useState(() => storedUser.designation ?? "");
  const [yearsOfExperience, setYearsOfExperience] = useState(() => {
    if (storedUser.yearsOfExperience === 0 || storedUser.yearsOfExperience) {
      return String(storedUser.yearsOfExperience);
    }
    return "";
  });
  const [domain, setDomain] = useState(() => storedUser.domain ?? "");
  const [bio, setBio] = useState(() => storedUser.bio ?? "");
  const [phone, setPhone] = useState(() => storedUser.phone ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => storedUser.linkedinUrl ?? "");
  const [xUrl, setXUrl] = useState(() => storedUser.xUrl ?? "");

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const token = localStorage.getItem("token") || "";
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = getStoredUser() || {};
        setLoading(true);
        setError("");
        const res = await API.get("/mentor/profile", { headers });
        const current = res.data?.mentor || {};
        const merged = { ...stored, ...current };

        setMentor(merged);
        setSkills(
          Array.isArray(current.skills)
            ? current.skills
            : Array.isArray(stored.skills)
              ? stored.skills
              : []
        );
        setCompany(current.company ?? stored.company ?? "");
        setDesignation(current.designation ?? stored.designation ?? "");
        setYearsOfExperience(
          current.yearsOfExperience === 0 || current.yearsOfExperience
            ? String(current.yearsOfExperience)
            : stored.yearsOfExperience === 0 || stored.yearsOfExperience
              ? String(stored.yearsOfExperience)
              : ""
        );
        setDomain(current.domain ?? stored.domain ?? "");
        setBio(current.bio ?? stored.bio ?? "");
        setPhone(current.phone ?? stored.phone ?? "");
        setLinkedinUrl(current.linkedinUrl ?? stored.linkedinUrl ?? "");
        setXUrl(current.xUrl ?? stored.xUrl ?? "");
        localStorage.setItem("user", JSON.stringify(merged));
      } catch (err) {
        console.error(err);
        setError("Failed to load mentor profile");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profileFile) return;
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  const addSkill = () => {
    const next = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    setSkills((prev) => Array.from(new Set([...prev, ...next])));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const saveProfile = async ({ quiet } = { quiet: false }) => {
    try {
      setSaving(true);
      setError("");

      let updatedUser = mentor;

      if (profileFile) {
        const form = new FormData();
        form.append("profilePicture", profileFile);
        const uploadRes = await API.post("/mentor/profile-picture", form, {
          headers: { ...headers },
        });
        updatedUser = uploadRes.data?.mentor || updatedUser;
        setMentor(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfileFile(null);
      }

      const payload = {
        phone,
        company,
        designation,
        yearsOfExperience: yearsOfExperience === "" ? undefined : Number(yearsOfExperience),
        bio,
        domain,
        skills,
        linkedinUrl,
        xUrl,
      };

      const res = await API.put("/mentor/profile", payload, { headers });
      const fresh = res.data?.mentor || updatedUser;
      setMentor(fresh);
      localStorage.setItem("user", JSON.stringify(fresh));

      if (!quiet) alert("Profile saved");
      return fresh;
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to save profile";
      setError(msg);
      if (!quiet) alert(msg);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const submitForApproval = async () => {
    try {
      setSubmitting(true);
      setError("");

      const saved = await saveProfile({ quiet: true });
      if (!saved) return;

      const res = await API.put("/mentor/submit-for-approval", {}, { headers });
      const fresh = res.data?.mentor || saved;
      localStorage.setItem("user", JSON.stringify(fresh));
      navigate("/mentor/pending?submitted=1", { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to submit for approval";
      setError(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 dark:text-dark-subtext font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-dark-bg pb-20">
      {/* Top Decoration Bar */}
      <div className="h-2 bg-blue-600 w-full"></div>
      
      <div className="max-w-5xl mx-auto px-4 pt-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-dark-subtext mb-4">
              <span>Mentor</span>
              <ChevronRight size={14} />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{isApprovedMentor ? "My Profile" : "Profile Setup"}</span>
            </nav>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isApprovedMentor ? "View & Edit Your Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-slate-600 dark:text-dark-subtext mt-2 text-lg max-w-2xl">
              {isApprovedMentor
                ? "Keep your profile up to date so students can understand your expertise, background, and mentoring style."
                : "Tell us about your expertise and background. This information helps students find the right mentor for their goals."}
            </p>
          </div>
          <div className="flex gap-3">
            {isApprovedMentor && (
              <button
                type="button"
                onClick={() => navigate("/mentor")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-dark-text font-bold text-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <User size={18} />
                Back to Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(isApprovedMentor ? "/mentor" : "/mentor/pending")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-700 dark:text-dark-text font-bold text-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <Info size={18} />
              {isApprovedMentor ? "Dashboard Status" : "View Status"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Info size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information */}
            <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      {profilePreview || mentor.profilePicture ? (
                        <img
                          src={profilePreview || `${API_BASE}${mentor.profilePicture}`}
                          alt="Profile"
                          className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white dark:border-dark-border shadow-xl group-hover:opacity-90 transition-all"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-4xl font-bold border-4 border-white dark:border-dark-border shadow-xl">
                          {getInitials(mentor.name)}
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110 active:scale-95">
                        <Camera size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                    <p className="mt-4 text-xs font-bold text-slate-500 dark:text-dark-subtext uppercase tracking-widest text-center">Profile Photo</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={mentor.name || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-700 dark:text-dark-text font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={mentor.email || ""}
                          disabled
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-700 dark:text-dark-text font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 ..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        Expertise Domain
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          placeholder="Web Dev, AI, Product..."
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/your-profile"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5 ml-1">
                        X Profile
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={xUrl}
                          onChange={(e) => setXUrl(e.target.value)}
                          placeholder="https://x.com/your-handle"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Briefcase size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Professional Background</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider ml-1">Company</label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Google, Microsoft, Freelance..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider ml-1">Designation</label>
                    <input
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Senior Software Engineer"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      Years of Experience
                      <Award size={14} className="text-amber-500" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-dark-text uppercase tracking-wider ml-1">Bio / About You</label>
                    <textarea
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your journey, achievements, and how you want to help students..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-dark-subtext italic ml-1">* Be specific to help students understand your mentoring style.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Skills & Actions */}
          <div className="space-y-8">
            {/* Skills & Expertise */}
            <div className="bg-white dark:bg-dark-card rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden h-fit">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Award size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Skills & Expertise</h2>
                </div>
                
                <p className="text-slate-600 dark:text-dark-subtext text-sm mb-6 leading-relaxed">
                  Add specific technical or soft skills that you can mentor students in.
                </p>

                <div className="space-y-6">
                  <div className="flex flex-col xl:flex-row gap-3">
                    <div className="relative flex-1 min-w-0">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="React, Python..."
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg text-slate-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="xl:w-auto w-full px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-primary-600 text-white font-bold text-sm hover:bg-slate-800 dark:hover:bg-primary-500 transition-all shadow-sm active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add Skill
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[40px] w-full">
                    {skills.length > 0 ? (
                      skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 dark:bg-dark-bg text-slate-700 dark:text-dark-text text-xs font-bold border border-slate-200 dark:border-dark-border hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group max-w-full overflow-hidden"
                        >
                          <span className="truncate">{s}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(s)}
                            className="text-slate-400 dark:text-dark-subtext hover:text-red-500 transition-colors flex-shrink-0"
                            aria-label={`Remove ${s}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <div className="w-full py-10 border-2 border-dashed border-slate-100 dark:border-dark-border rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 dark:text-dark-subtext gap-3 bg-slate-50/50 dark:bg-dark-bg/50">
                        <Award size={32} className="opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No skills added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-xl p-8 text-white space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">
                  {isApprovedMentor ? "Update Profile" : "Ready to start?"}
                </h3>
                <p className="text-blue-100 text-sm opacity-90">
                  {isApprovedMentor 
                    ? "Keep your information current to attract more mentees." 
                    : "Ensure all information is accurate. Once submitted, our team will review your profile."}
                </p>
              </div>

              <div className="space-y-3">
                {isApprovedMentor ? (
                  <button
                    type="button"
                    onClick={() => saveProfile()}
                    disabled={saving}
                    className="w-full py-4 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95 disabled:opacity-70"
                  >
                    <Save size={18} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => saveProfile()}
                      disabled={saving || submitting}
                      className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                      <Save size={18} />
                      {saving ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={submitForApproval}
                      disabled={saving || submitting}
                      className="w-full py-4 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95 disabled:opacity-70"
                    >
                      <Send size={18} />
                      {submitting ? "Submitting..." : "Submit for Approval"}
                    </button>
                  </>
                )}
              </div>

              <div className="pt-4 flex items-start gap-3 text-[11px] text-blue-100/70 leading-relaxed italic border-t border-white/10">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p>
                  {isApprovedMentor 
                    ? "Your changes will be live immediately." 
                    : "By submitting, you agree to our Mentor Guidelines and Community Standards."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
