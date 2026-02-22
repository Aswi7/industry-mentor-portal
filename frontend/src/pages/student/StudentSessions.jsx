import { Star } from "lucide-react";

const StudentSessions = () => {

  const sessions = [
    {
      title: "System Design Fundamentals",
      mentor: "Rajesh Kumar",
      date: "2026-02-15",
      time: "10:00 AM",
      duration: "60min",
      status: "upcoming",
    },
    {
      title: "DSA Problem Solving",
      mentor: "Rajesh Kumar",
      date: "2026-02-10",
      time: "11:00 AM",
      duration: "60min",
      status: "completed",
      rating: "5/5",
      feedback: "Great session! Arjun showed excellent problem-solving skills.",
    },
    {
      title: "Data Analytics Workshop",
      mentor: "Sneha Reddy",
      date: "2026-02-05",
      time: "1:00 PM",
      duration: "60min",
      status: "cancelled",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-600";
      case "completed":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">My Sessions</h1>
        <p className="text-gray-500">
          View and manage your mentoring sessions
        </p>
      </div>

      {/* Session Cards */}
      <div className="space-y-5">

        {sessions.map((session, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
          >

            <div className="space-y-2">

              <h2 className="text-xl font-semibold">
                {session.title}
              </h2>

              <p className="text-gray-600 text-sm">
                with {session.mentor} • {session.date} at {session.time} • {session.duration}
              </p>

              {session.feedback && (
                <p className="text-gray-500 text-sm italic">
                  "{session.feedback}"
                </p>
              )}

              {session.status === "completed" && (
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star size={16} /> {session.rating}
                </div>
              )}

            </div>

            {/* Status Badge */}
            <div>
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                  session.status
                )}`}
              >
                {session.status}
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default StudentSessions;