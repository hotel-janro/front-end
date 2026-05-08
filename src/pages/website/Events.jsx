// Events.jsx - Wedding & Events Page (Pure JavaScript)
import React, { useEffect, useMemo, useState } from "react";
import { EventCard } from "../../components/website/EventCard.jsx";
import { CustomCalendar } from "../../components/common/CustomCalendar.jsx";
import { Calendar, Hotel, Heart, MapPin, Users, Sparkles, X, CheckCircle, Info, ChevronRight } from "lucide-react";

const HALLS = [
  {
    id: 1,
    type: "hall",
    name: "Royal Grand Hall",
    capacity: 450,
    price: 15000,
    location: "Main Building, Level 2",
    description: "Our magnificent Grand Ballroom is perfect for lavish weddings and gala events with crystal chandeliers and marble floors.",
    image: "https://images.unsplash.com/photo-1759519238029-689e99c6d19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYWxscm9vbSUyMHdlZGRpbmclMjB2ZW51ZXxlbnwxfHx8fDE3NzI0ODIyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    type: "hall",
    name: "Garden Celebration Hall",
    capacity: 300,
    price: 10000,
    location: "Garden Wing, Ground Level",
    description: "Elegant indoor-outdoor style venue surrounded by landscaped gardens, ideal for receptions and wedding ceremonies.",
    image: "https://images.unsplash.com/photo-1764471444363-e6dc0f9773bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwaGFsbCUyMGNvcnBvcmF0ZSUyMGV2ZW50fGVufDF8fHx8MTc3MjQ4MjI2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    type: "hall",
    name: "Pearl Banquet Hall",
    capacity: 200,
    price: 8000,
    location: "East Wing, Level 1",
    description: "A stylish medium-sized banquet hall designed for intimate weddings, engagement functions, and private events.",
    image: "https://images.unsplash.com/photo-1762216444919-043cf813e4de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwYXJ0eSUyMG91dGRvb3IlMjBldmVudCUyMHZlbnVlfGVufDF8fHx8MTc3MjQ4MjI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const AREAS = [
  {
    id: 4,
    type: "area",
    name: "Golden Sunset Lawn",
    capacity: 600,
    price: 12000,
    location: "West Side Gardens",
    description: "Breathtaking outdoor lawn with a scenic view of the horizon, perfect for large wedding ceremonies and sunset receptions.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1080",
  },
  {
    id: 5,
    type: "area",
    name: "Emerald Pool Terrace",
    capacity: 150,
    price: 9000,
    location: "Poolside Level",
    description: "A chic poolside terrace offering a sophisticated atmosphere for cocktail parties, engagement dinners, and small events.",
    image: "https://images.unsplash.com/photo-1566733971257-826502945d58?auto=format&fit=crop&q=80&w=1080",
  },
  {
    id: 6,
    type: "area",
    name: "Starlight Rooftop",
    capacity: 100,
    price: 11000,
    location: "Executive Tower, Top Floor",
    description: "An exclusive rooftop venue with panoramic city views, ideal for modern weddings and private corporate celebrations.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1080",
  },
];

export function Events() {
  const [activeTab, setActiveTab] = useState("halls");

  const currentData = activeTab === "halls" ? HALLS : AREAS;

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
                Every event at Hotel Janro is tailored to your unique vision. Our dedicated events team is here to assist you with hall tours, custom catering menus, and technical requirements.
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
