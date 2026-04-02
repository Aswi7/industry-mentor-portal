import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Eye, X } from "lucide-react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const AdminApprovals = () => {
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
        const res = await axios.get("http://localhost:5000/api/admin/mentors/pending", { headers });
        setMentors(res.data.pendingMentors || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load pending mentors");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMentors();
  }, []);

  const handleAction = async (mentorId, action) => {
    try {
      setActioningId(mentorId);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`http://localhost:5000/api/admin/mentors/${action}/${mentorId}`, {}, { headers });
      setMentors((prev) => prev.filter((mentor) => mentor._id !== mentorId));
      setSelectedMentor((prev) => (prev?._id === mentorId ? null : prev));
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} mentor`);
    } finally {
      setActioningId("");
    }
  };

  if (loading) return <div className="p-8">Loading approvals...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mentor Approvals</h1>
        <p className="text-gray-500">
          Review and approve mentor registrations
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-6">
        {error && <p className="text-red-600">{error}</p>}

        {mentors.map((mentor) => (
          <div
            key={mentor._id}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
          >
            {/* Left Section */}
            <div className="flex items-start gap-4">
              
              {/* Avatar */}
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold">
                {getInitials(mentor.name)}
              </div>

              {/* Info */}
              <div>
                <h2 className="text-lg font-semibold">
                  {mentor.name}
                </h2>
                <p className="text-gray-600 mb-3">
                  {mentor.email}
                </p>

                {/* Skills */}
                <div className="flex gap-2 flex-wrap">
                  {(mentor.skills?.length ? mentor.skills : [mentor.domain || "No skills added"]).map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section (Buttons) */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedMentor(mentor)}
                className="flex items-center gap-2 border border-slate-300 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                <Eye size={18} />
                View Profile
              </button>

              <button
                onClick={() => handleAction(mentor._id, "approve")}
                disabled={actioningId === mentor._id}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
              >
                <Check size={18} />
                Approve
              </button>

              <button
                onClick={() => handleAction(mentor._id, "reject")}
                disabled={actioningId === mentor._id}
                className="flex items-center gap-2 border border-red-400 text-red-600 px-5 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60"
              >
                <X size={18} />
                Reject
              </button>
            </div>
          </div>
        ))}
        {mentors.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow p-6 text-gray-500">
            No pending mentor approvals.
          </div>
        )}
      </div>

      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedMentor.name}</h2>
                <p className="text-slate-600 mt-1">{selectedMentor.email}</p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone</p>
                  <p className="mt-1 text-slate-800">{selectedMentor.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Company</p>
                  <p className="mt-1 text-slate-800">{selectedMentor.company || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Designation</p>
                  <p className="mt-1 text-slate-800">{selectedMentor.designation || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Experience</p>
                  <p className="mt-1 text-slate-800">
                    {selectedMentor.yearsOfExperience === 0 || selectedMentor.yearsOfExperience
                      ? `${selectedMentor.yearsOfExperience} years`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Domain</p>
                  <p className="mt-1 text-slate-800">{selectedMentor.domain || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</p>
                  <p className="mt-1 text-slate-800">{selectedMentor.mentorStatus || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedMentor.skills?.length ? selectedMentor.skills : ["-"]).map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Bio</p>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">
                  {selectedMentor.bio || "No bio provided."}
                </p>
              </div>

              {selectedMentor.profilePicture && (
                <div className="md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Profile Picture</p>
                  <img
                    src={`http://localhost:5000${selectedMentor.profilePicture}`}
                    alt={`${selectedMentor.name} profile`}
                    className="mt-3 h-40 w-40 rounded-2xl object-cover border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminApprovals;
