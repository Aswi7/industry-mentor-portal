import { Users, Calendar, Clock, CheckCircle } from "lucide-react"

export default function MentorOverview() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, Rajesh!</h1>
        <p className="text-gray-500">Your mentoring dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users />} value="2" label="Mentees" />
        <StatCard icon={<Calendar />} value="1" label="Upcoming" />
        <StatCard icon={<Clock />} value="1" label="Pending Requests" />
        <StatCard icon={<CheckCircle />} value="1" label="Completed" />
      </div>

      {/* Lower Section */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            Upcoming Sessions
          </h2>

          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                System Design Fundamentals
              </p>
              <p className="text-sm text-gray-500">
                with Arjun Sharma • 2026-02-15 at 10:00 AM
              </p>
            </div>

            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
              60min
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            Pending Requests
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Web Dev Best Practices
              </p>
              <p className="text-sm text-gray-500">
                Priya Patel • Web Development
              </p>
            </div>

            <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-sm">
              Pending
            </span>
          </div>
        </div>

      </div>
    </>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  )
}