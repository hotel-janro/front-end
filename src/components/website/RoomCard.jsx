// RoomCard.jsx - Room Card Component (Pure JavaScript)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

const getRoomOptionPrice = (roomName, isAc, stayMode) => {
  const norm = (roomName || '').toLowerCase().replace(/[^a-z]/g, '');
  const isFamily = norm.includes('family');
  const isHoneymoon = norm.includes('honeymoon') || norm.includes('wedding');

  if (isFamily) {
    if (isAc) {
      return stayMode === 'onlyNight' ? 6750 : 8750;
    } else {
      return stayMode === 'onlyNight' ? 5500 : 6750;
    }
  } else if (isHoneymoon) {
    if (stayMode === 'onlyDay') return 9500;
    if (stayMode === 'onlyNight') return 14000;
    return 17000;
  } else {
    // Standard Room
    if (isAc) {
      if (stayMode === 'onlyDay') return 6000;
      if (stayMode === 'onlyNight') return 5500;
      return 8500; // 24 hours
    } else {
      if (stayMode === 'onlyDay') return 4000;
      if (stayMode === 'onlyNight') return 4500;
      return 7500; // 24 hours
    }
  }
};

const HONEYMOON_DECORATION_ITEMS = [
  { name: "Rose petals on bed", price: 2500 },
  { name: "Flower bouquet", price: 3000 },
  { name: "Scented candles", price: 1500 },
  { name: "Heart balloon setup", price: 1000 },
  { name: "Chocolate gift box", price: 2500 }
];

export function RoomCard({ room, acVariants = null, onBook, isLoggedIn = false }) {
  const navigate = useNavigate();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInType, setCheckInType] = useState("Day");
  const [checkOutType, setCheckOutType] = useState("Day");
  const [stayMode, setStayMode] = useState("onlyDay"); // onlyDay, onlyNight, custom
  const isStandardRoom = (room.name || "").toLowerCase().includes("standard");
  const isFamilySuite = (room.name || "").toLowerCase().includes("family");
  const isHoneymoonSuite = (room.name || "").toLowerCase().includes("honeymoon") || (room.name || "").toLowerCase().includes("wedding couple");
  const hideCheckoutFields = isHoneymoonSuite;

  // AC/Non-AC variant selector (only for merged Standard Room cards)
  const hasAcVariants = !!acVariants && (acVariants.ac || acVariants.nonAc);
  const defaultAcType = acVariants?.ac ? "ac" : "nonAc";
  const [selectedAcType, setSelectedAcType] = useState(defaultAcType);
  const activeVariantRoom = hasAcVariants
    ? (selectedAcType === "ac" ? acVariants.ac : acVariants.nonAc) || room
    : room;

  const isAc = hasAcVariants
    ? selectedAcType === "ac"
    : !(activeVariantRoom.name || "").toLowerCase().includes("non");

  // Determine indexes for validation and slots calculation
  const getStartIndex = () => {
    if (!checkIn) return 0;
    const start = new Date(checkIn);
    return (Math.floor(start.getTime() / (1000 * 60 * 60 * 24)) * 2) + (checkInType === "Night" ? 1 : 0);
  };

  const getEndIndex = () => {
    if (!checkOut) return 0;
    const end = new Date(checkOut);
    return (Math.floor(end.getTime() / (1000 * 60 * 60 * 24)) * 2) + (checkOutType === "Night" ? -1 : 0);
  };

  const startIndex = getStartIndex();
  const endIndex = getEndIndex();
  const isDateRangeInvalid = stayMode === "custom" && checkIn && checkOut && (endIndex < startIndex);

  const calculateSlots = () => {
    if (!checkIn || !checkOut) return 1;
    if (isHoneymoonSuite) return 1;
    // Single-period stays are always exactly 1 slot
    if (stayMode === "onlyDay" || stayMode === "onlyNight") return 1;
    // Custom multi-day calculation
    return Math.max(1, endIndex - startIndex + 1);
  };

  // When stayMode is custom: initially, if checkIn/checkOut is not set or range is invalid,
  // we display ONLY DAY price, and slots = 1.
  // Otherwise, we calculate custom price and calculate correct slots.
  const hasSelectedAllCustomDates = stayMode === "custom" && checkIn && checkOut && !isDateRangeInvalid;

  const getCalculatedStayMode = () => {
    if (stayMode === "custom" && hasSelectedAllCustomDates) {
      const calculatedSlots = calculateSlots();
      if (calculatedSlots === 1) {
        if (checkInType === "Night" && checkOutType === "Night") {
          return "onlyNight";
        } else {
          return "onlyDay";
        }
      }
      return "custom";
    }
    return "onlyDay";
  };

  const displayRoomPrice = getRoomOptionPrice(
    activeVariantRoom.name,
    isAc,
    stayMode === "custom" ? getCalculatedStayMode() : stayMode
  );

  const [selectedGuests, setSelectedGuests] = useState(1);
  const [selectedDecorations, setSelectedDecorations] = useState([]);
  const guests = (isStandardRoom || isFamilySuite)
    ? selectedGuests
    : isHoneymoonSuite ? 2 : (room.defaultGuests ?? 1);
  const { settings } = useSettings();
  const formattedPrice = Number(getRoomOptionPrice(activeVariantRoom.name, isAc, "custom") || 0).toLocaleString("en-LK");
  const todayStr = new Date().toISOString().split("T")[0];

  const getNextDay = (dateStr) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const toggleDecoration = (itemName) => {
    setSelectedDecorations((prev) =>
      prev.includes(itemName) ? prev.filter((value) => value !== itemName) : [...prev, itemName]
    );
  };

  const decorationTotal = selectedDecorations.reduce((sum, itemName) => {
    const item = HONEYMOON_DECORATION_ITEMS.find(i => i.name === itemName);
    return sum + (item ? item.price : 0);
  }, 0);

  const slots = hasSelectedAllCustomDates ? calculateSlots() : 1;
  const grandTotal = isHoneymoonSuite
    ? (Number(getRoomOptionPrice(activeVariantRoom.name, isAc, "custom") || 0) + decorationTotal)
    : (Number(displayRoomPrice || 0) * slots) + decorationTotal;

  const handleSubmitBooking = () => {
    setNameError("");
    setEmailError("");
    setPhoneError("");

    let isValid = true;

    if (!fullName || fullName.trim() === "") {
      setNameError("Please enter the guest's full name.");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === "") {
      setEmailError("Please enter the guest's email address.");
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!phone || phone.trim() === "") {
      setPhoneError("Please enter your phone number.");
      isValid = false;
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        setPhoneError("Please enter a valid 10-digit phone number.");
        isValid = false;
      }
    }

    if (!isValid) return;

    if (!checkIn) {
      alert("Please select a check-in date.");
      return;
    }
    if (!hideCheckoutFields && !checkOut) {
      alert("Please select a check-out date.");
      return;
    }
    if (isDateRangeInvalid) {
      alert("Check-out date/time cannot be before check-in date/time.");
      return;
    }

    onBook({
      room: activeVariantRoom,
      roomId: activeVariantRoom._id || activeVariantRoom.id,
      checkIn,
      checkOut: hideCheckoutFields ? (checkIn || todayStr) : checkOut,
      checkInType,
      checkOutType: hideCheckoutFields ? checkInType : checkOutType,
      stayMode,
      checkInDate: checkIn,
      checkOutDate: hideCheckoutFields ? (checkIn || todayStr) : checkOut,
      guests,
      fullName,
      email,
      phone,
      specialRequests: activeVariantRoom._isVirtualNonAc
        ? (specialRequests ? `${specialRequests} (Requested Room Option: Non-AC Room)` : "(Requested Room Option: Non-AC Room)")
        : (activeVariantRoom._isVirtualAc
            ? (specialRequests ? `${specialRequests} (Requested Room Option: AC Room)` : "(Requested Room Option: AC Room)")
            : specialRequests),
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
        const isStaff = userData.role === "receptionist" || userData.role === "reception" || userData.role === "admin";
        if (!isStaff) {
          setFullName(userData.name || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || "");
        } else {
          setFullName("");
          setEmail("");
          setPhone("");
        }
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
          {activeVariantRoom.availableRooms ?? 0} {Number(activeVariantRoom.availableRooms) === 1 ? "room" : "rooms"} available
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
          {room.name}
        </h3>

        <p className="text-gray-500 text-sm mb-4">{activeVariantRoom.description || room.description}</p>

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

              {/* AC / Non-AC selector — first field inside booking form */}
              {hasAcVariants && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2 font-semibold uppercase tracking-wider">Room Type</label>
                  <div className="flex gap-2">
                    {acVariants.ac && (
                      <button
                        type="button"
                        onClick={() => setSelectedAcType("ac")}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          selectedAcType === "ac"
                            ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        }`}
                      >
                        ❄️ AC Room
                      </button>
                    )}
                    {acVariants.nonAc && (
                      <button
                        type="button"
                        onClick={() => setSelectedAcType("nonAc")}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          selectedAcType === "nonAc"
                            ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        }`}
                      >
                        🌀 Non-AC Room
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 block mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setNameError(""); }}
                  placeholder="John Doe"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] ${nameError ? 'border-red-500' : 'border-gray-200'}`}
                />
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="john@example.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] ${emailError ? 'border-red-500' : 'border-gray-200'}`}
                />
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder="0771234567"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] ${phoneError ? 'border-red-500' : 'border-gray-200'}`}
                />
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
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
                    if (hideCheckoutFields) {
                      setCheckOut(newDate);
                    }
                    if (stayMode === "onlyDay") {
                      setCheckOut(newDate);
                    } else if (stayMode === "onlyNight") {
                      setCheckOut(getNextDay(newDate));
                    } else if (stayMode === "custom") {
                      if (!checkOut || checkOut < newDate) {
                        setCheckOut(newDate);
                      }
                      if (checkOut === newDate || !checkOut || checkOut < newDate) {
                        setCheckOutType("Day");
                      }
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
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center ${stayMode === "onlyDay" ? "bg-white text-[#D4AF37] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <span>{isHoneymoonSuite ? "ROOM ONLY" : "ONLY DAY"}</span>
                    <span className="text-[8px] opacity-75 mt-0.5">
                      {isHoneymoonSuite ? "Rs. 9,500" : "9AM - 4PM"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStayMode("onlyNight");
                      setCheckInType("Night");
                      setCheckOutType("Night");
                      if (checkIn) setCheckOut(getNextDay(checkIn));
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center ${stayMode === "onlyNight" ? "bg-white text-[#D4AF37] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <span>{isHoneymoonSuite ? "HALF BOARD" : "ONLY NIGHT"}</span>
                    <span className="text-[8px] opacity-75 mt-0.5">
                      {isHoneymoonSuite ? "Rs. 14,000" : "6PM - 8AM"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStayMode("custom");
                      setCheckInType("Day");
                      setCheckOutType("Night");
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center ${stayMode === "custom" ? "bg-white text-[#D4AF37] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <span>{isHoneymoonSuite ? "FULL BOARD" : "CUSTOM"}</span>
                    {isHoneymoonSuite && (
                      <span className="text-[8px] opacity-75 mt-0.5">Rs. 17,000</span>
                    )}
                  </button>
                </div>
              </div>

              {hideCheckoutFields ? (
                <div>
                  <label className="text-xs text-gray-500 block mb-1 font-semibold">Check-in Time</label>
                  <select
                    value={checkInType}
                    onChange={(e) => setCheckInType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Day">Day (9AM)</option>
                    <option value="Night">Night (6PM)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Check-out Date {stayMode === "custom" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    readOnly={stayMode !== "custom"}
                    onChange={(e) => {
                      if (stayMode === "custom") {
                        const newOutDate = e.target.value;
                        setCheckOut(newOutDate);
                        if (newOutDate === checkIn) {
                          setCheckOutType("Day");
                        }
                      }
                    }}
                    className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none ${
                      stayMode !== "custom"
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-[#F8FAFC] focus:border-[#D4AF37]"
                    }`}
                  />
                </div>
              )}

              {!hideCheckoutFields && stayMode === "custom" && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Check-in</label>
                    <select
                      value={checkInType}
                      onChange={(e) => setCheckInType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Day">Day (9AM)</option>
                      <option value="Night">Night (6PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1 font-semibold">Check-out</label>
                    <select
                      value={checkOutType}
                      onChange={(e) => setCheckOutType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Day">Day (4PM)</option>
                      {checkOut !== checkIn && (
                        <option value="Night">Night (8AM)</option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {isDateRangeInvalid && (
                <div className="text-red-600 text-xs font-bold bg-red-50 border border-red-100 rounded-lg p-2.5 animate-in fade-in duration-300">
                  ⚠️ Check-out date/time cannot be before check-in date/time.
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

              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Included Amenities</label>
                  <p className="text-xs text-[#0F172A] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    {Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities}
                  </p>
                </div>
              )}

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
