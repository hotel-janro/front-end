import React, { useState } from "react";
import { User, Mail, Phone, MapPin, ShieldAlert, Edit2, Camera, CheckCircle } from "lucide-react";

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
    <div className="bg-[#F8FAFC] min-h-screen pt-8 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
            Profile Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your personal information for a seamless stay.
          </p>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-xl shadow-[#0F172A]/5 overflow-hidden border border-gray-100">
          {/* Header Banner - Even Smaller */}
          <div className="h-24 bg-[#0F172A] relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -bottom-10 left-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg border border-gray-100">
                  <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center text-[#0F172A] text-2xl font-bold uppercase">
                    {user?.name?.[0] || "G"}
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 p-1 bg-[#D4AF37] text-white rounded-lg shadow-md hover:bg-[#B8962D] transition-all cursor-pointer">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 pb-8 px-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-0.5">{user?.name || "Guest User"}</h2>
                <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[9px] font-bold tracking-widest uppercase border border-[#D4AF37]/20">
                  {user?.role || "Member"}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#1E293B] transition-all shadow-lg cursor-pointer group"
              >
                <Edit2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {profileFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className={`space-y-1 ${field.key === "address" ? "md:col-span-2" : ""}`}>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Icon className="w-3 h-3 text-[#D4AF37]" />
                      {field.label}
                    </label>
                    <div className={`w-full px-4 py-2.5 rounded-xl border transition-all ${isEditing && !field.disabled
                      ? "bg-white border-[#D4AF37] ring-2 ring-[#D4AF37]/5"
                      : "bg-gray-50/50 border-gray-100 group-hover:border-[#D4AF37]/30"
                      }`}>
                      {isEditing && !field.disabled ? (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full bg-transparent focus:outline-none text-gray-700 text-sm font-medium"
                        />
                      ) : (
                        <p className="text-gray-700 text-sm font-medium truncate">{field.value || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-semibold text-gray-500">Verified Account</span>
              </div>
              <button className="text-[10px] font-bold text-[#D4AF37] hover:text-[#B8962D] transition-all cursor-pointer hover:underline">
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
