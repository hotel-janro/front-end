// DashboardLayout.jsx - Layout wrapper for all admin pages
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar.jsx";

export function DashboardLayout({ user, onLogout }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC]">
      <Sidebar user={user} onLogout={onLogout} />
<<<<<<< HEAD
      <main className="flex-1 min-w-0 ml-64 bg-[#F8FAFC]">
        <div className="min-h-screen p-4 md:p-5">
          <Outlet />
=======
      <main className="flex-1 min-w-0 ml-64" style={{ width: 'calc(100vw - 16rem)' }}>
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] p-6 md:p-8">
          <Outlet context={{ user, onLogout }} />
>>>>>>> edb44e2740fcb3c9675d4c44778a683fa754eeb4
        </div>
      </main>
    </div>
  );
}
