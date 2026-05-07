import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { Crown, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }
    
    setStatus("loading");
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/forgotpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset email");
      }
      
      setStatus("success");
      setMessage("A password reset link has been sent to your email address.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "An error occurred while sending the email.");
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
          <h2 className="text-xl font-bold text-[#0F172A] mt-6">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{message}</div>
        )}

        {status === "success" ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-gray-600 text-sm">{message}</p>
            <Link to="/login" className="block w-full bg-[#0F172A] text-white py-3 rounded-lg font-medium hover:bg-[#1E293B] transition-colors">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  disabled={status === "loading"}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full !py-3 flex items-center justify-center gap-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0F172A] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
