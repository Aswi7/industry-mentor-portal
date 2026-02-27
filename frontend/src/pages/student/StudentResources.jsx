import { useEffect, useState } from "react"
import axios from "axios"

const StudentResources = () => {

  const [resources, setResources] = useState([])
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchResources = async () => {
      const { data } = await axios.get(
        "http://localhost:5000/api/resources",
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

              {res.fileUrl && (
                <a
                  href={`http://localhost:5000${res.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline mt-2 block"
                >
                  Download
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentResources