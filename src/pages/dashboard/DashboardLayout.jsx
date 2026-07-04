// DashboardLayout.jsx - Layout wrapper for all admin pages
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar.jsx";

export function DashboardLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC]">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 min-w-0 ml-64 bg-[#F8FAFC]" style={{ width: 'calc(100vw - 16rem)' }}>
        <div className="min-h-screen p-4 md:p-5">
          <Outlet context={{ user, onLogout }} />
        </div>
      </main>
    </div>
  );
}
