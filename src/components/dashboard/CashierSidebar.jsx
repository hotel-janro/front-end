import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutGrid,
  ShoppingCart,
  CreditCard,
  Receipt,
  LogOut,
  User,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";


const navItems = [
  { label: "POS Dashboard", icon: LayoutGrid, path: "/cashier" },
  { label: "Orders", icon: ShoppingCart, path: "/cashier/orders" },
  { label: "Payments", icon: CreditCard, path: "/cashier/payments" },
  { label: "Receipts", icon: Receipt, path: "/cashier/receipts" },
  { label: "Profile", icon: User, path: "/cashier/profile" },
];

export function CashierSidebar({ user, onLogout }) {
  const { settings } = useSettings();
  const navigate = useNavigate();


  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onLogout) onLogout();
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-[1.8rem] leading-none tracking-tight text-white uppercase" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.hotelName}
            </h1>
            <p className="text-xs text-[#D4AF37] tracking-[0.16em] uppercase mt-1">Cashier Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/cashier"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-[#D4AF37]/20 text-[#F5E7B2] border border-[#D4AF37]/40"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0B1324]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-sm font-bold text-[#0F172A]">
            {user?.name
              ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
              : "LC"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "Lisa Cashier"}
            </p>
            <p className="text-xs text-slate-400 truncate">POS Cashier</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer z-50 relative"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
