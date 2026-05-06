import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Trash2, CheckCircle, AlertCircle, Loader2, ChevronRight, Bed, Heart } from "lucide-react";

export function MyBookings() {
  const [activeTab, setActiveTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState({ rooms: [], weddings: [] });

  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setBookings({
        rooms: [
          {
            id: "BK-1001",
            roomName: "Deluxe Ocean Suite",
            checkIn: "2026-06-15",
            checkOut: "2026-06-18",
            status: "confirmed",
            amount: 450.0,
            image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400"
          }
        ],
        weddings: [
          {
            id: "WB-2002",
            hallName: "Grand Ballroom",
            eventDate: "2026-12-20",
            package: "Premium Gold",
            status: "pending",
            amount: 2500.0,
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400"
          }
        ],
      });
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      cancelled: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#F8FAFC]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#0F172A]/10 border-t-[#D4AF37] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bed className="w-6 h-6 text-[#0F172A]" />
          </div>
        </div>
        <p className="text-[#0F172A] mt-6 font-semibold tracking-wide animate-pulse uppercase text-xs">Retrieving your reservations...</p>
      </div>
    );
  }

  const currentData = activeTab === "rooms" ? bookings.rooms : bookings.weddings;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-16 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
            My Reservations
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            View and manage your upcoming hotel stays and special event bookings.
          </p>
        </div>

        {/* Tab Selection - Branded */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-[#0F172A]/5 rounded-2xl border border-[#0F172A]/10">
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "rooms" 
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20" 
                  : "text-gray-500 hover:text-[#0F172A] hover:bg-white"
              }`}
            >
              <Bed className={`w-4 h-4 ${activeTab === "rooms" ? "text-[#D4AF37]" : "text-gray-400"}`} />
              Hotel Stays
            </button>
            <button
              onClick={() => setActiveTab("weddings")}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "weddings" 
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20" 
                  : "text-gray-500 hover:text-[#0F172A] hover:bg-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === "weddings" ? "text-[#D4AF37]" : "text-gray-400"}`} />
              Wedding Events
            </button>
          </div>
        </div>

        {currentData.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-xl shadow-[#0F172A]/5 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You don't have any {activeTab === "rooms" ? "hotel reservations" : "wedding bookings"} yet. Explore our rooms and halls to find your perfect fit.
            </p>
            <button className="bg-[#0F172A] text-[#D4AF37] px-10 py-4 rounded-2xl font-bold hover:bg-[#1E293B] transition-all shadow-xl shadow-[#0F172A]/20 cursor-pointer">
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {currentData.map((item) => (
              <div key={item.id} className="bg-white rounded-[2rem] shadow-xl shadow-[#0F172A]/5 border border-gray-100 overflow-hidden group hover:border-[#D4AF37]/30 transition-all duration-500">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                  {/* Smaller Image Box - Matching Order Style */}
                  <div className="w-full md:w-32 h-32 md:h-32 rounded-2xl overflow-hidden shrink-0 border border-gray-50 relative group-hover:border-[#D4AF37]/20 transition-colors">
                    <img 
                      src={item.image} 
                      alt={activeTab === "rooms" ? item.roomName : item.hallName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="scale-75 origin-top-left">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>

                  {/* Content Section - Aligned Properly */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Reservation</p>
                        <h3 className="text-xl font-bold text-[#0F172A]">
                          {activeTab === "rooms" ? item.roomName : item.hallName}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {item.id}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-[#0F172A]">
                            {activeTab === "rooms" ? item.checkIn : item.eventDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-[#0F172A]">
                            {activeTab === "rooms" ? item.checkOut : item.package}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                      <div className="text-left md:text-right">
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Total Amount</p>
                        <p className="text-2xl font-bold text-[#0F172A]">${item.amount.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button className="px-5 py-2 border border-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer">
                          Cancel
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 bg-[#0F172A] text-[#D4AF37] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E293B] transition-all shadow-lg shadow-[#0F172A]/10 cursor-pointer group border border-[#D4AF37]/20">
                          Details
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-xs font-semibold mb-4 uppercase tracking-widest">Need assistance with your booking?</p>
          <button className="inline-flex items-center gap-2 text-[#D4AF37] font-bold hover:text-[#B8962D] transition-colors group underline underline-offset-8 decoration-2 text-sm uppercase tracking-wider">
            Contact Guest Services
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
