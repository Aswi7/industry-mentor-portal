import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userRaw = params.get("user");
    const loginError = params.get("error");

    if (loginError) {
      setError(loginError);
      return;
    }

    if (!token || !userRaw) {
      setError("LinkedIn login failed.");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = (user.role || "").toLowerCase();
      if (role === "mentor") {
        const mentorStatus = user.mentorStatus;
        if (mentorStatus === "VERIFIED" || mentorStatus === "ACTIVE") {
          navigate("/mentor", { replace: true });
        } else {
          navigate("/mentor/pending", { replace: true });
        }
      }
      else if (role === "admin") navigate("/admin", { replace: true });
      else navigate("/student", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unable to process LinkedIn login response.");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-lg text-center">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-2">LinkedIn Sign-In Failed</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-sm text-gray-600">Please wait while we complete LinkedIn authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LinkedInCallback;
