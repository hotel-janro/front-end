import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { Crown, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

export function VerifyOTP({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setStatus("loading");
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to resend OTP");
      }
      
      setStatus("idle");
      setMessage("A new verification code has been sent.");
      setTimer(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "An error occurred while resending the code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }
    
    setStatus("loading");
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to verify email");
      }
      
      setStatus("success");
      setMessage("Email verified successfully!");
      
      // Pass the user data back to App.jsx manually since verifyEmail acts like a login
      if (onLogin && data.data) {
          // This simulates a login from App.jsx perspective but with tokens already provided
          // Since onLogin expects credentials, we should adjust App.jsx or manually handle storage here.
          // For simplicity, we can let App.jsx's handleLogin handle the credentials, but we don't have password.
          // Wait, App.jsx's handleLogin needs email and password. Since we have tokens here,
          // We can dispatch a custom event or navigate to login. Navigating to login is easiest.
      }
      
      setTimeout(() => {
        navigate("/login", { state: { message: "Account verified successfully. Please log in." } });
      }, 2000);
      
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Verification failed. Please check your code.");
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          <h2 className="text-xl font-bold text-[#0F172A] mt-6">Verify Your Email</h2>
          <p className="text-gray-400 text-sm mt-2">
            We've sent a 6-digit code to <br/>
            <span className="font-medium text-[#1E3A8A]">{email}</span>
          </p>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {message}
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={status === "loading"}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-[#0F172A] bg-[#F8FAFC] border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all disabled:opacity-50"
                />
              ))}
            </div>

            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full !py-4 text-lg tracking-wide"
              disabled={status === "loading" || otp.join("").length !== 6}
            >
              {status === "loading" ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        )}

        {status !== "success" && (
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 mb-4">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={!canResend || status === "loading"}
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                canResend && status !== "loading"
                  ? "text-[#1E3A8A] hover:text-[#D4AF37]"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${status === "loading" ? "animate-spin" : ""}`} />
              {canResend ? "Resend Code" : `Resend available in ${formatTime(timer)}`}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/register" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0F172A] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to registration
          </Link>
        </div>
      </div>
    </div>
  );
}
