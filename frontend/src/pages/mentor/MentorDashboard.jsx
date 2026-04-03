import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  BookOpen
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

export default function MentorDashboard() {
  const navItems = [
    { to: "/mentor", label: "Dashboard", icon: <LayoutDashboard size={20} />, end: true },
    { to: "/mentor/sessions", label: "Sessions", icon: <CalendarDays size={20} /> },
    { to: "/mentor/mentees", label: "My Mentees", icon: <Users size={20} /> },
    { to: "/mentor/resources", label: "Library", icon: <BookOpen size={20} /> },
  ];

  return <DashboardLayout navItems={navItems} role="MENTOR" />;
}
