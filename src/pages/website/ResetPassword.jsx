import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { Crown, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }
    
    setStatus("loading");
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/resetpassword/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }
      
      setStatus("success");
      setMessage("Your password has been successfully reset.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "An error occurred while resetting the password.");
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
          <h2 className="text-xl font-bold text-[#0F172A] mt-6">Create New Password</h2>
          <p className="text-gray-400 text-sm mt-2">Please enter your new password below.</p>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{message}</div>
        )}

        {status === "success" ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-gray-600 font-medium">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter new password" 
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-12 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  disabled={status === "loading"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" disabled={status === "loading"}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm new password" 
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-12 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors" 
                  disabled={status === "loading"}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full !py-3 flex items-center justify-center gap-2 mt-2"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
