import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackError = params.get("error");
    const success = params.get("success");
    const nextPath = params.get("next");

    if (callbackError) {
      setError(callbackError);
      return;
    }

    if (success === "1") {
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const user = JSON.parse(rawUser);
          user.googleCalendarConnectedAt = new Date().toISOString();
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch {
        // best-effort local cache update
      }

      const target = nextPath && nextPath.startsWith("/") ? nextPath : "/mentor/mentees";
      navigate(target, { replace: true });
      return;
    }

    setError("Google Calendar connection failed.");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-[420px] p-8 rounded-2xl shadow-lg text-center">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Google Calendar Connection Failed</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/mentor/sessions", { replace: true })}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Requests
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Connecting Calendar...</h2>
            <p className="text-sm text-gray-600">Please wait while we complete Google Calendar setup.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;
