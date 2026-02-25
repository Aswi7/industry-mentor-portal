import { Calendar, Clock, Users, Plus } from "lucide-react";

const MentorSessions = () => {
  const sessions = [
    {
      id: 1,
      title: "System Design Masterclass",
      price: "₹499",
      description:
        "Deep dive into distributed systems, load balancing, and caching strategies.",
      tags: ["System Design", "Web Development"],
      date: "2026-02-28",
      time: "10:00 AM",
      duration: "90min",
      maxStudents: 5,
      status: "open",
    },
    {
      id: 2,
      title: "DSA Problem Solving Workshop",
      price: "FREE",
      description:
        "Practice medium-hard level problems with focus on trees and graphs.",
      tags: ["DSA"],
      date: "2026-03-02",
      time: "2:00 PM",
      duration: "60min",
      maxStudents: 8,
      status: "open",
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Session Management
          </h1>
          <p className="text-gray-500">
            Create skill-based sessions and manage bookings
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} />
          Create Session
        </button>
      </div>

      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Open Sessions
      </h2>

      {/* Session Cards */}
      <div className="space-y-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
          >
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {session.title}
                  </h3>

                  <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                    {session.price}
                  </span>
                </div>

                <p className="text-gray-500 mt-2">{session.description}</p>

                {/* Tags */}
                <div className="flex gap-2 mt-3">
                  {session.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">
                {session.status}
              </span>
            </div>

            {/* Bottom Info */}
            <div className="flex gap-6 mt-5 text-gray-600 text-sm items-center">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {session.date}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} />
                {session.time} • {session.duration}
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} />
                Max {session.maxStudents} students
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorSessions;