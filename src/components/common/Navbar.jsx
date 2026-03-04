import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { Menu, X, Crown, User, LogOut } from "lucide-react";

const Navbar = ({ isLoggedIn, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <nav className="bg-[#0F172A] text-white sticky top-0 z-50 shadow-xl">
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
                className={`px-4 py-2 rounded-md transition-all duration-300 text-sm tracking-wide ${
                  isActive(link.path)
                    ? "text-[#D4AF37] bg-white/10"
                    : "text-gray-300 hover:text-[#D4AF37] hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  {user?.name || "Guest"}
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-[#D4AF37] text-[#0F172A] rounded-lg text-sm hover:bg-[#c4a030] transition-all"
                >
                  Register
                </Link>
              </>
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
        <div className="lg:hidden bg-[#0F172A] border-t border-white/10 pb-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-6 py-3 text-sm ${
                isActive(link.path) ? "text-[#D4AF37] bg-white/10" : "text-gray-300 hover:text-[#D4AF37]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2 px-6">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-300">{user?.name || "Guest"}</span>
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="text-sm text-red-400 text-left cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-sm text-gray-300">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="text-sm text-[#D4AF37]">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;