// CashierLayout.jsx - Layout wrapper for all cashier pages
import React from "react";
import { Outlet } from "react-router-dom";
import { CashierSidebar } from "../../components/dashboard/CashierSidebar.jsx";

export function CashierLayout({ user, onLogout, onUpdateUser }) {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC]">
      <CashierSidebar user={user} onLogout={onLogout} />
      <main className="flex-1 min-w-0 ml-64" style={{ width: 'calc(100vw - 16rem)' }}>
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] p-6 md:p-8">
          <Outlet context={{ user, onLogout, onUpdateUser }} />
        </div>
      </main>
    </div>
  );
}
