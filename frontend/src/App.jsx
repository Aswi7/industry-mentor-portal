import { Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"

import MentorDashboard from "./pages/mentor/MentorDashboard"
import MentorOverview from "./pages/mentor/MentorOverview"
import MentorSessions from "./pages/mentor/MentorSessions"
import MentorResources from "./pages/mentor/MentorResources"
import MentorMentees from "./pages/mentor/MentorMentees"


import StudentDashboard from "./pages/student/StudentDashboard"
import StudentSessions from "./pages/student/StudentSessions"
import StudentResources from "./pages/student/StudentResources";
import StudentMessages from "./pages/student/StudentMessages"


import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSessions from "./pages/admin/AdminSessions"
import AdminApprovals from "./pages/admin/AdminApprovals"
import AdminReports from "./pages/admin/AdminReports"
import StudentOverview from "./pages/student/StudentOverview"
import MentorMessages from "./pages/mentor/MentorMessages"

function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />


     {/* Mentor */}
<Route path="/mentor" element={<MentorDashboard />}>
  <Route index element={<MentorOverview />} />
  <Route path="sessions" element={<MentorSessions />} />
  <Route path="mentees" element={<MentorMentees />} />
 <Route path="resources" element={<MentorResources />} />
  <Route path="messages" element={<MentorMessages />} />
</Route>
  

      {/* Student */}
      <Route path="/student" element={<StudentDashboard />}>
  <Route index element={<StudentOverview />} />
  <Route path="sessions" element={<StudentSessions />} />
  <Route path="resources" element={<StudentResources />} />
  <Route path="messages" element={<StudentMessages />} />
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