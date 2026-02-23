import { useState } from "react"
import { Send } from "lucide-react"

export default function MentorMessages() {
  const [selectedStudent, setSelectedStudent] = useState("Arjun Sharma")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    { sender: "student", text: "Hi sir, I have a doubt in React state management." },
    { sender: "mentor", text: "Sure Arjun, tell me what you're stuck with." },
  ])

  const students = [
    { name: "Arjun Sharma", email: "arjun@student.edu" },
    { name: "Priya Patel", email: "priya@student.edu" },
  ]

  const handleSend = () => {
    if (!message.trim()) return

    setMessages([...messages, { sender: "mentor", text: message }])
    setMessage("")
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border overflow-hidden">

      {/* LEFT PANEL - STUDENT LIST */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 font-semibold text-gray-800 border-b">
          Messages
        </div>

        {students.map((student, index) => (
          <div
            key={index}
            onClick={() => setSelectedStudent(student.name)}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedStudent === student.name ? "bg-gray-200" : ""
            }`}
          >
            <h3 className="font-medium text-gray-800">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL - CHAT */}
      <div className="flex flex-col flex-1">

        {/* Chat Header */}
        <div className="p-4 border-b font-semibold text-gray-800">
          {selectedStudent}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "mentor" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs text-sm ${
                  msg.sender === "mentor"
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

        </div>

        {/* Input Area */}
        <div className="p-4 border-t flex items-center gap-3 bg-white">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}