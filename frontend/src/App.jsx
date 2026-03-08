import { Navigate, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import LinkedInCallback from "./pages/LinkedInCallback"
import GoogleCalendarCallback from "./pages/GoogleCalendarCallback"

import MentorDashboard from "./pages/mentor/MentorDashboard"
import MentorOverview from "./pages/mentor/MentorOverview"
import MentorSessions from "./pages/mentor/MentorSessions"
import MentorResources from "./pages/mentor/MentorResources"
import MentorMentees from "./pages/mentor/MentorMentees"
import MentorPending from "./pages/mentor/MentorPending"


import StudentDashboard from "./pages/student/StudentDashboard"
import StudentSessions from "./pages/student/StudentSessions"
import StudentResources from "./pages/student/StudentResources";
import FindMentor from "./pages/student/FindMentor"


import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSessions from "./pages/admin/AdminSessions"
import AdminApprovals from "./pages/admin/AdminApprovals"
import AdminReports from "./pages/admin/AdminReports"
import StudentOverview from "./pages/student/StudentOverview"

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")
  } catch {
    return null
  }
}

const isMentorApproved = (status) => ["VERIFIED", "ACTIVE"].includes(status)

const MentorRouteGuard = ({ children }) => {
  const user = getStoredUser()
  if (!user || user.role !== "MENTOR") return <Navigate to="/" replace />
  if (!isMentorApproved(user.mentorStatus)) return <Navigate to="/mentor/pending" replace />
  return children
}

const MentorPendingGuard = ({ children }) => {
  const user = getStoredUser()
  if (!user || user.role !== "MENTOR") return <Navigate to="/" replace />
  if (isMentorApproved(user.mentorStatus)) return <Navigate to="/mentor" replace />
  return children
}

function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      <Route path="/auth/google/calendar/callback" element={<GoogleCalendarCallback />} />
      <Route
        path="/mentor/pending"
        element={
          <MentorPendingGuard>
            <MentorPending />
          </MentorPendingGuard>
        }
      />


     {/* Mentor */}
<Route
  path="/mentor"
  element={
    <MentorRouteGuard>
      <MentorDashboard />
    </MentorRouteGuard>
  }
>
  <Route index element={<MentorOverview />} />
  <Route path="sessions" element={<MentorSessions />} />
  <Route path="mentees" element={<MentorMentees />} />
 <Route path="resources" element={<MentorResources />} />
</Route>
  

      {/* Student */}
<Route path="/student" element={<StudentDashboard />}>
  <Route index element={<StudentOverview />} />
  <Route path="sessions" element={<StudentSessions />} />
  <Route path="resources" element={<StudentResources />} />
  <Route path="find-mentor" element={<FindMentor />} />
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
