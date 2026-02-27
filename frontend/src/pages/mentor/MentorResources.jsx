import { useEffect, useState } from "react"
import axios from "axios"
import { BookOpen, FileText, Video, Link as LinkIcon, Search } from "lucide-react"

export default function MentorResources() {

  const [resources, setResources] = useState([])
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState("Link")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem("token")

  /* ---------------- Fetch Resources ---------------- */

  const fetchResources = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/resources",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setResources(data)

    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  /* ---------------- Upload Resource ---------------- */

  const handleUpload = async (e) => {
    e.preventDefault()

    try {

      setLoading(true)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", desc)
      formData.append("type", type)

      if (file) formData.append("file", file)

      await axios.post(
        "http://localhost:5000/api/resources",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      /* Reset form */
      setTitle("")
      setDesc("")
      setFile(null)

      /* Refresh list */
      fetchResources()

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- Stats Logic ---------------- */

  const total = resources.length
  const documents = resources.filter(r => r.type === "Document").length
  const links = resources.filter(r => r.type === "Link").length
  const videos = resources.filter(r => r.type === "Video").length

  /* ---------------- UI ---------------- */

  return (
    <div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-gray-500">
          Manage and share learning materials with your mentees
        </p>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow-sm space-y-4 mb-8"
      >

        <input
          placeholder="Resource Title"
          className="w-full border p-3 rounded-xl"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          className="w-full border p-3 rounded-xl"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          required
        />

        <select
          className="w-full border p-3 rounded-xl"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option>Link</option>
          <option>Document</option>
          <option>Video</option>
        </select>

        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="w-full"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload Resource"}
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

        {resources.map(resource => (
          <ResourceCard key={resource._id} resource={resource} />
        ))}

      </div>

    </div>
  )
}

/* ---------------- Components ---------------- */

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

function ResourceCard({ resource }) {

  const openResource = () => {
    if (resource.fileUrl) {
      window.open(`http://localhost:5000${resource.fileUrl}`, "_blank")
    }

    if (resource.link) {
      window.open(resource.link, "_blank")
    }
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
      onClick={openResource}
    >

      <div className="flex justify-between items-start mb-4">

        <div>
          <h3 className="font-semibold text-lg">
            {resource.title}
          </h3>

          <p className="text-gray-500 text-sm">
            {resource.description}
          </p>
        </div>

        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
          {resource.type}
        </span>

      </div>

      <div className="flex justify-between text-sm text-gray-400">
        <p>{resource?.mentor?.name}</p>

        <p>
          {resource.createdAt
            ? new Date(resource.createdAt).toLocaleDateString()
            : "No Date"}
        </p>
      </div>

    </div>
  )
}