import { BookOpen, FileText, Video, Link as LinkIcon, Search, Filter } from "lucide-react"

export default function MentorResources() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-gray-500">
            Manage and share learning materials with your mentees
          </p>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700">
          + Add Resource
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <StatCard icon={<BookOpen />} title="3" subtitle="Total" />
        <StatCard icon={<FileText />} title="1" subtitle="Documents" />
        <StatCard icon={<Video />} title="0" subtitle="Videos" />
        <StatCard icon={<LinkIcon />} title="2" subtitle="Links" />

      </div>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-8">

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-gray-400" />
          <input
            placeholder="Search resources..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none"
          />
        </div>

        <button className="border px-6 py-3 rounded-xl flex items-center gap-2 bg-white">
          <Filter size={18} />
          All Types
        </button>

      </div>

      {/* Resource Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        <ResourceCard
          type="Link"
          title="System Design Primer"
          desc="Comprehensive guide to system design interviews"
          author="Arjun Sharma"
          date="2026-02-09"
          tagColor="green"
        />

        <ResourceCard
          type="Document"
          title="DSA Cheat Sheet"
          desc="Quick reference for common algorithms"
          author="Arjun Sharma, Priya Patel"
          date="2026-02-07"
          tagColor="blue"
        />

        <ResourceCard
          type="Link"
          title="React Best Practices"
          desc="Modern React patterns and hooks"
          author="Rajesh Kumar"
          date="2026-02-10"
          tagColor="green"
        />

      </div>
    </>
  )
}

function StatCard({ icon, title, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
      <div className="bg-gray-100 p-3 rounded-lg text-gray-500">
        {icon}
      </div>

      <div>
        <p className="text-2xl font-bold">{title}</p>
        <p className="text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

function ResourceCard({ title, desc, author, date, type, tagColor }) {

  const tagStyles = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <LinkIcon className="text-green-600" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          </div>
        </div>

        <span className={`${tagStyles[tagColor]} px-3 py-1 rounded-full text-sm`}>
          {type}
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <p>{author}</p>
        <p>{date}</p>
      </div>

    </div>
  )
}