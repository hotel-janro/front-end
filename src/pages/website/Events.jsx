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

export function Events({ onBook, isLoggedIn, user }) {
  const [activeTab, setActiveTab] = useState("halls");
  const [selectedDate, setSelectedDate] = useState("");
  const [monthlyBookedDates, setMonthlyBookedDates] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("idle"); // idle, loading, success
  // Wedding Form State
  const [weddingForm, setWeddingForm] = useState({
    startTime: "10:00",
    endTime: "16:00",
    guests: "",
    package: "Gold",
    mealPreference: "Non-Veg",
    services: [],
    notes: ""
  });

  // Event Form State
  const [eventForm, setEventForm] = useState({
    type: "Corporate",
    duration: "4 Hours",
    guests: "",
    catering: "Buffet",
    equipment: [],
    services: [],
    notes: ""
  });

  const toggleService = (formType, service) => {
    if (formType === 'wedding') {
      const services = weddingForm.services.includes(service)
        ? weddingForm.services.filter(s => s !== service)
        : [...weddingForm.services, service];
      setWeddingForm({ ...weddingForm, services });
    } else {
      const services = eventForm.services.includes(service)
        ? eventForm.services.filter(s => s !== service)
        : [...eventForm.services, service];
      setEventForm({ ...eventForm, services });
    }
  };

  const toggleEquipment = (item) => {
    const equipment = eventForm.equipment.includes(item)
      ? eventForm.equipment.filter(e => e !== item)
      : [...eventForm.equipment, item];
    setEventForm({ ...eventForm, equipment });
  };

  const handleOpenBooking = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
    setBookingStatus("idle");
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onBook(); // This triggers redirect in AppRoutes
      return;
    }
    setBookingStatus("loading");
    
    const formData = selectedVenue.type === 'hall' ? weddingForm : eventForm;
    
    // Simulate API call
    setTimeout(() => {
      setBookingStatus("success");
      if (onBook) {
        onBook({
          hall: selectedVenue,
          eventDate: selectedDate,
          fullName: user?.name,
          email: user?.email,
          phone: user?.phone,
          ...formData
        });
      }
    }, 2000);
  };
  const currentData = activeTab === "halls" ? HALLS : AREAS;

  const handleMonthChange = async (year, month) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      // Fetch booked dates for the selected month
      const response = await fetch(`${apiBaseUrl}/api/wedding/halls/booked-dates?year=${year}&month=${month}`);
      const result = await response.json();
      if (result.success) {
        setMonthlyBookedDates(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch monthly booked dates", err);
    }
  };

  useEffect(() => {
    // Initial fetch for current month
    const now = new Date();
    handleMonthChange(now.getFullYear(), now.getMonth() + 1);
  }, []);

  useEffect(() => {
    // Reset availability when there is no selected date.
    if (!selectedDate) {
      setAvailabilityMap({});
      setAvailabilityError("");
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(
          `${apiBaseUrl}/api/wedding/halls/availability?date=${encodeURIComponent(selectedDate)}`
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch hall availability");
        }

        // Index availability by hallName to connect backend data with UI cards.
        const nextAvailabilityMap = {};
        (result.data || []).forEach((hall) => {
          nextAvailabilityMap[hall.hallName] = {
            isAvailable: hall.isAvailable,
            reason: hall.reason || ""
          };
        });

        setAvailabilityMap(nextAvailabilityMap);
      } catch (error) {
        setAvailabilityMap({});
        setAvailabilityError(error.message || "Unable to load hall availability");
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  const hallsWithAvailability = useMemo(
    () =>
      currentData.map((hall) => ({
        ...hall,
        ...(availabilityMap[hall.name] || {})
      })),
    [availabilityMap, currentData]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Premier Venues</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Weddings & Events
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Experience unparalleled luxury and dedicated service in our collection of exquisite venues, designed to host life's most precious moments.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Tab Switcher - Matching Uploaded Image Style */}
        <div className="flex justify-center mb-12">

          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl shadow-[#0F172A]/10 border border-gray-100 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("halls")}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === "halls"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Hotel className="w-4 h-4" />
              Wedding Halls
            </button>
            <button
              onClick={() => setActiveTab("areas")}
              className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === "areas"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Heart className="w-4 h-4" />
              Event Areas
            </button>
          </div>
        </div>


        {/* Availability Calendar Checker */}
        <div className="bg-white rounded-[2rem] p-8 mb-16 shadow-xl shadow-[#0F172A]/5 border border-gray-100 flex flex-col lg:flex-row lg:items-start justify-between gap-12 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="space-y-4 max-w-md">
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>Select Your Date</h3>
              <p className="text-sm text-gray-500 mt-2">Plan your perfect event by verifying our schedule. Use the calendar to find an available date.</p>
            </div>
            
            {selectedDate && (
              <div className="bg-[#0F172A] rounded-xl p-5 border border-gray-100 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Calendar className="w-24 h-24 text-[#D4AF37] transform rotate-12" />
                </div>
                <div className="relative z-10">
                  <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold mb-1">Selected Date</p>
                  <p className="text-xl text-white font-medium">
                    {new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {isLoadingAvailability ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                        <div className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                        Checking Venues...
                      </div>
                    ) : availabilityError ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        Error Loading
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Viewing Available Venues
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-auto flex-shrink-0">
             <CustomCalendar 
               selectedDate={selectedDate} 
               onDateSelect={setSelectedDate} 
               bookedDates={monthlyBookedDates}
               onMonthChange={handleMonthChange}
             />
          </div>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {hallsWithAvailability.map((hall) => (
            <EventCard
              key={hall.id}
              hall={hall}
              onBook={() => handleOpenBooking(hall)}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          ))}
        </div>

        {/* Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => bookingStatus !== "loading" && setIsModalOpen(false)}
            />
            
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
              {bookingStatus === "success" ? (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                    <CheckCircle className="w-12 h-12 text-emerald-500 animate-in zoom-in duration-700" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>Booking Confirmed!</h3>
                  <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                    Your reservation for <span className="font-bold text-[#0F172A]">{selectedVenue?.name}</span> has been received. Our team will contact you shortly to finalize the arrangements.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-[#0F172A] text-[#D4AF37] px-12 py-4 rounded-2xl font-bold hover:bg-[#1E293B] transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-[#0F172A] p-8 text-white relative">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                    <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-[9px] font-bold mb-2">Venue Reservation</p>
                    <h3 className="text-3xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>{selectedVenue?.name}</h3>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        {selectedDate || "Date not selected"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        {selectedVenue?.location}
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleConfirmBooking} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* User Information (Auto-filled) */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4 mb-6">
                      <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Guest Information</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 ml-1">Full Name</p>
                          <div className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 font-medium">
                            {user?.name || "Guest User"}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 ml-1">Email Address</p>
                          <div className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 font-medium truncate">
                            {user?.email || "N/A"}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1 ml-1">Phone Number</p>
                          <div className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 font-medium">
                            {user?.phone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedVenue?.type === 'hall' ? (
                      /* Wedding Hall Booking Form */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Guest Count</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 150"
                              value={weddingForm.guests}
                              onChange={(e) => setWeddingForm({...weddingForm, guests: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wedding Package</label>
                            <select
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                              value={weddingForm.package}
                              onChange={(e) => setWeddingForm({...weddingForm, package: e.target.value})}
                            >
                              <option>Silver Package</option>
                              <option>Gold Package</option>
                              <option>Platinum Package</option>
                              <option>Royal Suite Package</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start Time</label>
                            <input
                              type="time"
                              required
                              value={weddingForm.startTime}
                              onChange={(e) => setWeddingForm({...weddingForm, startTime: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">End Time</label>
                            <input
                              type="time"
                              required
                              value={weddingForm.endTime}
                              onChange={(e) => setWeddingForm({...weddingForm, endTime: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meal Preference</label>
                          <div className="flex gap-4">
                            {["Veg", "Non-Veg", "Jain", "Mixed"].map(meal => (
                              <button
                                key={meal}
                                type="button"
                                onClick={() => setWeddingForm({...weddingForm, mealPreference: meal})}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                                  weddingForm.mealPreference === meal
                                    ? "bg-[#0F172A] text-[#D4AF37] border-[#0F172A]"
                                    : "bg-gray-50 text-gray-400 border-gray-100 hover:border-[#D4AF37]/30"
                                }`}
                              >
                                {meal}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Additional Services</label>
                          <div className="grid grid-cols-2 gap-3">
                            {["Photography", "Full Decor", "Live Music", "DJ & Sound", "Flower Walls", "Valet Parking"].map(service => (
                              <button
                                key={service}
                                type="button"
                                onClick={() => toggleService('wedding', service)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  weddingForm.services.includes(service)
                                    ? "bg-white border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5"
                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  weddingForm.services.includes(service) ? "bg-[#D4AF37] border-[#D4AF37]" : "border-gray-200"
                                }`}>
                                  {weddingForm.services.includes(service) && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                {service}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Event Hall Booking Form */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Event Type</label>
                            <select
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                              value={eventForm.type}
                              onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                            >
                              <option>Corporate Conference</option>
                              <option>Product Launch</option>
                              <option>Birthday Celebration</option>
                              <option>Private Dinner</option>
                              <option>Networking Mixer</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Time Duration</label>
                            <select
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                              value={eventForm.duration}
                              onChange={(e) => setEventForm({...eventForm, duration: e.target.value})}
                            >
                              <option>4 Hours</option>
                              <option>8 Hours</option>
                              <option>Full Day (12h)</option>
                              <option>Multi-day</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Guest Count</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 50"
                              value={eventForm.guests}
                              onChange={(e) => setEventForm({...eventForm, guests: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catering Plan</label>
                            <select
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                              value={eventForm.catering}
                              onChange={(e) => setEventForm({...eventForm, catering: e.target.value})}
                            >
                              <option>No Catering</option>
                              <option>Coffee & Snacks</option>
                              <option>Executive Buffet</option>
                              <option>Standard Buffet</option>
                              <option>High Tea</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Technical Equipment</label>
                          <div className="grid grid-cols-2 gap-3">
                            {["HD Projector", "Wireless Mics", "Sound System", "Stage Setup", "Video Recording", "High Speed Wifi"].map(item => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleEquipment(item)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  eventForm.equipment.includes(item)
                                    ? "bg-white border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5"
                                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  eventForm.equipment.includes(item) ? "bg-[#D4AF37] border-[#D4AF37]" : "border-gray-200"
                                }`}>
                                  {eventForm.equipment.includes(item) && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Special Requirements</label>
                      <textarea
                        rows="3"
                        placeholder="Any additional needs or instructions..."
                        value={selectedVenue?.type === 'hall' ? weddingForm.notes : eventForm.notes}
                        onChange={(e) => selectedVenue?.type === 'hall' ? setWeddingForm({...weddingForm, notes: e.target.value}) : setEventForm({...eventForm, notes: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all resize-none"
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-[#D4AF37]/20 mt-8">
                       <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mb-4">Reservation Summary</p>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Selected Venue</span>
                             <span className="text-white font-medium">{selectedVenue?.name}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Guest Count</span>
                             <span className="text-white font-medium">
                                {(selectedVenue?.type === 'hall' ? weddingForm.guests : eventForm.guests) || 0} People
                             </span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="text-gray-400">Booking Type</span>
                             <span className="text-[#D4AF37] font-bold uppercase tracking-widest text-[9px]">
                                {selectedVenue?.type === 'hall' ? 'Wedding Reservation' : 'Event Booking'}
                             </span>
                          </div>
                       </div>
                       <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-sm font-bold text-white">Estimated Quote</span>
                          <span className="text-xl font-bold text-[#D4AF37]">
                             ${(selectedVenue?.price || 0).toLocaleString()}
                             <span className="text-[10px] text-gray-400 ml-1">/ session</span>
                          </span>
                       </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={bookingStatus === "loading" || !selectedDate}
                        className="w-full bg-[#D4AF37] text-[#0F172A] py-5 rounded-2xl font-bold hover:bg-[#B8962D] transition-all shadow-xl shadow-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                      >
                        {bookingStatus === "loading" ? (
                          <>
                            <div className="w-5 h-5 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
                            Processing Reservation...
                          </>
                        ) : (
                          <>
                            Confirm Booking Details
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      {!selectedDate && (
                        <p className="text-center text-[10px] text-red-500 font-bold uppercase tracking-widest mt-3">
                          Please select an event date before booking
                        </p>
                      )}
                    </div>
                  </form>                </>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
