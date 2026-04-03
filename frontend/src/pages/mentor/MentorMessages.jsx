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
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">

      {/* LEFT PANEL - STUDENT LIST */}
      <div className="w-1/3 border-r border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
        <div className="p-4 font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-dark-border">
          Messages
        </div>

        {students.map((student, index) => (
          <div
            key={index}
            onClick={() => setSelectedStudent(student.name)}
            className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              selectedStudent === student.name ? "bg-gray-200 dark:bg-gray-800 border-r-4 border-blue-500" : ""
            }`}
          >
            <h3 className="font-medium text-gray-800 dark:text-white">{student.name}</h3>
            <p className="text-sm text-gray-500 dark:text-dark-subtext">{student.email}</p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL - CHAT */}
      <div className="flex flex-col flex-1 bg-white dark:bg-dark-card">

        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-border font-semibold text-gray-800 dark:text-white">
          {selectedStudent}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-dark-bg/30">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "mentor" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs text-sm shadow-sm ${
                  msg.sender === "mentor"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-dark-border flex items-center gap-3 bg-white dark:bg-dark-card">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border border-gray-200 dark:border-dark-border rounded-lg px-4 py-2 bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}