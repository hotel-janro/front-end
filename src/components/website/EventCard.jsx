// EventCard.jsx - Event/Hall Card Component (Pure JavaScript)
import React from "react";
import { Users, Calendar, MapPin } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

export function EventCard({ hall }) {
  const { settings } = useSettings();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 h-full flex flex-col">
      <div className="relative overflow-hidden h-64">
        <ImageWithFallback
          src={hall.image}
          alt={hall.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-[#0F172A]/80 text-white px-4 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-2 backdrop-blur-sm border border-white/10">
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Capacity: {hall.capacity} guests
        </div>
      </div>
      
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-normal text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
            {hall.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {hall.location}
        </div>
 
        <p className="text-slate-500 text-sm leading-relaxed flex-grow">{hall.description}</p>
      </div>
    </div>
  );
}
