import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import API from "../../services/api";

const isMentorApproved = (status) => ["VERIFIED", "ACTIVE"].includes(status);

export default function MentorPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const submitted = new URLSearchParams(location.search).get("submitted") === "1";

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let intervalId;

    const checkApproval = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          signOut();
          return;
        }

        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const latestUser = res.data?.user;
        if (!latestUser) return;
        setAdminEmail(res.data?.adminEmail || "");

        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
        if (isMentorApproved(latestUser.mentorStatus)) {
          navigate("/mentor", { replace: true });
        }
      } catch (err) {
        if (err.response?.status === 401) {
          signOut();
          return;
        }
        setError("Unable to check approval status right now.");
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
    intervalId = setInterval(checkApproval, 15000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-2xl shadow p-8 border border-gray-100 dark:border-dark-border">
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-center">
            Profile submitted for approval. Please wait for admin verification.
          </div>
        )}
        {user?.mentorStatus === "REJECTED" ? (
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl mb-4">
              !
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Approval Rejected</h1>
            <p className="mt-4 text-slate-700 dark:text-dark-text">
              Hi {user?.name || "Mentor"}, your mentor application was not approved by the admin team.
            </p>
            <p className="mt-2 text-slate-600 dark:text-dark-subtext">
              For further queries, contact the admin at <span className="font-semibold">{adminEmail || "Not available"}</span>.
            </p>
          </div>
        ) : (
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mb-4">
            ...
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Approval Pending</h1>
          <p className="mt-4 text-slate-700 dark:text-dark-text">
            Hi {user?.name || "Mentor"}, your mentor profile is under review by our admin team.
          </p>
          <p className="mt-2 text-slate-600 dark:text-dark-subtext">
            You&apos;ll get full access to the mentor dashboard once your profile is approved.
          </p>
        </div>
        )}

        <div className="bg-slate-100 dark:bg-dark-bg rounded-xl p-5 text-slate-800 dark:text-dark-text space-y-2">
          <p><span className="font-semibold text-slate-900 dark:text-white">Name:</span> {user?.name || "-"}</p>
          <p><span className="font-semibold text-slate-900 dark:text-white">Email:</span> {user?.email || "-"}</p>
          <p><span className="font-semibold text-slate-900 dark:text-white">Mobile:</span> {user?.phone || "-"}</p>
          <p><span className="font-semibold text-slate-900 dark:text-white">Domain:</span> {user?.domain || "-"}</p>
          <p><span className="font-semibold text-slate-900 dark:text-white">Expertise:</span> {(user?.skills || []).join(", ") || "-"}</p>
          <p><span className="font-semibold text-slate-900 dark:text-white">Status:</span> {user?.mentorStatus || "PENDING"}</p>
          {user?.mentorStatus === "REJECTED" && (
            <p><span className="font-semibold text-slate-900 dark:text-white">Contact:</span> {adminEmail || "Not available"}</p>
          )}
        </div>

        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => navigate("/mentor/profile")}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-slate-300 dark:border-dark-border text-slate-700 dark:text-dark-text hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Checking..." : "Refresh Status"}
          </button>
          <button
            onClick={signOut}
            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
