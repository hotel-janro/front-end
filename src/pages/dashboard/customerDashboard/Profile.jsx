// Profile.jsx 
import React, { useState } from "react";
import { User, Mail, Phone, MapPin, ShieldAlert, Camera, Star, ShieldCheck, Eye, EyeOff } from "lucide-react";
import "./CustomerDashboard.css";

export function Profile({ user }) {
  const token = localStorage.getItem("janro_token");
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Email Update State
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // Password Update State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    emergencyContact: user?.emergencyContact || "",
  });

  // Sync formData with user prop when it updates
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        emergencyContact: user.emergencyContact || "",
      });
    }
  }, [user]);

  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/request-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail })
      });
      const result = await response.json();
      if (result.success) {
        setShowEmailOTP(true);
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyEmailChange = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: "success", text: "Email updated! Please log in again." });
        setTimeout(() => window.location.href = "/login", 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Verification failed." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    // --- VALIDATIONS ---
    if (!formData.name || formData.name.trim().length < 3) {
      setMessage({ type: "error", text: "Please enter a valid full name (min 3 characters)" });
      return;
    }

    const cleanPhone = formData.phone.replace(/\s+/g, '');
    if (!/^(0\d{9}|\+94\d{9})$/.test(cleanPhone)) {
      setMessage({ type: "error", text: "Please enter a valid Sri Lankan phone number" });
      return;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      setMessage({ type: "error", text: "Please enter a valid home address" });
      return;
    }

    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/updateme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    setIsUpdating(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm
        })
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update password." });
    } finally {
      setIsUpdating(false);
    }
  };

  const profileFields = [
    { label: "Full Name", value: formData.name, icon: User, key: "name" },
    { label: "Email Address", value: user?.email || "guest@hoteljanro.com", icon: Mail, key: "email", disabled: true },
    { label: "Phone Number", value: formData.phone, icon: Phone, key: "phone" },
    { label: "Home Address", value: formData.address, icon: MapPin, key: "address" },
    { label: "Emergency Contact", value: formData.emergencyContact, icon: ShieldAlert, key: "emergencyContact" },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen p-6 md:p-8">
      <main className="max-w-4xl mx-auto space-y-8 mt-10">
        {/* Hero Section / Profile Header */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-12 shadow-2xl border border-white/5">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-full blur-[100px] -mr-20 -mt-20" />
          <div className="absolute left-0 bottom-0 h-1/2 w-1/2 bg-[#D4AF37]/5 rounded-full blur-[120px] -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-[#D4AF37] p-0.5 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <div className="w-full h-full rounded-[1.9rem] bg-[#0F172A] flex items-center justify-center text-[#D4AF37] text-4xl font-normal overflow-hidden" style={{ fontFamily: "DM Serif Display, serif" }}>
                    {user?.name?.[0] || "G"}
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-[#D4AF37] text-[#0F172A] rounded-2xl shadow-xl hover:scale-110 transition-all cursor-pointer border-4 border-[#0F172A]">
                  <Camera className="w-4 h-4" />
                </button>
             </div>
             
             <div className="text-center md:text-left flex-1">
                <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-3 opacity-80">Guest Identity</p>
                <h2 className="text-4xl md:text-5xl font-normal leading-tight text-white" style={{ fontFamily: "DM Serif Display, serif" }}>{user?.name || "Guest User"}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                   <span className="px-5 py-2 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2 text-[#D4AF37]">
                      <Star className="w-3.5 h-3.5 fill-current" /> Platinum Member
                   </span>
                   <span className="px-5 py-2 bg-emerald-500/10 backdrop-blur-md text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                   </span>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center gap-1">
                  <button 
                    onClick={() => setActiveTab("info")}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "info" ? "bg-white text-[#0F172A]" : "text-white hover:bg-white/5"}`}
                  >
                    Information
                  </button>
                  <button 
                    onClick={() => setActiveTab("security")}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === "security" ? "bg-white text-[#0F172A]" : "text-white hover:bg-white/5"}`}
                  >
                    Security
                  </button>
                </div>
             </div>
          </div>
        </section>

        {activeTab === "info" ? (
          <article className="customer-panel rounded-[2.5rem] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-normal text-slate-900 flex items-center gap-3" style={{ fontFamily: "DM Serif Display, serif" }}>
                  <User className="w-6 h-6 text-[#D4AF37]" />
                  Personal Information
                </h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Manage your refined details for a seamless stay.</p>
              </div>
                {message.text && activeTab === "info" && (
                  <div className={`mb-4 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {message.text}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleUpdateProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={isUpdating}
                  className="px-8 py-3 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-xl shadow-[#0F172A]/10 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : (isEditing ? "Save Changes" : "Edit Profile")}
                </button>
              </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {profileFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className={`space-y-3 ${field.key === "address" ? "md:col-span-2" : ""}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Icon className="w-4 h-4 text-[#D4AF37]" />
                      {field.label}
                    </label>
                    <div className={`w-full px-6 py-4 rounded-2xl border transition-all duration-500 ${isEditing && !field.disabled
                      ? "bg-white border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5"
                      : "bg-slate-50 border-slate-100 group-hover:border-slate-300"
                      }`}>
                      {isEditing && !field.disabled ? (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full bg-transparent focus:outline-none text-slate-900 text-sm font-bold placeholder-slate-300"
                          placeholder={`Enter your ${field.label.toLowerCase()}...`}
                        />
                      ) : (
                        <p className="text-slate-900 text-sm font-bold truncate">{field.value || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Email Management */}
            <article className="customer-panel rounded-[2.5rem] p-8 md:p-10">
              <header className="mb-8">
                <h3 className="text-xl font-normal text-slate-900 flex items-center gap-3" style={{ fontFamily: "DM Serif Display, serif" }}>
                  <Mail className="w-5 h-5 text-[#D4AF37]" />
                  Email Security
                </h3>
              </header>

              {message.text && activeTab === "security" && (
                <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${message.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {message.text}
                </div>
              )}

              {!showEmailOTP ? (
                <form onSubmit={handleRequestEmailChange} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Email Address</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email..."
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <button 
                    disabled={isUpdating}
                    className="w-full py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Processing..." : "Update Email"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChange} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP..."
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-center tracking-[1em] focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  <button 
                    disabled={isUpdating}
                    className="w-full py-4 bg-[#D4AF37] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-[#D4AF37] transition-all"
                  >
                    {isUpdating ? "Verifying..." : "Confirm Verification"}
                  </button>
                  <button type="button" onClick={() => setShowEmailOTP(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0F172A]">Back</button>
                </form>
              )}
            </article>

            {/* Password Management */}
            <article className="customer-panel rounded-[2.5rem] p-8 md:p-10">
              <header className="mb-8">
                <h3 className="text-xl font-normal text-slate-900 flex items-center gap-3" style={{ fontFamily: "DM Serif Display, serif" }}>
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  Password Management
                </h3>
              </header>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-6 py-4 pr-14 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full px-6 py-4 pr-14 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button 
                  disabled={isUpdating}
                  className="w-full py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-50 mt-4"
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </form>
            </article>
          </div>
        )}


      </main>
    </div>
  );
}
