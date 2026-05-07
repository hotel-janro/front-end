// Profile.jsx - Premium Guest Profile Management
import React, { useState } from "react";
import { User, Mail, Phone, MapPin, ShieldAlert, Edit2, Camera, CheckCircle2, ArrowUpRight, Star, ShieldCheck } from "lucide-react";
import "./CustomerDashboard.css";

export function Profile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    emergencyContact: user?.emergencyContact || "",
  });

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
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#0F172A] to-slate-800 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
             <div className="relative">
                <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-[#0F172A] text-4xl font-bold uppercase overflow-hidden border border-slate-100">
                    {user?.name?.[0] || "G"}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-[#D4AF37] text-[#0F172A] rounded-xl shadow-lg hover:scale-110 transition-all cursor-pointer">
                  <Camera className="w-4 h-4" />
                </button>
             </div>
             
             <div className="text-center md:text-left flex-1">
                <p className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[10px] mb-2">Guest Identity</p>
                <h2 className="text-4xl font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>{user?.name || "Guest User"}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                   <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                      <Star className="w-3 h-3 text-[#D4AF37] fill-current" /> Platinum Member
                   </span>
                   <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Verified Account
                   </span>
                </div>
             </div>

             <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-8 py-3 bg-[#D4AF37] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-[#D4AF37]/10"
              >
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>
          </div>
        </section>

        {/* Profile Details Panel */}
        <article className="customer-panel rounded-[2.5rem] p-8 md:p-12">
          <header className="mb-10">
            <h3 className="text-2xl font-normal text-slate-900 flex items-center gap-3" style={{ fontFamily: "DM Serif Display, serif" }}>
              <User className="w-6 h-6 text-[#D4AF37]" />
              Personal Information
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">Manage your refined details for a seamless stay.</p>
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

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
               <ShieldAlert className="w-5 h-5 text-amber-500" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Security Access</p>
                  <p className="text-[10px] text-slate-400 font-medium">Last updated: 3 months ago</p>
               </div>
            </div>
            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2 hover:text-slate-900 transition-all group">
               Update Credentials <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </article>

        {/* Membership Perks */}
        <section className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                 <h4 className="text-2xl font-normal text-[#D4AF37] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>Platinum Experience</h4>
                 <p className="text-slate-400 text-xs font-medium max-w-md">Enjoy exclusive benefits including priority room upgrades and personal concierge services at every Janro destination.</p>
              </div>
              <button className="px-8 py-3 border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all">
                 Review Benefits
              </button>
           </div>
        </section>
      </main>
    </div>
  );
}
