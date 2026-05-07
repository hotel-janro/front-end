import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Crown, User, LogOut, Calendar, ShoppingBag, ChevronDown, LayoutDashboard, Waves, Users, Settings } from "lucide-react";

export function Navbar({ isLoggedIn, user, onLogout, authChecked = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { path: "/", label: "Home" },
    { path: "/rooms", label: "Rooms" },
    { path: "/events", label: "Events" },
    { path: "/restaurant", label: "Restaurant" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    setShowUserMenu(false);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#0F172A] text-white sticky top-0 z-50 shadow-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Crown className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xl tracking-wider" style={{ fontFamily: "DM Serif Display, serif" }}>
                HOTEL JANRO
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-[#D4AF37] uppercase -mt-1">
                Hotel & Resort
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md transition-all duration-300 text-sm tracking-wide font-medium ${
                  isActive(link.path)
                    ? "text-[#D4AF37] bg-white/10"
                    : "text-gray-300 hover:text-[#D4AF37] hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth/User Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            {authChecked && isLoggedIn ? (
              user?.role === "customer" ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F172A] font-bold text-xs uppercase shadow-lg group-hover:scale-105 transition-transform">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-200">
                      <span className="max-w-[100px] truncate">
                        {user?.name || "Guest"}
                      </span>
                      <Menu className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? "rotate-90 opacity-50" : ""}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu - Branded Dark Theme */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-[#0F172A] rounded-2xl shadow-2xl py-3 border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                      <div className="px-5 py-4 border-b border-white/5 bg-white/5 mb-2">
                        <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-bold mb-1">
                          Account Holder
                        </p>
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.name || user?.email}
                        </p>
                      </div>
                      
                      {/* Customer Management Links - Strictly for customers */}
                      <div className="space-y-1">
                        <div className="px-5 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">Personal</div>
                        <Link
                          to="/my-bookings/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:text-[#D4AF37] hover:bg-white/5 transition-colors font-medium"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-bookings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:text-[#D4AF37] hover:bg-white/5 transition-colors font-medium"
                        >
                          <Calendar className="w-4 h-4" />
                          My Bookings
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:text-[#D4AF37] hover:bg-white/5 transition-colors font-medium"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          My Orders
                        </Link>
                      </div>
                      
                      <div className="border-t border-white/5 mt-3 pt-2">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 font-bold hover:bg-red-400/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null /* Do not render dropdown for non-customer dashboards */
            ) : authChecked ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-[#D4AF37] text-[#0F172A] rounded-lg text-sm font-semibold hover:bg-[#B8962D] transition-all shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-[#D4AF37] text-[#0F172A] rounded-lg text-sm font-semibold hover:bg-[#B8962D] transition-all shadow-lg hover:shadow-[#D4AF37]/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-gray-300 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0F172A] border-t border-white/5 pb-6 overflow-hidden animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-base rounded-lg transition-all ${
                  isActive(link.path) ? "text-[#D4AF37] bg-white/10" : "text-gray-300 hover:text-[#D4AF37] hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/5 mt-2 pt-4 px-6">
            {authChecked && isLoggedIn ? (
              user?.role === "customer" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F172A] font-bold">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/my-bookings/profile" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-[#D4AF37] flex items-center gap-2"><User className="w-4 h-4"/> My Profile</Link>
                    <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-[#D4AF37] flex items-center gap-2"><Calendar className="w-4 h-4"/> My Bookings</Link>
                    <Link to="/my-orders" onClick={() => setIsOpen(false)} className="text-sm text-gray-300 hover:text-[#D4AF37] flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> My Orders</Link>
                    <button onClick={handleLogoutClick} className="text-sm text-red-400 text-left flex items-center gap-2 pt-2"><LogOut className="w-4 h-4"/> Logout</button>
                  </div>
                </div>
              ) : null
            ) : authChecked ? (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-3 text-center text-gray-300 bg-white/5 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full py-3 text-center bg-[#D4AF37] text-[#0F172A] rounded-lg font-bold">Register</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full py-3 text-center text-gray-300 bg-white/5 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full py-3 text-center bg-[#D4AF37] text-[#0F172A] rounded-lg font-bold">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
