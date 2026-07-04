// MyBookings.jsx - Premium Customer Reservations Dashboard
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Bed, 
  Heart,
  DollarSign,
  ArrowUpRight,
  Star,
  X,
  Edit2
} from "lucide-react";
import { apiFetch, getImageUrl } from "../../../api.js";
import { useSettings } from "../../../context/SettingsContext.jsx";
import { generateInvoicePDF } from "../../../utils/invoiceGenerator.js";
import "./CustomerDashboard.css";

const getRoomTypeName = (roomName, roomNumberStr) => {
  if (!roomName) return 'Refined Luxury Suite';
  const lower = roomName.toLowerCase();
  if (lower.includes('non-ac standard room') || lower.includes('non ac standard room')) {
    return 'Standard Room (Non-AC)';
  }
  if (lower.includes('ac standard room') || lower.includes('a/c standard room')) {
    return 'Standard Room (AC)';
  }
  if (lower.includes('standard room') && roomNumberStr) {
    const match = String(roomNumberStr).match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return `Standard Room ${num >= 5 ? '(AC)' : '(Non-AC)'}`;
    }
  }
  return roomName;
};

export function MyBookings() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState({ rooms: [], weddings: [] });
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    guests: 1,
    specialRequests: "",
    decorationItems: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, weddingsRes] = await Promise.all([
        apiFetch("/bookings/my"),
        apiFetch("/wedding/my-bookings")
      ]);

      const mappedRooms = (roomsRes?.data || []).map((item) => {
        const checkInDate = new Date(item.checkInDate);
        const checkOutDate = new Date(item.checkOutDate);
        const nights = Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())
          ? item.nights || 1
          : Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          ...item,
          id: item._id,
          roomName: getRoomTypeName(item.room?.name, item.roomNumber),
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          checkIn: checkInDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          checkOut: checkOutDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: item.status || item.bookingStatus || "pending",
          amount: item.totalPrice || item.totalAmount || item.amount || 0,
          nights,
          image: item.room?.image
            ? getImageUrl(item.room.image)
            : "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400"
        };
      });

      const mappedWeddings = (weddingsRes?.data || []).map((item) => {
        const eventDate = new Date(item.eventDate);

        return {
          ...item,
          id: item._id,
          hallName: item.hallId?.hallName || item.eventType || "Grand Ballroom",
          eventDate: item.eventDate,
          eventDateLabel: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          package: item.cateringPackage || "Custom Package",
          status: item.bookingStatus || item.status || "pending",
          amount: item.totalAmount || item.amount || 0,
          image: item.hallId?.image
            ? getImageUrl(item.hallId.image)
            : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400"
        };
      });

      setBookings({
        rooms: mappedRooms,
        weddings: mappedWeddings
      });
    } catch (error) {
      console.error("Error fetching my bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await apiFetch(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH'
      });
      alert("Booking cancelled successfully!");
      fetchData();
    } catch (error) {
      alert("Error cancelling booking: " + error.message);
    }
  };

  const handleOpenEditModal = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      fullName: booking.fullName || "",
      phone: booking.phone || "",
      guests: booking.guests || 1,
      specialRequests: booking.specialRequests || "",
      decorationItems: booking.decorationItems || []
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/bookings/${editingBooking._id}`, {
        method: "PUT",
        body: JSON.stringify(editForm)
      });
      alert("Booking updated successfully!");
      setEditingBooking(null);
      fetchData();
    } catch (error) {
      alert("Error updating booking: " + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      confirmed: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    };
    const s = String(status || 'pending').toLowerCase();
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[s] || styles.pending}`}>
        {s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  const currentData = activeTab === "rooms" ? bookings.rooms : bookings.weddings;

  const stats = [
    {
      label: "Room Nights",
      value: String(bookings.rooms.reduce((s, b) => s + (b.nights || 1), 0)),
      note: "Upcoming Stays",
      Icon: Bed,
      card: "bg-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    },
    {
      label: "Events Planned",
      value: String(bookings.weddings.filter(w => w.status !== 'cancelled' && w.status !== 'rejected').length).padStart(2, '0'),
      note: "Grand Celebrations",
      Icon: Heart,
      card: "bg-rose-50 border-rose-200",
      icon: "bg-rose-100 text-rose-600",
      text: "text-rose-700",
    },
    {
      label: "Total Value",
      value: `Rs. ${(bookings.rooms.reduce((s, b) => s + (b.totalPrice || 0), 0) + bookings.weddings.reduce((s, b) => s + (b.totalAmount || 0), 0)).toLocaleString()}`,
      note: "Total Bookings",
      Icon: DollarSign,
      card: "bg-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700",
    },
    {
      label: "Loyalty Tier",
      value: "Gold",
      note: "Elite Member",
      Icon: Star,
      card: "bg-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-8 mt-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-12 shadow-2xl border border-white/5">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-full blur-[100px] -mr-20 -mt-20" />
          <div className="absolute left-0 bottom-0 h-1/2 w-1/2 bg-[#D4AF37]/5 rounded-full blur-[120px] -ml-20 -mb-20" />
          
          <div className="relative z-10">
            <p className="text-[#D4AF37] font-black uppercase tracking-[0.4em] text-[10px] mb-4 opacity-80">Supreme Reservations</p>
            <h2 className="text-4xl md:text-5xl font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Your <span className="italic text-[#D4AF37]">Exquisite</span> Stays
            </h2>
            <p className="mt-4 text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
              Manage your future escapes and grand events with ease. 
              We are preparing for your arrival with unparalleled luxury.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("rooms")}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'rooms' ? 'bg-[#D4AF37] text-[#0F172A] shadow-xl shadow-[#D4AF37]/20 scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                <Bed className="h-4 w-4" />
                Hotel Stays
              </button>
              <button
                onClick={() => setActiveTab("weddings")}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'weddings' ? 'bg-[#D4AF37] text-[#0F172A] shadow-xl shadow-[#D4AF37]/20 scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                <Heart className="h-4 w-4" />
                Wedding Events
              </button>
            </div>
          </div>
        </section>


        <section className="grid grid-cols-1 gap-8">
          <article className="customer-panel rounded-[2.5rem]">
            <header className="customer-panel-header flex items-center justify-between p-8">
              <h3 className="customer-panel-title">
                <span className="customer-panel-icon bg-amber-100 text-amber-600">
                  <Calendar className="h-5 w-5" />
                </span>
                {activeTab === "rooms" ? "Upcoming Hotel Stays" : "Wedding & Event Bookings"}
              </h3>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentData.length} Results</span>
              </div>
            </header>

            <div className="divide-y divide-slate-50">
              {currentData.length === 0 ? (
                <div className="p-20 text-center text-slate-300 italic">No reservations found in this category</div>
              ) : (
                currentData.map((item) => {
                    const isRoomBooking = activeTab === "rooms";
                    const id = item.id || item._id;
                    const bookingStatus = String(item.status || item.bookingStatus || "pending").toLowerCase();
                    const checkInDateObj = isRoomBooking ? new Date(item.checkInDate) : new Date(item.eventDate);
                  const diffTime = checkInDateObj.getTime() - Date.now();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const canModify = isRoomBooking && diffDays >= 3 && bookingStatus !== 'cancelled';
                    const title = isRoomBooking ? (item.roomName || item.room?.name || "Premium Room") : (item.hallName || item.hallId?.hallName || "Exquisite Venue");
                    const subtitle = isRoomBooking
                      ? `In: ${new Date(item.checkInDate).toLocaleDateString()} (${item.checkInType || 'Day'})`
                      : `Event: ${new Date(item.eventDate).toLocaleDateString()}`;
                    const durationLabel = isRoomBooking
                      ? `Out: ${new Date(item.checkOutDate).toLocaleDateString()} (${item.checkOutType || 'Night'})`
                      : `Package: ${item.package || item.cateringPackage || 'Custom'}`;
                    const amount = Number(item.amount || item.totalPrice || item.totalAmount || 0);
                    const image = item.image || (isRoomBooking
                      ? "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400"
                      : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400");

                    return (
                      <div key={id} className="p-8 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-slate-50/50 transition-all duration-500">
                        <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden shadow-lg border border-white relative">
                          <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Resort" />
                          <div className="absolute top-3 left-3">
                            {getStatusBadge(bookingStatus)}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Elite Reservation</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                              {title}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              REF: #{String(id).length === 24 ? String(id).slice(-8).toUpperCase() : String(id)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-[#D4AF37]" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {subtitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-[#D4AF37]" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {durationLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-6 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-2xl font-black text-slate-900">Rs. {amount.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {isRoomBooking ? (
                              <>
                                {canModify ? (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditModal(item)}
                                      className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                      title="Edit Booking"
                                    >
                                      <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleCancelBooking(item._id || item.id)}
                                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Cancel Booking"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                    {bookingStatus === 'cancelled' ? 'Cancelled' : 'Locked (Starts < 3 Days)'}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                Contact Concierge to modify
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </article>
        </section>


      </main>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
            <header className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
              <h3 className="font-semibold text-lg text-white">Modify Reservation</h3>
              <button 
                onClick={() => setEditingBooking(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </header>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Guest Name</label>
                <input 
                  type="text" 
                  value={editForm.fullName} 
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Guests Count</label>
                <select 
                  value={editForm.guests}
                  onChange={(e) => setEditForm({ ...editForm, guests: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm font-semibold"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {String(editingBooking.room?.name || '').toLowerCase().includes('honeymoon') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Add-on Decorations</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                    {['Roses petals', 'Chocolates', 'Champagne', 'Ballon decorations'].map(item => {
                      const isChecked = editForm.decorationItems.includes(item);
                      return (
                        <label key={item} className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({ ...editForm, decorationItems: [...editForm.decorationItems, item] });
                              } else {
                                setEditForm({ ...editForm, decorationItems: editForm.decorationItems.filter(i => i !== item) });
                              }
                            }}
                            className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                          {item}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Special Requests</label>
                <textarea 
                  value={editForm.specialRequests} 
                  onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#0F172A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
