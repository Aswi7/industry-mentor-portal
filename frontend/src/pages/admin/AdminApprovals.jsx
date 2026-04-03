import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Eye, X, UserCheck, AlertCircle, Inbox } from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const AdminApprovals = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    const fetchPendingMentors = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_BASE}/api/admin/mentors/pending`, { headers });
        setMentors(res.data.pendingMentors || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load pending mentors list.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMentors();
  }, [API_BASE]);

  const handleAction = async (mentorId, action) => {
    try {
      setActioningId(mentorId);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${API_BASE}/api/admin/mentors/${action}/${mentorId}`, {}, { headers });
      setMentors((prev) => prev.filter((mentor) => mentor._id !== mentorId));
      setSelectedMentor(null);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} mentor. Please try again.`);
    } finally {
      setActioningId("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-dark-border rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black mb-1 dark:text-white">Mentor Approvals</h1>
        <p className="text-sm text-gray-500 dark:text-dark-subtext">
          Review and verify new mentor applications
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {mentors.length > 0 ? (
          mentors.map((mentor) => (
            <div
              key={mentor._id}
              className="card p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-primary-500/30 transition-all shadow-soft"
            >
              {/* Left Section */}
              <div className="flex items-start gap-5 w-full md:w-auto">
                
                {/* Avatar */}
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm shrink-0">
                  {getInitials(mentor.name)}
                </div>

                {/* Info */}
                <div className="overflow-hidden">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {mentor.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-dark-subtext mb-3 truncate">
                    {mentor.email}
                  </p>

                  {/* Skills */}
                  <div className="flex gap-2 flex-wrap">
                    {(mentor.skills?.length ? mentor.skills.slice(0, 3) : [mentor.domain || "Mentor"]).map((skill, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-dark-subtext text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border border-gray-200 dark:border-dark-border"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.skills?.length > 3 && (
                      <span className="text-[10px] font-bold text-gray-400 dark:text-dark-subtext pt-1">+{mentor.skills.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section (Buttons) */}
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="flex-1 md:flex-none btn-secondary py-2.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                >
                  <Eye size={16} />
                  Details
                </button>

                <button
                  onClick={() => handleAction(mentor._id, "approve")}
                  disabled={actioningId === mentor._id}
                  className="flex-1 md:flex-none btn-primary py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  <Check size={16} />
                  Approve
                </button>

                <button
                  onClick={() => handleAction(mentor._id, "reject")}
                  disabled={actioningId === mentor._id}
                  className="flex-1 md:flex-none btn-secondary py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4 card">
            <Inbox size={48} className="opacity-20" />
            <div>
              <p className="text-lg font-bold">Inbox is empty</p>
              <p className="text-sm italic">No pending mentor approvals at the moment.</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-dark-card shadow-2xl border border-gray-100 dark:border-dark-border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md flex items-start justify-between gap-4 p-8 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl">
                  {getInitials(selectedMentor.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{selectedMentor.name}</h2>
                  <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">{selectedMentor.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <DetailItem label="Phone Number" value={selectedMentor.phone} />
                  <DetailItem label="Company" value={selectedMentor.company} />
                  <DetailItem label="Designation" value={selectedMentor.designation} />
                  <DetailItem label="Experience" value={selectedMentor.yearsOfExperience !== undefined ? `${selectedMentor.yearsOfExperience} Years` : "-"} />
                </div>

                <div className="space-y-6">
                  <DetailItem label="Primary Domain" value={selectedMentor.domain} />
                  <DetailItem label="Current Status" value={selectedMentor.mentorStatus} isBadge />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-dark-subtext mb-3">Expertise & Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedMentor.skills?.length ? selectedMentor.skills : ["-"]).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-dark-text border border-gray-100 dark:border-dark-border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-dark-border">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-dark-subtext mb-3">Professional Bio</p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-dark-subtext bg-gray-50 dark:bg-white/5 p-6 rounded-2xl italic border border-gray-100 dark:border-dark-border">
                  "{selectedMentor.bio || "No bio provided."}"
                </p>
              </div>

              {selectedMentor.profilePicture && (
                <div className="pt-4 border-t border-gray-50 dark:border-dark-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-dark-subtext mb-4">Profile Verification</p>
                  <img
                    src={`${API_BASE}${selectedMentor.profilePicture}`}
                    alt={`${selectedMentor.name} profile`}
                    className="h-48 w-48 rounded-2xl object-cover border-4 border-white dark:border-dark-card shadow-xl"
                  />
                </div>
              )}

              <div className="pt-8 flex gap-4">
                 <button
                  onClick={() => handleAction(selectedMentor._id, "approve")}
                  disabled={actioningId === selectedMentor._id}
                  className="flex-1 btn-primary py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserCheck size={18} />
                  Approve Application
                </button>
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="btn-secondary px-8 font-black uppercase tracking-widest text-xs"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const DetailItem = ({ label, value, isBadge }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-dark-subtext mb-1">{label}</p>
    {isBadge ? (
      <span className="inline-block bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 mt-1">
        {value || "-"}
      </span>
    ) : (
      <p className="text-sm font-bold text-gray-800 dark:text-dark-text">{value || "-"}</p>
    )}
  </div>
);

export default AdminApprovals;
