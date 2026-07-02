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
  Dumbbell
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
  { label: "Users & Staff", icon: Users, path: "/admin/staff" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
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

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] text-slate-100 flex flex-col min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[1.4rem] leading-none tracking-tight text-white uppercase truncate" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.hotelName}
            </h1>
            <p className="text-[10px] text-[#D4AF37] tracking-[0.16em] uppercase mt-0.5 truncate">
              {isCustomer ? "Customer Portal" : "Admin Dashboard"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin" || item.path === "/my-bookings"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#D4AF37]/20 text-[#F5E7B2] border border-[#D4AF37]/40"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B1324]">
        <div className="flex items-center gap-3">
          <Link to={isCustomer ? "/my-bookings/profile" : "/admin/settings"} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-[10px] font-black text-[#0F172A] shrink-0">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "JA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
                {user?.name || "John Admin"}
              </p>
              <p className="text-[9px] text-slate-500 truncate capitalize font-bold">
                {user?.role || "Hotel Manager"}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
