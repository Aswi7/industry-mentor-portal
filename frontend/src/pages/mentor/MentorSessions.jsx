
export default function MentorSessions() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Session Management</h1>
        <p className="text-gray-500">
          Manage your mentoring sessions
        </p>
      </div>

      <div className="space-y-6">

        {/* Upcoming */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">
              System Design Fundamentals
            </p>
            <p className="text-gray-500 text-sm">
              with Arjun Sharma • 2026-02-15 at 10:00 AM • 60min
            </p>
          </div>

          <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm">
            upcoming
          </span>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">
              DSA Problem Solving
            </p>
            <p className="text-gray-500 text-sm">
              with Arjun Sharma • 2026-02-10 at 11:00 AM • 60min
            </p>
            <p className="italic text-gray-600 text-sm mt-2">
              "Great session! Arjun showed excellent problem-solving skills."
            </p>
          </div>

          <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm">
            completed
          </span>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">
              Web Dev Best Practices
            </p>
            <p className="text-gray-500 text-sm">
              with Priya Patel • 2026-02-16 at 4:00 PM • 30min
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-1 border border-green-500 text-green-600 rounded-lg hover:bg-green-50">
              ✓ Accept
            </button>

            <button className="px-4 py-1 border border-red-500 text-red-600 rounded-lg hover:bg-red-50">
              ✕ Decline
            </button>

            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
              pending
            </span>
          </div>
        </div>

      </div>
    </>
  )
}