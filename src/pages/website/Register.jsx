// Register Page
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { Crown, Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";


export function Register({ onRegister, onGoogleLogin }) {
  const { settings } = useSettings();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /* global google */
  useEffect(() => {
    const initializeGoogleSignUp = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: "909686127278-er1uoibsf4do6sgd7pbj692cbr89np83.apps.googleusercontent.com",
            callback: async (response) => {
              try {
                setError("");
                await onGoogleLogin(response.credential);
              } catch (err) {
                setError(err.message || "Google sign up failed");
              }
            }
          });

          window.google.accounts.id.renderButton(
            document.getElementById("google-register-btn"),
            { 
              theme: "outline", 
              size: "large", 
              width: "360",
              shape: "rectangular",
              text: "signup_with"
            }
          );
        } catch (err) {
          console.error("Google accounts initialisation error", err);
        }
      } else {
        const timer = setTimeout(initializeGoogleSignUp, 100);
        return () => clearTimeout(timer);
      }
    };

    const cleanup = initializeGoogleSignUp();
    return () => {
      if (cleanup) cleanup();
    };
  }, [onGoogleLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setError("");
      await onRegister({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setForm({ ...form, password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Registration failed");
      setForm({ ...form, password: "", confirmPassword: "" });
    }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

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
          <p className="text-gray-400 text-sm">Create your account to get started.</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07x xxxxxxx" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 6 characters" className="w-full border border-gray-200 rounded-lg pl-10 pr-12 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Re-enter password" className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            </div>
          </div>
          <Button type="submit" variant="secondary" className="w-full !py-3">
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or sign up with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google Sign Up */}
        <div id="google-register-btn" className="w-full flex justify-center"></div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1E3A8A] hover:text-[#D4AF37] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
