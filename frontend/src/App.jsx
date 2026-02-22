import { Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"

import MentorDashboard from "./pages/MentorDashboard"

import StudentDashboard from "./pages/student/StudentDashboard"
import StudentSessions from "./pages/student/StudentSessions"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSessions from "./pages/admin/AdminSessions"
import AdminApprovals from "./pages/admin/AdminApprovals"
import AdminReports from "./pages/admin/AdminReports"
import StudentOverview from "./pages/student/StudentOverview";

function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Mentor */}
      <Route path="/mentor" element={<MentorDashboard />} />

      {/* Student */}
      <Route path="/student" element={<StudentDashboard />}>
  <Route index element={<StudentOverview />} />
  <Route path="sessions" element={<StudentSessions />} />
  <Route path="progress" element={<div>Progress Page</div>} />
  <Route path="resources" element={<div>Resources Page</div>} />
  <Route path="messages" element={<div>Messages Page</div>} />
</Route>
      {/* Admin */}
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