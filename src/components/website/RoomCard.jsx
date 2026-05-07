// RoomCard.jsx - Room Card Component (Pure JavaScript)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

const HONEYMOON_DECORATION_ITEMS = [
  { name: "Rose petals on bed", price: 2500 },
  { name: "Flower bouquet", price: 3000 },
  { name: "Scented candles", price: 1500 },
  { name: "Heart balloon setup", price: 1000 },
  { name: "Chocolate gift box", price: 2500 }
];

export function RoomCard({ room, onBook, isLoggedIn = false }) {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInType, setCheckInType] = useState("Day");
  const [checkOutType, setCheckOutType] = useState("Night");
  const [stayMode, setStayMode] = useState("custom"); // custom, onlyDay, onlyNight
  const isStandardRoom = room.name.toLowerCase().includes("standard");
  const isFamilySuite = room.name.toLowerCase().includes("family");
  const isHoneymoonSuite = room.name.toLowerCase().includes("honeymoon");
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const guests = (isStandardRoom || isFamilySuite)
    ? selectedGuests
    : isHoneymoonSuite ? 2 : (room.defaultGuests ?? 1);
  const { settings } = useSettings();
  const formattedPrice = Number(room.price || 0).toLocaleString("en-LK");
  const todayStr = new Date().toISOString().split("T")[0];

  const toggleDecoration = (itemName) => {
    setSelectedDecorations((prev) =>
      prev.includes(itemName) ? prev.filter((value) => value !== itemName) : [...prev, itemName]
    );
  };

  const decorationTotal = selectedDecorations.reduce((sum, itemName) => {
    const item = HONEYMOON_DECORATION_ITEMS.find(i => i.name === itemName);
    return sum + (item ? item.price : 0);
  }, 0);

  const calculateSlots = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const startIndex = (Math.floor(start.getTime() / (1000 * 60 * 60 * 24)) * 2) + (checkInType === "Night" ? 1 : 0);
    const endIndex = (Math.floor(end.getTime() / (1000 * 60 * 60 * 24)) * 2) + (checkOutType === "Night" ? 1 : 0);
    return Math.max(1, endIndex - startIndex + 1);
  };

  const slots = calculateSlots();
  const grandTotal = (Number(room.price || 0) * slots) + decorationTotal;

  const handleSubmitBooking = () => {
    if (!checkIn) {
      alert("Please select a check-in date.");
      return;
    }
    if (!checkOut) {
      alert("Please select a check-out date.");
      return;
    }
    if (!phone || phone.trim() === "") {
      alert("Please enter your phone number to proceed with the booking.");
      return;
    }

    onBook({
      room,
      roomId: room._id || room.id,
      checkIn,
      checkOut,
      checkInType,
      checkOutType,
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

    const savedUser = localStorage.getItem("janro_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setFullName(userData.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
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
          {settings.currency.symbol} {formattedPrice}
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
                <label className="text-xs text-gray-500 block mb-1">Phone <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Check-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setCheckIn(newDate);
                    // Auto-sync check-out if in single-day mode
                    if (stayMode !== "custom") {
                      setCheckOut(newDate);
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Check-out Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setCheckOut(newDate);
                    // If multi-day selected, force Custom mode
                    if (newDate !== checkIn && checkIn !== "") {
                      setStayMode("custom");
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2 font-semibold uppercase tracking-wider">Stay Type</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setStayMode("onlyDay");
                      setCheckInType("Day");
                      setCheckOutType("Day");
                      if (checkIn) setCheckOut(checkIn);
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${stayMode === "onlyDay" ? "bg-white text-[#D4AF37] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    ONLY DAY
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStayMode("onlyNight");
                      setCheckInType("Night");
                      setCheckOutType("Night");
                      if (checkIn) setCheckOut(checkIn);
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${stayMode === "onlyNight" ? "bg-white text-[#D4AF37] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    ONLY NIGHT
                  </button>
                  <button
                    type="button"
                    disabled={checkIn === checkOut && checkIn !== ""}
                    onClick={() => setStayMode("custom")}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${stayMode === "custom" ? "bg-white text-[#D4AF37] shadow-sm" : (checkIn === checkOut && checkIn !== "" ? "text-gray-400 opacity-50 cursor-not-allowed" : "text-gray-500 hover:text-gray-700")}`}
                  >
                    CUSTOM
                  </button>
                </div>
              </div>

              {stayMode === "custom" && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Check-in</label>
                    <select
                      value={checkInType}
                      onChange={(e) => setCheckInType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Check-out</label>
                    <select
                      value={checkOutType}
                      onChange={(e) => setCheckOutType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Day">Day</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                </div>
              )}

              {!isHoneymoonSuite && (
                (isStandardRoom || isFamilySuite) ? (
                  <div>
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3" /> Guests
                    </label>
                    <select
                      value={selectedGuests}
                      onChange={(e) => setSelectedGuests(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                    >
                      {Array.from({ length: isFamilySuite ? 4 : 2 }, (_, i) => i + 1).map((n) => (
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
                )
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
                    Custom romantic decorations (Added to total)
                  </label>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-[#F8FAFC] p-3">
                    {HONEYMOON_DECORATION_ITEMS.map((item) => (
                      <label key={item.name} className="flex items-center justify-between text-sm text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDecorations.includes(item.name)}
                            onChange={() => toggleDecoration(item.name)}
                            className="h-4 w-4 accent-[#D4AF37]"
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#D4AF37]">
                          +Rs. {item.price.toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t-2 border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Amount</p>
                  <p className="text-[10px] text-[#D4AF37] font-bold">
                    {slots > 0 ? `(${slots} ${slots === 1 ? 'slot' : 'slots'} total)` : ""}
                  </p>
                </div>
                <p className="text-2xl font-black text-[#0F172A]">
                  Rs. {grandTotal.toLocaleString()}
                </p>
              </div>
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
