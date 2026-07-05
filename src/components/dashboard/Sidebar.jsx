// Sidebar.jsx -   Admin Dashboard Sidebar Navigation bar
import { Link } from "react-router-dom";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Boxes,
  UserCircle,
  Dumbbell,
  Mail
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";


const adminItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Rooms", icon: Bed, path: "/admin/rooms" },
  { label: "Bookings", icon: Calendar, path: "/admin/bookings" },
  { label: "Guests", icon: Users, path: "/admin/guests" },
  { label: "Wedding & Events", icon: Heart, path: "/admin/events" },
  { label: "Restaurant", icon: UtensilsCrossed, path: "/admin/restaurant" },
  { label: "Pool", icon: Waves, path: "/admin/pool" },
  { label: "Gym", icon: Dumbbell, path: "/admin/gym" },
  { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
  { label: "Staff", icon: Users, path: "/admin/staff" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  { label: "Messages", icon: Mail, path: "/admin/messages" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

const customerItems = [
  { label: "My Bookings", icon: Calendar, path: "/my-bookings" },
  { label: "My Profile", icon: Users, path: "/my-bookings/profile" },
  { label: "Shopping Cart", icon: ShoppingCart, path: "/cart" },
];

export function Sidebar({ user, onLogout }) {
  const { settings } = useSettings();
  const navigate = useNavigate();


  const isCustomer = user?.role === "customer";
  const items = isCustomer ? customerItems : adminItems;

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
            <Crown className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-[1.8rem] leading-none tracking-tight text-white uppercase" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.hotelName}
            </h1>
            <p className="text-xs text-[#D4AF37] tracking-[0.16em] uppercase mt-1">
              {isCustomer ? "Customer Portal" : "Admin Dashboard"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin" || item.path === "/my-bookings"}
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
          <Link to="/admin/settings" className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-sm font-bold text-[#0F172A]">
              {user?.name
                ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                : "JA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "John Admin"}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {user?.role || "Hotel Manager"}
              </p>
            </div>
          </Link>
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
