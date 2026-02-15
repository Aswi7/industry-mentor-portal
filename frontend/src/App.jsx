import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MentorDashboard from "./pages/MentorDashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    
      <Route path="/mentor" element={<MentorDashboard />} />
    
    </Routes>
  )
}

export default App