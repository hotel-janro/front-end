// EventCard.jsx - Event/Hall Card Component (Pure JavaScript)
import React from "react";
import { Users, Calendar, MapPin } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

export function EventCard({ hall, onBook, selectedDate, onDateChange }) {
  const { settings } = useSettings();
  const hasSelectedDate = Boolean(selectedDate);
  const isHallAvailable = hall.isAvailable !== false;
  const canBook = hasSelectedDate && isHallAvailable;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
      <div className="relative overflow-hidden h-56">
        <ImageWithFallback
          src={hall.image}
          alt={hall.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 bg-[#0F172A]/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <Users className="w-3 h-3" /> Up to {hall.capacity} guests
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
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
            <span className="text-[#1E3A8A]" style={{ fontFamily: "DM Serif Display, serif" }}>
              {settings.currency.symbol} {hall.price.toLocaleString()}
            </span>
          </div>

          {hasSelectedDate && (
            <p className={`text-xs mb-2 ${isHallAvailable ? "text-green-700" : "text-red-600"}`}>
              {isHallAvailable ? "Available for selected date" : hall.reason || "Not available for selected date"}
            </p>
          )}

          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Event Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          disabled={!canBook}
          onClick={() => onBook({ hall, eventDate: selectedDate })}
        >
          {!hasSelectedDate ? "Select Date to Book" : isHallAvailable ? "Book Hall" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}
