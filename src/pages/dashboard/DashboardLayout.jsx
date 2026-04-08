// DashboardLayout.jsx - Layout wrapper for all admin pages
import React from "react";
import { Outlet } from "react-router";
import { Sidebar } from "../../components/dashboard/Sidebar.jsx";

export function DashboardLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
