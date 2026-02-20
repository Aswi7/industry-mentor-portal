import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MentorDashboard from "./pages/MentorDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    
      <Route path="/mentor" element={<MentorDashboard />} />
       <Route path="/student" element={<StudentDashboard />} />
       <Route path="/admin" element={<AdminDashboard />} />
    
    </Routes>
  )
}

export default App