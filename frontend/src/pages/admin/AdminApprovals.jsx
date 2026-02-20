import React from "react";
import { Check, X } from "lucide-react";

const AdminApprovals = () => {
  const mentors = [
    {
      name: "Rajesh Kumar",
      role: "Senior Software Engineer at Google",
      initials: "RK",
      skills: ["System Design", "DSA", "Web Development"],
    },
    {
      name: "Sneha Reddy",
      role: "Data Science Lead at Microsoft",
      initials: "SR",
      skills: ["Machine Learning", "Data Analytics", "Python"],
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mentor Approvals</h1>
        <p className="text-gray-500">
          Review and approve mentor registrations
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-6">
        {mentors.map((mentor, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
          >
            {/* Left Section */}
            <div className="flex items-start gap-4">
              
              {/* Avatar */}
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-semibold">
                {mentor.initials}
              </div>

              {/* Info */}
              <div>
                <h2 className="text-lg font-semibold">
                  {mentor.name}
                </h2>
                <p className="text-gray-600 mb-3">
                  {mentor.role}
                </p>

                {/* Skills */}
                <div className="flex gap-2 flex-wrap">
                  {mentor.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section (Buttons) */}
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition">
                <Check size={18} />
                Approve
              </button>

              <button className="flex items-center gap-2 border border-red-400 text-red-600 px-5 py-2 rounded-lg hover:bg-red-50 transition">
                <X size={18} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminApprovals;