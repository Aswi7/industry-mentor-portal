import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [mentor, setMentor] = useState(() => getStoredUser() || {});
  const [skills, setSkills] = useState(() => Array.isArray(getStoredUser()?.skills) ? getStoredUser().skills : []);
  const [skillInput, setSkillInput] = useState("");

  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [domain, setDomain] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");

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

  if (loading) return <div className="min-h-screen bg-gray-100 p-8">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mentor Profile</h1>
            <p className="text-slate-600 mt-1">
              Complete your profile details and submit for approval to access the mentor dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mentor/pending")}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
          >
            View Status
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          <div className="flex items-start gap-5">
            <div className="relative">
              {profilePreview || mentor.profilePicture ? (
                <img
                  src={profilePreview || `http://localhost:5000${mentor.profilePicture}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-semibold">
                  {getInitials(mentor.name)}
                </div>
              )}
              <label className="mt-3 inline-block text-sm font-medium text-blue-700 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                />
                Change photo
              </label>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm text-slate-600">Name</label>
                  <input
                    value={mentor.name || ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Email</label>
                  <input
                    value={mentor.email || ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Phone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 ..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Expertise Domain</label>
                  <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Web Development, AI/ML, ..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mt-6">
          <h2 className="text-xl font-semibold text-slate-900">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-slate-600">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Designation</label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Senior Engineer"
                className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                placeholder="5"
                className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-600">Bio / About</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell students about your background, experience, and what you can help them with..."
                className="mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 mt-6">
          <h2 className="text-xl font-semibold text-slate-900">Areas of Expertise</h2>
          <p className="text-slate-600 text-sm mt-1">Add your skills and areas you can mentor in</p>

          <div className="flex gap-3 mt-4">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="React, Python, System Design (comma separated)"
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {skills.length > 0 ? (
              skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-sm border"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="text-slate-500 hover:text-slate-800"
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No expertise added yet</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => saveProfile({ quiet: false })}
            disabled={saving || submitting}
            className="px-5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={submitForApproval}
            disabled={saving || submitting}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}
