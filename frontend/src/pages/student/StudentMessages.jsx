import { Send } from "lucide-react"

export default function StudentMessages() {

  const contacts = [
    {
      name: "Mentor Rajesh",
      email: "rajesh@mentor.com"
    },
    {
      name: "Priya Patel",
      email: "priya@mentor.com"
    }
  ]

  const chats = [
    {
      sender: "Mentor Rajesh",
      message: "Hi, how is your preparation going?",
      type: "mentor"
    },
    {
      sender: "You",
      message: "I am practicing DSA problems daily.",
      type: "student"
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm h-[85vh] flex">

      {/* LEFT CONTACT LIST */}
      <div className="w-1/3 border-r">

        <div className="p-5 border-b font-semibold text-lg">
          Messages
        </div>

        <div>

          {contacts.map((c, index) => (
            <div
              key={index}
              className="p-4 border-b hover:bg-gray-100 cursor-pointer"
            >
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
            </div>
          ))}

        </div>

      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* Chat Header */}
        <div className="p-5 border-b font-semibold text-lg">
          Arjun Sharma
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">

          {chats.map((chat, index) => (
            <div
              key={index}
              className={`flex ${
                chat.type === "student"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-md p-4 rounded-xl ${
                  chat.type === "student"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {chat.message}
              </div>
            </div>
          ))}

        </div>

        {/* Input Box */}
        <div className="border-t p-4 flex gap-3">

          <input
            placeholder="Type your message..."
            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none"
          />

          <button className="bg-blue-600 text-white px-5 rounded-xl flex items-center">
            <Send size={18} />
          </button>

        </div>

      </div>

    </div>
  )
}