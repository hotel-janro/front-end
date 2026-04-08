// Login.jsx - Login Page (Pure JavaScript)
import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/common/Button.jsx";
import { Crown, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Login({ onLogin }) {
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
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-2xl text-[#0F172A] tracking-wider" style={{ fontFamily: "DM Serif Display, serif" }}>
              HOTEL JANRO
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
          </div>
          <Button type="submit" variant="secondary" className="w-full !py-3">
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => setError("Google sign in is not connected yet.")}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 px-4 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm text-gray-600">Sign in with Google</span>
        </button>

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