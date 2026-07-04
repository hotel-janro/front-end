import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Phone
} from "lucide-react";
import { apiFetch } from "../../../api.js";

export function ReceptionProfile() {
  const context = useOutletContext() || {};
  const { user, onUpdateUser } = context;
  console.log("ReceptionProfile rendered, user is:", user);
  const [activeTab, setActiveTab] = useState("info");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile details state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Populate profile form when user context changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setMessage({ type: "error", text: "Name and Email are required fields." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await apiFetch("/auth/updateme", {
        method: "PUT",
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim(),
          phone: profileData.phone.trim()
        })
      });

      if (response.success && response.data) {
        if (onUpdateUser) {
          onUpdateUser(response.data);
        }
        setMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        throw new Error(response.message || "Failed to update profile.");
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile details" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setMessage({ type: "error", text: "New password cannot be the same as your current password." });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await apiFetch("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        })
      });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update password" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || "R"}
          </div>
          <div>
            <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-2">Reception Identity</p>
            <h1 className="text-3xl md:text-4xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>
              {user?.name || "Receptionist User"}
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF37]/70" />
              {user?.email || "reception@hoteljanro.com"}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md self-start md:self-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white text-xs font-black uppercase tracking-widest">Active Session</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#0F172A]/10 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setActiveTab("info");
                  setMessage({ type: "", text: "" });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "info" 
                  ? "bg-[#0F172A] text-white shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                type="button"
              >
                <User className={`w-5 h-5 ${activeTab === "info" ? "text-[#D4AF37]" : ""}`} />
                Account Settings
              </button>
              <button
                onClick={() => {
                  setActiveTab("security");
                  setMessage({ type: "", text: "" });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "security" 
                  ? "bg-[#0F172A] text-white shadow-lg shadow-slate-200" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
                type="button"
              >
                <Shield className={`w-5 h-5 ${activeTab === "security" ? "text-[#D4AF37]" : ""}`} />
                Security Access
              </button>
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-8 md:p-10">
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}

            {activeTab === "info" ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium text-sm"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium text-sm"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    System Role
                  </label>
                  <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold text-sm select-none">
                    <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[10px] font-black uppercase tracking-widest">
                      {user?.role || "Receptionist"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-[#0F172A]/10 mt-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Key className="w-4 h-4 text-[#D4AF37]" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium pr-12 text-sm"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Key className="w-4 h-4 text-[#D4AF37]" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium pr-12 text-sm"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Key className="w-4 h-4 text-[#D4AF37]" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 outline-none transition-all font-medium pr-12 text-sm"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-[#0F172A]/10 mt-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
