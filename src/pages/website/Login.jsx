// Login Page
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { Crown, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";


export function Login({ onLogin }) {
  const { settings } = useSettings();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setError("");
      await onLogin({ email, password });
      // Clear password on success
      setPassword("");
    } catch (err) {
      setError(err.message || "Invalid email or password");
      // Clear password on failure
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-2xl text-[#0F172A] tracking-wider uppercase" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.hotelName}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Welcome back! Please sign in to continue.</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full border border-gray-200 rounded-lg pl-10 pr-12 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs text-[#1E3A8A] hover:text-[#D4AF37] transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
          <Button type="submit" variant="secondary" className="w-full !py-3">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#1E3A8A] hover:text-[#D4AF37] transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
