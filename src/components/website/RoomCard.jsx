// RoomCard.jsx - Room Card Component (Pure JavaScript)
import React, { useState } from "react";
import { Users, Calendar } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";

export function RoomCard({ room, onBook }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
      <div className="relative overflow-hidden h-56">
        <ImageWithFallback
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0F172A] px-3 py-1 rounded-full text-sm">
          ${room.price}/night
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
          {room.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{room.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Users className="w-3 h-3" /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onBook({ room, checkIn, checkOut, guests })}
        >
          Book Room
        </Button>
      </div>
    </div>
  );
}
