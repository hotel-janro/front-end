// DashboardLayout.jsx - Layout wrapper for all admin pages
import React from "react";
import { Outlet } from "react-router";
import { Sidebar } from "../../components/dashboard/Sidebar.jsx";

export function DashboardLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 ml-64">
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
