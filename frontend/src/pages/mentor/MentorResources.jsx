import { useEffect, useState } from "react"
import axios from "axios"
import { BookOpen, FileText, Video, Link as LinkIcon, Search, Filter } from "lucide-react"

export default function MentorResources() {

  const [resources, setResources] = useState([])
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState("Link")
  const [file, setFile] = useState(null)

  const token = localStorage.getItem("token")

  // Fetch Resources
  const fetchResources = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/resources", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResources(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  // Upload Resource
  const handleUpload = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", desc)
    formData.append("type", type)
    if (file) formData.append("file", file)

    await axios.post("http://localhost:5000/api/resources", formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    setTitle("")
    setDesc("")
    setFile(null)
    fetchResources()
  }

  // Stats Calculation
  const total = resources.length
  const documents = resources.filter(r => r.type === "Document").length
  const links = resources.filter(r => r.type === "Link").length
  const videos = resources.filter(r => r.type === "Video").length

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
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow-sm mb-8 space-y-4">
        <input
          placeholder="Title"
          className="w-full border p-3 rounded-xl"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded-xl"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <select
          className="w-full border p-3 rounded-xl"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>Link</option>
          <option>Document</option>
          <option>Video</option>
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
          Upload Resource
        </button>
      </form>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<BookOpen />} title={total} subtitle="Total" />
        <StatCard icon={<FileText />} title={documents} subtitle="Documents" />
        <StatCard icon={<Video />} title={videos} subtitle="Videos" />
        <StatCard icon={<LinkIcon />} title={links} subtitle="Links" />
      </div>

      {/* Resource Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {resources.map((res) => (
          <ResourceCard key={res._id} {...res} />
        ))}
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

function ResourceCard({ title, description, mentor, createdAt, type }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>

        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
          {type}
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <p>{mentor?.name}</p>
        <p>{new Date(createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}