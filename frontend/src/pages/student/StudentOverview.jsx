import { Calendar, Clock, BookOpen, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const StudentOverview = () => {
  const [studentName, setStudentName] = useState("");
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, resources: 0, skills: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch student profile (for name)
        const profileRes = await axios.get("http://localhost:5000/api/student/profile", { headers });
        setStudentName(profileRes.data.student.name);

        // Fetch stats
        const statsRes = await axios.get("http://localhost:5000/api/student/stats", { headers });
        setStats(statsRes.data.stats);

        // Fetch sessions
        const sessionsRes = await axios.get("http://localhost:5000/api/student/sessions", { headers });
        const upcoming = sessionsRes.data.sessions.filter(s => s.status === "ACCEPTED").slice(0, 1);
        setUpcomingSessions(upcoming);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 py-10">{error}</div>;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {studentName || "Student"}!
        </h1>
        <p className="text-gray-500 mt-2">
          Here's your learning overview
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Upcoming */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{stats.upcoming}</h2>
              <p className="text-gray-500 text-sm">Upcoming Sessions</p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="text-green-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{stats.completed}</h2>
              <p className="text-gray-500 text-sm">Completed</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="text-blue-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{stats.resources}</h2>
              <p className="text-gray-500 text-sm">Resources</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="text-yellow-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{stats.skills}</h2>
              <p className="text-gray-500 text-sm">Skills Tracked</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Upcoming Sessions
          </h3>

          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => (
              <div key={session._id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {session.topic}
                  </p>
                  <p className="text-sm text-gray-500">
                    with {session.mentor.name}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                  Scheduled
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No upcoming sessions</p>
          )}
        </div>

        {/* Skills Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Skills Tracked
          </h3>

          <div className="space-y-6">
            {stats.skills > 0 ? (
              [`Skill 1`, `Skill 2`, `Skill 3`, `Skill 4`].map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{skill}</span>
                    <span>{Math.floor(Math.random() * 10)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No skills tracked yet</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentOverview;