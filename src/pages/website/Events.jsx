// Events.jsx - Wedding & Events Page (Dynamic)
import React, { useEffect, useMemo, useState } from "react";
import { useSettings } from "../../context/SettingsContext.jsx";
import { apiFetch } from "../../api.js";
import { EventCard } from "../../components/website/EventCard.jsx";
import { CustomCalendar } from "../../components/common/CustomCalendar.jsx";
import { Calendar, Hotel, Heart, MapPin, Users, Sparkles, X, CheckCircle, Info, ChevronRight, Loader2 } from "lucide-react";

export function Events() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState("halls");
  const [hallsList, setHallsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await apiFetch("/weddings/halls");
        if (response.success && Array.isArray(response.data)) {
          // Normalize hallName to name for frontend EventCard component mapping
          const normalized = response.data.map(h => ({
            ...h,
            id: h._id,
            name: h.hallName
          }));
          setHallsList(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch wedding halls:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  const currentData = useMemo(() => {
    return hallsList.filter(hall => {
      const type = (hall.type || "").toLowerCase();
      if (activeTab === "halls") {
        return type === "hall";
      } else {
        return type === "event area" || type === "area";
      }
    });
  }, [hallsList, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Premier Venues</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Weddings & Events
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto px-4">
          Discover a collection of grand ballrooms and scenic outdoor areas designed to host your most prestigious celebrations with unparalleled luxury.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-[#0F172A]/10 border border-white flex items-center gap-2">
            <button
              onClick={() => setActiveTab("halls")}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${
                activeTab === "halls"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-xl shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Hotel className="w-4 h-4" />
              Grand Halls
            </button>
            <button
              onClick={() => setActiveTab("areas")}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${
                activeTab === "areas"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-xl shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Outdoor Areas
            </button>
          </div>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
          {currentData.map((hall) => (
            <EventCard
              key={hall.id}
              hall={hall}
            />
          ))}
        </div>

        {/* Inquiry Section */}
        <div className="bg-white rounded-[3rem] p-12 md:p-20 mb-32 shadow-2xl shadow-[#0F172A]/5 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
             <Hotel className="w-full h-full text-[#0F172A] -rotate-12 transform translate-x-1/4" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-4xl font-bold text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                Plan Your Event with Our Specialists
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Every event at {settings.hotelName} is tailored to your unique vision. Our dedicated events team is here to assist you with hall tours, custom catering menus, and technical requirements.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Capacity Consultation</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Custom Decor Themes</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-center w-full md:w-auto shadow-2xl">
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Direct Reservations</p>
              <h4 className="text-white text-2xl font-bold mb-2">Speak with us</h4>
              <p className="text-gray-400 text-sm mb-8">Available 9:00 AM - 8:00 PM</p>
              <a 
                href="tel:+94112345678" 
                className="block w-full bg-[#D4AF37] text-[#0F172A] py-5 px-10 rounded-2xl font-bold text-lg hover:bg-[#B8962D] transition-all mb-4 shadow-xl shadow-[#D4AF37]/10"
              >
                +94 11 234 5678
              </a>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="w-full bg-white/5 text-white py-5 px-10 rounded-2xl font-bold text-sm hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Send an Inquiry <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
