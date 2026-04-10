// RoomCard.jsx - Room Card Component (Pure JavaScript)
import React, { useState } from "react";
import { Users, Calendar } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";

const HONEYMOON_DECORATION_ITEMS = [
  "Rose petals on bed",
  "Flower bouquet",
  "Scented candles",
  "Heart balloon setup",
  "Chocolate gift box"
];

export function RoomCard({ room, onBook, isLoggedIn = false }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const isStandardRoom = room.name === "Standard Room";
  const isHoneymoonSuite = room.name.toLowerCase().includes("honeymoon");
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const guests = isStandardRoom ? selectedGuests : room.defaultGuests ?? 1;
  const formattedPrice = Number(room.price || 0).toLocaleString("en-LK");

  const toggleDecoration = (item) => {
    setSelectedDecorations((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
      <div className="relative overflow-hidden h-56">
        <ImageWithFallback
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0F172A] px-3 py-1 rounded-full text-sm">
          Rs. {formattedPrice}/night
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
          {isStandardRoom ? (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Users className="w-3 h-3" /> Guests
              </label>
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Users className="w-3 h-3" /> Occupancy
              </label>
              <p className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] text-[#0F172A]">
                {room.occupancyText ?? `${guests} ${guests === 1 ? "Guest" : "Guests"}`}
              </p>
            </div>
          )}
          <p className="text-xs text-[#0F172A] bg-[#F8FAFC] border border-gray-200 rounded-lg px-3 py-2">
            Available rooms: {room.availableRooms ?? "N/A"}
          </p>

          {isHoneymoonSuite && isLoggedIn && (
            <div>
              <label className="text-xs text-gray-500 block mb-2">
                Complimentary romantic decorations
              </label>
              <div className="space-y-2 rounded-lg border border-gray-200 bg-[#F8FAFC] p-3">
                {HONEYMOON_DECORATION_ITEMS.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-[#0F172A]">
                    <input
                      type="checkbox"
                      checked={selectedDecorations.includes(item)}
                      onChange={() => toggleDecoration(item)}
                      className="h-4 w-4 accent-[#D4AF37]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() =>
            onBook({
              room,
              checkIn,
              checkOut,
              guests,
              decorationItems: isHoneymoonSuite && isLoggedIn ? selectedDecorations : []
            })
          }
        >
          Book Room
        </Button>
      </div>
    </div>
  );
}
