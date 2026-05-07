// RoomCard.jsx - Room Card Component (Pure JavaScript)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

const HONEYMOON_DECORATION_ITEMS = [
  "Rose petals on bed",
  "Flower bouquet",
  "Scented candles",
  "Heart balloon setup",
  "Chocolate gift box"
];

export function RoomCard({ room, onBook, isLoggedIn = false }) {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const isStandardRoom = room.name === "Standard Room";
  const isHoneymoonSuite = room.name.toLowerCase().includes("honeymoon");
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const guests = isStandardRoom ? selectedGuests : room.defaultGuests ?? 1;
  const { settings } = useSettings();
  const formattedPrice = Number(room.price || 0).toLocaleString("en-LK");

  const toggleDecoration = (item) => {
    setSelectedDecorations((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    );
  };

  const handleSubmitBooking = () => {
    onBook({
      room,
      roomId: room._id || room.id,
      checkIn,
      checkInTime,
      checkOut,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      fullName,
      email,
      phone,
      specialRequests,
      decorationItems: isHoneymoonSuite && isLoggedIn ? selectedDecorations : []
    });
  };

  const handleBookNowClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setShowBookingForm(true);
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
          {settings.currency.symbol} {formattedPrice}/night
        </div>
        <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0F172A] shadow-sm">
          {room.availableRooms ?? 0} {Number(room.availableRooms) === 1 ? "room" : "rooms"} available
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
          {room.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{room.description}</p>

        {!showBookingForm ? (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleBookNowClick}
          >
            Book Now
          </Button>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Check-in Date
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
                    <Calendar className="w-3 h-3" /> Check-in Time
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
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
                    <Users className="w-3 h-3" /> Guests
                  </label>
                  <p className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] text-[#0F172A]">
                    {room.occupancyText ?? `${guests} ${guests === 1 ? "Guest" : "Guests"}`}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Late check-in"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

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

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBookingForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleSubmitBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
