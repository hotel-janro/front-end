// Events.jsx - Wedding & Events Page (Pure JavaScript)
import React, { useEffect, useMemo, useState } from "react";
import { EventCard } from "../../components/website/EventCard.jsx";
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

export function Events({ onBook }) {
  const [activeTab, setActiveTab] = useState("halls");
  const [selectedDate, setSelectedDate] = useState("");
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("idle"); // idle, loading, success
  const [bookingForm, setBookingForm] = useState({
    guests: "",
    eventType: "Wedding",
    notes: "",
    contactPhone: ""
  });

  const handleOpenBooking = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
    setBookingStatus("idle");
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
      setBookingStatus("success");
      if (onBook) {
        onBook({
          hall: selectedVenue,
          eventDate: selectedDate,
          ...bookingForm
        });
      }
    }, 2000);
  };

  const currentData = activeTab === "halls" ? HALLS : AREAS;

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
      <div className="bg-[#0F172A] py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-[10px] font-bold mb-4 animate-in fade-in slide-in-from-bottom duration-700">Premier Venues</p>
        <h1 className="text-5xl md:text-6xl text-white font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
          Weddings & Events
        </h1>
        <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-sm px-4">
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

        {/* Availability Checker */}
        <div className="bg-white rounded-[2rem] p-8 mb-16 shadow-xl shadow-[#0F172A]/5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0F172A]">Check Venue Availability</h3>
            <p className="text-xs text-gray-500">Plan your perfect date by verifying our schedule in real-time.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
              />
            </div>
            
            {selectedDate && (
              <div className="flex items-center gap-3">
                {isLoadingAvailability ? (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/5 px-4 py-2 rounded-lg border border-[#D4AF37]/20">
                    <div className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : availabilityError ? (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    Error Loading
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                    <Sparkles className="w-3 h-3" />
                    Live Schedule
                  </div>
                )}
              </div>
            )}
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
                  
                  <form onSubmit={handleConfirmBooking} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Estimated Guests
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 150"
                          value={bookingForm.guests}
                          onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <Info className="w-3.5 h-3.5 text-[#D4AF37]" /> Event Type
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                          value={bookingForm.eventType}
                          onChange={(e) => setBookingForm({...bookingForm, eventType: e.target.value})}
                        >
                          <option>Wedding</option>
                          <option>Engagement</option>
                          <option>Corporate Gala</option>
                          <option>Private Party</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={bookingForm.contactPhone}
                        onChange={(e) => setBookingForm({...bookingForm, contactPhone: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        Special Requirements
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Catering needs, decor preferences, etc."
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={bookingStatus === "loading" || !selectedDate}
                        className="w-full bg-[#0F172A] text-[#D4AF37] py-4 rounded-2xl font-bold hover:bg-[#1E293B] transition-all shadow-xl shadow-[#0F172A]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                      >
                        {bookingStatus === "loading" ? (
                          <>
                            <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                            Processing Reservation...
                          </>
                        ) : (
                          <>
                            Confirm Venue Booking
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
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Assistance Section */}
        <div className="bg-[#0F172A] rounded-[3rem] p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="relative z-10">
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-[9px] font-bold mb-4">Dedicated Support</p>
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>Need Help Planning Your Event?</h3>
            <p className="text-gray-400 mb-10 max-w-md mx-auto text-sm">
              Our expert event planners are here to assist you with every detail, from site tours to custom arrangements.
            </p>
            <button className="bg-[#D4AF37] text-[#0F172A] px-10 py-4 rounded-2xl font-bold hover:bg-[#B8962D] transition-all shadow-xl shadow-[#D4AF37]/10 cursor-pointer">
              Contact Event Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
