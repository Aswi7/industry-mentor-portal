import { Link2, FileText } from "lucide-react"

export default function MentorResources() {
  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800">
        Resources
      </h1>
      <p className="text-gray-600 mt-1">
        Materials shared by your mentors
      </p>

      {/* Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Link2 className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                System Design Primer
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Comprehensive guide to system design interviews
              </p>
              <p className="text-sm text-gray-500 mt-2">
                By Rajesh Kumar • 2026-02-09
              </p>
            </div>
          </div>

          <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
            Link
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                DSA Cheat Sheet
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Quick reference for common algorithms
              </p>
              <p className="text-sm text-gray-500 mt-2">
                By Rajesh Kumar • 2026-02-07
              </p>
            </div>
          </div>

          <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
            Document
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Link2 className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                React Best Practices
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Modern React patterns and hooks
              </p>
              <p className="text-sm text-gray-500 mt-2">
                By Rajesh Kumar • 2026-02-10
              </p>
            </div>
          </div>

          <button className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
            Link
          </button>
        </div>

      </div>
    </div>
  )
}