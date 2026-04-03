import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Search
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const StudentDashboard = () => {
  const navItems = [
    { to: "/student", label: "Overview", icon: <LayoutDashboard size={20} />, end: true },
    { to: "/student/sessions", label: "Sessions", icon: <CalendarDays size={20} /> },
    { to: "/student/resources", label: "Resources", icon: <BookOpen size={20} /> },
    { to: "/student/find-mentor", label: "Find Mentor", icon: <Search size={20} /> },
  ];

  return <DashboardLayout navItems={navItems} role="STUDENT" />;
};

export default StudentDashboard;
