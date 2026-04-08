// Sidebar.jsx - Admin Dashboard Sidebar Navigation
import React from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Bed,
  Calendar,
  Users,
  Heart,
  Waves,
  ShoppingCart,
  UtensilsCrossed,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Rooms", icon: Bed, path: "/admin/rooms" },
  { label: "Bookings", icon: Calendar, path: "/admin/bookings" },
  { label: "Guests", icon: Users, path: "/admin/guests" },
  { label: "Wedding & Events", icon: Heart, path: "/admin/events" },
  { label: "Restaurant", icon: UtensilsCrossed, path: "/admin/restaurant" },
  { label: "Pool", icon: Waves, path: "/admin/pool" },
  { label: "Orders & POS", icon: ShoppingCart, path: "/admin/orders" },
  { label: "Users & Staff", icon: Users, path: "/admin/staff" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-gray-200 text-slate-800 flex flex-col min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl leading-none font-semibold tracking-tight">HotelPro</h1>
            <p className="text-sm text-slate-500 mt-1">Admin Dashboard</p>
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
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "JA"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name || "John Admin"}
            </p>
            <p className="text-xs text-slate-500 truncate">Hotel Manager</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
