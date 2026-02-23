export default function MentorMentees() {
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

        {/* Mentee 1 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              AS
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                Arjun Sharma
              </h2>
              <p className="text-gray-500 text-sm">
                arjun@student.edu
              </p>

              {/* Skills */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  React
                </span>
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Python
                </span>
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Data Structures
                </span>
              </div>

              {/* Sessions + Progress */}
              <div className="flex justify-between text-sm mt-4 text-gray-700">
                <p>Sessions: 2</p>
                <p>Progress: 60%</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: "60%" }}></div>
              </div>

            </div>
          </div>
        </div>

        {/* Mentee 2 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              PP
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">
                Priya Patel
              </h2>
              <p className="text-gray-500 text-sm">
                priya@student.edu
              </p>

              {/* Skills */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Java
                </span>
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Machine Learning
                </span>
                <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  SQL
                </span>
              </div>

              {/* Sessions + Progress */}
              <div className="flex justify-between text-sm mt-4 text-gray-700">
                <p>Sessions: 1</p>
                <p>Progress: 66%</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: "66%" }}></div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}