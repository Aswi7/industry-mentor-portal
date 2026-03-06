import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X } from "lucide-react";

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

    </div>
  );
};

export default AdminApprovals;
