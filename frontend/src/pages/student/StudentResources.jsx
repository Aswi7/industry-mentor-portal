const StudentResources = () => {

  const resources = [
    {
      title: "System Design Primer",
      desc: "Comprehensive guide to system design interviews",
      author: "Rajesh Kumar",
      date: "2026-02-09",
      type: "Link"
    },
    {
      title: "DSA Cheat Sheet",
      desc: "Quick reference for common algorithms",
      author: "Rajesh Kumar",
      date: "2026-02-07",
      type: "Document"
    },
    {
      title: "React Best Practices",
      desc: "Modern React patterns and hooks",
      author: "Rajesh Kumar",
      date: "2026-02-10",
      type: "Link"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-gray-500">
          Learning materials shared by mentors
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        {resources.map((res, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {res.title}
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              {res.desc}
            </p>

            <div className="flex justify-between mt-4 text-sm text-gray-500">
              <span>By {res.author}</span>
              <span>{res.date}</span>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">
                {res.type}
              </span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default StudentResources;