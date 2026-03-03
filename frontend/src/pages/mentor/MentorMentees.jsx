import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorMentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/mentor/mentees", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMentees(response.data.mentees);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load mentees");
        setLoading(false);
      }
    };

    fetchMentees();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) return <div className="p-8 text-center">Loading mentees...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        My Mentees
      </h1>
      <p className="text-gray-600 mt-1">
        Students you're guiding
      </p>

      {/* Cards Container */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {mentees.length === 0 ? (
          <p className="text-gray-500">No mentees yet</p>
        ) : (
          mentees.map((mentee) => (
            <div key={mentee._id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {getInitials(mentee.name)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {mentee.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {mentee.email}
                  </p>

                  {/* Skills */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {mentee.studentSkills && mentee.studentSkills.length > 0 ? (
                      mentee.studentSkills.map((skill, index) => (
                        <span key={index} className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No skills listed</span>
                    )}
                  </div>

                  {/* Domain */}
                  <div className="mt-3 text-sm text-gray-700">
                    <p>Domain: <span className="font-semibold">{mentee.studentDomain || "Not specified"}</span></p>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}