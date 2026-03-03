import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";

const CreateSessionModal = ({ onClose, onCreate }) => {
  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [maxStudents, setMaxStudents] = useState("5");
  const [type, setType] = useState("free");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sessionData = {
      title,
      description,
      skills,
      date,
      time,
      duration,
      maxStudents,
      type,
    };
    if (onCreate) onCreate(sessionData);
    onClose();
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillInputKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
      setSkillInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Schedule a New Session</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Session Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. System Design Deep Dive"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="What will be covered in this session?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Date *</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 pr-3 py-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Pick a date"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Time *</label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 pr-3 py-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Select time"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Skills / Topics *</label>
            <div className="flex flex-wrap gap-2 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => removeSkill(skill)}
                  />
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillInputKey}
                className="flex-1 border-transparent focus:border-transparent focus:ring-0"
                placeholder="Add skill"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Duration (min)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Max Students</label>
              <select
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Session Type</span>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="free"
                  checked={type === "free"}
                  onChange={() => setType("free")}
                />
                Unpaid (Free)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="paid"
                  checked={type === "paid"}
                  onChange={() => setType("paid")}
                />
                Paid
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;
