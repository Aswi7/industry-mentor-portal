import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckCircle, 
  BarChart3 
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const AdminDashboard = () => {
  const navItems = [
    { to: "/admin", label: "Overview", icon: <LayoutDashboard size={20} />, end: true },
    { to: "/admin/users", label: "Users", icon: <Users size={20} /> },
    { to: "/admin/sessions", label: "Sessions", icon: <CalendarDays size={20} /> },
    { to: "/admin/approvals", label: "Approvals", icon: <CheckCircle size={20} /> },
    { to: "/admin/reports", label: "Reports", icon: <BarChart3 size={20} /> },
  ];

  return <DashboardLayout navItems={navItems} role="ADMIN" />;
};

export default AdminDashboard;
