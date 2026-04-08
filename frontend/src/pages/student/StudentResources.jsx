import { useEffect, useState } from "react"
import API from "../../services/api"

const StudentResources = () => {

  const [resources, setResources] = useState([])
  const token = localStorage.getItem("token")

  const getDownloadName = (resource, headers = {}) => {
    const contentDisposition = headers["content-disposition"] || headers["Content-Disposition"];
    const headerMatch = contentDisposition?.match(/filename="?([^"]+)"?/i);
    if (headerMatch?.[1]) return headerMatch[1];

    const extMatch = resource.fileUrl?.match(/(\.[a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : "";
    const safeTitle = (resource.title || "resource").replace(/[\\/:*?"<>|]/g, "_");
    return `${safeTitle}${ext}`;
  };

  const handleDownload = async (resource) => {
    try {
      if (!resource.fileUrl) {
        if (resource.link) {
          window.open(resource.link, "_blank");
        } else {
          alert("No downloadable file for this resource");
        }
        return;
      }

      const response = await API.get(
        `/resources/${resource._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = getDownloadName(resource, response.headers);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to download resource");
    }
  };

  useEffect(() => {
    const fetchResources = async () => {
      const { data } = await API.get(
        "/resources",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setResources(data)
    }

    fetchResources()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-gray-500">
          Learning materials shared by mentors
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {resources.length === 0 ? (
          <p>No resources available</p>
        ) : (
          resources.map((res) => (
            <div
              key={res._id}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                {res.title}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {res.description}
              </p>

              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <span>By {res.mentor?.name}</span>
                <span>
                  {new Date(res.createdAt).toLocaleDateString()}
                </span>
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  {res.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(res)}
                className="text-blue-600 underline mt-2 block"
              >
                {res.fileUrl ? "Download" : "Open Link"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentResources
