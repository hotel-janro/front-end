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
        <div className="absolute top-4 left-4 bg-[#0F172A]/80 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm border border-white/10">
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Capacity: {hall.capacity} guests
        </div>
      </div>
      
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
            {hall.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-4">
          <MapPin className="w-3.5 h-3.5" />
          {hall.location}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{hall.description}</p>

        <div className="space-y-4 pt-6 border-t border-gray-50 mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Venue Fee Starts At</span>
            <span className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.currency.symbol}{hall.price.toLocaleString()}
            </span>
          </div>

          <Button
            variant="secondary"
            className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#0F172A] text-[#D4AF37] hover:bg-[#1E293B] border-none shadow-lg shadow-[#0F172A]/10"
            onClick={() => window.location.href = '/contact'}
          >
            Inquire Now
          </Button>
        </div>
      </div>
    </div>
  );
}
