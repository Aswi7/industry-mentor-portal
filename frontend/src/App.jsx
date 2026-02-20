import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import MentorDashboard from "./pages/MentorDashboard"
import StudentDashboard from "./pages/StudentDashboard"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSessions from "./pages/admin/AdminSessions"
import AdminApprovals from "./pages/admin/AdminApprovals"
import AdminReports from "./pages/admin/AdminReports"



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/mentor" element={<MentorDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />

      <Route path="/admin" element={<AdminDashboard />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  )
}

export default App