import React, { useState } from "react";
import { Users, Calendar, MapPin } from "lucide-react";
import Button from "../common/Button"; // Standard import

const EventCard = ({ hall, onBook }) => {
  const [eventDate, setEventDate] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
      <div className="relative overflow-hidden h-56">
        {/* Replaced Figma image with standard img tag */}
        <img
          src={hall.image}
          alt={hall.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-[#0F172A]/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <Users className="w-3 h-3" /> Up to {hall.capacity} guests
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[#0F172A] mb-2 text-xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
          {hall.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3">{hall.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            {hall.location}
          </span>
        </div>

        <div className="bg-[#F8FAFC] rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Starting from</span>
            <span className="text-[#1E3A8A] font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
              ${hall.price.toLocaleString()}
            </span>
          </div>
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onBook({ hall, eventDate })}
        >
          Book Hall
        </Button>
      </div>
    </div>
  );
};

export default EventCard;