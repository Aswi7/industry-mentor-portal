import { useEffect, useState } from "react";
import API from "../../services/api";
import { Users, Mail, BookOpen, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function MentorMentees() {
  const [mentees, setMentees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [menteesRes, requestsRes] = await Promise.all([
        API.get("/mentor/mentees", { headers }),
        API.get("/mentor/pending-requests", { headers })
      ]);

      setMentees(menteesRes.data.mentees || []);
      setPendingRequests(requestsRes.data.pendingRequests || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load mentees data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAction = async (sessionId, action) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      setActioningId(sessionId);

      await API.put(`/sessions/${action}/${sessionId}`, {}, { headers });
      await fetchData();
      window.dispatchEvent(new Event("sessionChanged"));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} session`);
    } finally {
      setActioningId("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Mentees</h1>
        <p className="text-gray-700 dark:text-dark-subtext mt-1 font-medium text-sm">Manage your active students and session requests</p>
      </div>

      {/* Active Mentees Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
          Active Mentees
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
        </h2>

        {mentees.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-dashed border-gray-300 dark:border-dark-border p-12 text-center">
            <Users className="mx-auto text-gray-600 dark:text-dark-subtext mb-4" size={48} />
            <p className="text-gray-600 dark:text-dark-subtext font-medium italic">No active mentees yet. Accept a request to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.map((mentee) => (
              <div key={mentee._id} className="mentor-card p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl mb-4 shadow-inner">
                  {getInitials(mentee.name)}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{mentee.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-dark-subtext uppercase tracking-widest mb-4">
                  <Mail size={12} />
                  {mentee.email}
                </div>

                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-2.5 rounded-xl text-left">
                    <BookOpen size={14} className="text-blue-500" />
                    <div>
                      <p className="text-[10px] font-black text-gray-600 dark:text-dark-subtext uppercase tracking-tighter leading-none">Domain</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-dark-text mt-1">{mentee.studentDomain || "Not Specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-dark-border">
                  <button className="w-full btn-secondary py-2 text-xs">View Full Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Requests Section */}
      <section className="space-y-6 pt-4">
        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
          New Requests
          {pendingRequests.length > 0 && (
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">{pendingRequests.length} Pending</span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-dark-subtext text-sm font-medium">Inbox is clear. No new requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request._id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                    {getInitials(request.student?.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{request.student?.name}</h3>
                    <p className="text-xs text-gray-700 dark:text-dark-subtext font-medium">Requested: <span className="text-blue-600 dark:text-blue-400">"{request.topic}"</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRequestAction(request._id, "accept")}
                    disabled={actioningId === request._id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-900 dark:bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-800 dark:hover:bg-primary-500 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    {actioningId === request._id ? "Processing..." : "Accept Student"}
                  </button>
                  <button
                    onClick={() => handleRequestAction(request._id, "reject")}
                    disabled={actioningId === request._id}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                    title="Reject Request"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
