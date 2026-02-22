import { Calendar, Clock, BookOpen, BarChart3 } from "lucide-react";

const StudentOverview = () => {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, Arjun!
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
              <h2 className="text-2xl font-bold">1</h2>
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
              <h2 className="text-2xl font-bold">1</h2>
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
              <h2 className="text-2xl font-bold">3</h2>
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
              <h2 className="text-2xl font-bold">5</h2>
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

          <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">
                System Design Fundamentals
              </p>
              <p className="text-sm text-gray-500">
                2026-02-15 • 10:00 AM
              </p>
            </div>

            <span className="bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
              60min
            </span>
          </div>
        </div>

        {/* Skills Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-6">
            Skills Progress
          </h3>

          <div className="space-y-6">

            {/* React */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>React</span>
                <span>7/10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full w-[70%]"></div>
              </div>
            </div>

            {/* Data Structures */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Data Structures</span>
                <span>6/10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full w-[60%]"></div>
              </div>
            </div>

            {/* System Design */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>System Design</span>
                <span>4/10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full w-[40%]"></div>
              </div>
            </div>

            {/* Python */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Python</span>
                <span>5/10</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full w-[50%]"></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentOverview;