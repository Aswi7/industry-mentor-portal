import { useEffect, useState } from "react"
import API from "../../services/api"
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Trash2, 
  Upload, 
  Plus,
  ExternalLink,
  Calendar,
  User,
  Info
} from "lucide-react"

export default function MentorResources() {

  const [resources, setResources] = useState([])
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState("Link")
  const [file, setFile] = useState(null)
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const token = localStorage.getItem("token")

  /* ---------------- Fetch Resources ---------------- */

  const fetchResources = async () => {
    try {
      const { data } = await API.get(
        "/resources",
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

      if (type === "Link" || type === "Video") {
        if (link) formData.append("link", link)
      }
      
      if (type === "Document" || type === "Video") {
        if (file) formData.append("file", file)
      }

      await API.post(
        "/resources",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      alert(`${type} uploaded successfully!`)

      /* Reset form */
      setTitle("")
      setDesc("")
      setFile(null)
      setLink("")
      setShowUpload(false)

      /* Refresh list */
      fetchResources()

    } catch (err) {
      console.error(err)
      alert("Failed to upload resource")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resourceId) => {
    try {
      const confirmed = window.confirm("Delete this resource?");
      if (!confirmed) return;

      await API.delete(`/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResources((prev) => prev.filter((item) => item._id !== resourceId));
      alert("Resource deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete resource");
    }
  };

  /* ---------------- Stats Logic ---------------- */

  const total = resources.length
  const documents = resources.filter(r => r.type === "Document").length
  const links = resources.filter(r => r.type === "Link").length
  const videos = resources.filter(r => r.type === "Video").length

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Library Resources</h1>
          <p className="text-gray-700 dark:text-dark-subtext mt-2 text-lg">
            Manage and share curated learning materials with your mentees
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
            showUpload 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
          }`}
        >
          {showUpload ? <Trash2 size={20} /> : <Plus size={20} />}
          {showUpload ? "Cancel Upload" : "Add Resource"}
        </button>
      </div>

      {/* Upload Form (Animated) */}
      {showUpload && (
        <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] shadow-xl border border-blue-50 dark:border-dark-border animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Upload size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload New Material</h2>
          </div>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-dark-text uppercase tracking-wider ml-1">Resource Title</label>
              <input
                placeholder="e.g. System Design Basics"
                className="w-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium dark:text-dark-text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-dark-text uppercase tracking-wider ml-1">Resource Type</label>
              <select
                className="w-full border border-gray-200 dark:border-dark-border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium bg-white dark:bg-dark-bg dark:text-dark-text"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  setFile(null);
                  setLink("");
                }}
              >
                <option value="Link">Web Link / Article</option>
                <option value="Document">PDF / Document</option>
                <option value="Video">Video Course</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-dark-text uppercase tracking-wider ml-1">Description</label>
              <textarea
                placeholder="Provide a brief summary of what this resource covers..."
                className="w-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg p-4 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium resize-none dark:text-dark-text"
                rows={3}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                required
              />
            </div>

            {(type === "Link" || type === "Video") && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-dark-text uppercase tracking-wider ml-1">
                  {type === "Video" ? "Video Link (YouTube/Vimeo)" : "Resource URL"}
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    placeholder="https://example.com/..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium dark:text-dark-text"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    required={!file}
                  />
                </div>
                {type === "Video" && <p className="text-[10px] text-gray-500 dark:text-dark-subtext italic ml-1">Or upload a video file below</p>}
              </div>
            )}

            {(type === "Document" || type === "Video") && (
              <div className="md:col-span-2 p-6 border-2 border-dashed border-gray-100 dark:border-dark-border rounded-[2rem] bg-gray-50/50 dark:bg-dark-bg/50">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white dark:bg-dark-card rounded-2xl shadow-sm text-gray-400">
                    {type === "Video" ? <Video size={32} /> : <FileText size={32} />}
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-dark-text">
                    {type === "Video" ? "Upload video file" : "Attach document file"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-dark-subtext mb-4 text-center">
                    {type === "Video" ? "Supported formats: MP4, WebM (Max 50MB)" : "Supported formats: PDF, DOCX, PNG, JPG (Max 10MB)"}
                  </p>
                  <input
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                    required={type === "Document" && !link}
                    className="block w-full text-sm text-gray-600 dark:text-dark-subtext file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-8 py-4 rounded-2xl font-bold text-gray-700 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Discard
              </button>
              <button
                disabled={loading}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Publish Resource"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatWidget icon={<BookOpen size={24} />} title={total} subtitle="Total Files" color="blue" />
        <StatWidget icon={<FileText size={24} />} title={documents} subtitle="Documents" color="amber" />
        <StatWidget icon={<Video size={24} />} title={videos} subtitle="Videos" color="red" />
        <StatWidget icon={<LinkIcon size={24} />} title={links} subtitle="Web Links" color="emerald" />
      </div>

      {/* Resource Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Your Uploaded Content
            <span className="bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-dark-text text-xs px-3 py-1 rounded-full">{resources.length}</span>
          </h2>
          <div className="flex gap-2">
             {/* Filter chips could go here */}
          </div>
        </div>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map(resource => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-dark-border py-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-dark-bg rounded-[2rem] flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6">
              <BookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No resources yet</h3>
            <p className="text-gray-600 dark:text-dark-subtext mt-2 max-w-xs mx-auto">
              Start building your library by uploading files or sharing useful links with your mentees.
            </p>
            <button 
              onClick={() => setShowUpload(true)}
              className="mt-8 text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:underline"
            >
              <Plus size={18} />
              Upload your first resource
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

/* ---------------- Components ---------------- */

function StatWidget({ icon, title, subtitle, color }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
  }

  return (
    <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-dark-border flex items-center gap-5 hover:shadow-md transition-all duration-300 group">
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs font-bold text-gray-600 dark:text-dark-subtext uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function ResourceCard({ resource, onDelete }) {

  const openResource = () => {
    if (resource.fileUrl) {
      window.open(`${API_BASE}${resource.fileUrl}`, "_blank")
    } else if (resource.link) {
      window.open(resource.link, "_blank")
    }
  }

  const typeStyles = {
    Link: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    Document: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    Video: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50"
  }

  return (
    <div
      className="bg-white dark:bg-dark-card rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-dark-border p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${typeStyles[resource.type] || "bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-dark-subtext"}`}>
          {resource.type === "Link" && <LinkIcon size={20} />}
          {resource.type === "Document" && <FileText size={20} />}
          {resource.type === "Video" && <Video size={20} />}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${typeStyles[resource.type] || "bg-gray-50 dark:bg-dark-bg"}`}>
          {resource.type}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-dark-text line-clamp-2 italic mb-6 leading-relaxed">
          "{resource.description}"
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-50 dark:border-dark-border">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-dark-subtext">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-gray-400" />
              {resource?.mentor?.name || "You"}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : "Recently"}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openResource}
            className="flex-1 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text py-3 rounded-2xl text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all flex items-center justify-center gap-2 border border-gray-100 dark:border-dark-border"
          >
            <ExternalLink size={14} />
            View
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resource._id);
            }}
            className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white dark:hover:bg-red-500 transition-all border border-red-100 dark:border-red-900/50"
            title="Delete Resource"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
