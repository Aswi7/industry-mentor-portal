import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const isMentorApproved = (status) => ["VERIFIED", "ACTIVE"].includes(status);

export default function MentorPending() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
            ...
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Approval Pending</h1>
          <p className="mt-4 text-slate-700">
            Hi {user?.name || "Mentor"}, your mentor profile is under review by our admin team.
          </p>
          <p className="mt-2 text-slate-600">
            You&apos;ll get full access to the mentor dashboard once your profile is approved.
          </p>
        </div>

        <div className="bg-slate-100 rounded-xl p-5 text-slate-800 space-y-2">
          <p><span className="font-semibold">Name:</span> {user?.name || "-"}</p>
          <p><span className="font-semibold">Email:</span> {user?.email || "-"}</p>
          <p><span className="font-semibold">Mobile:</span> {user?.phone || "-"}</p>
          <p><span className="font-semibold">Domain:</span> {user?.domain || "-"}</p>
          <p><span className="font-semibold">Expertise:</span> {(user?.skills || []).join(", ") || "-"}</p>
          <p><span className="font-semibold">Status:</span> {user?.mentorStatus || "PENDING"}</p>
        </div>

        {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Refresh Status"}
          </button>
          <button
            onClick={signOut}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
