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
  Star
} from "lucide-react";
import "./CustomerDashboard.css";

export function MyBookings() {
  const [activeTab, setActiveTab] = useState("rooms");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState({ rooms: [], weddings: [] });
  const [now] = useState(new Date());

  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setBookings({
        rooms: [
          {
            id: "BK-1001",
            roomName: "Deluxe Ocean Suite",
            checkIn: "2026-06-15",
            checkOut: "2026-06-18",
            status: "confirmed",
            amount: 450.0,
            image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400"
          }
        ],
        weddings: [
          {
            id: "WB-2002",
            hallName: "Grand Ballroom",
            eventDate: "2026-12-20",
            package: "Premium Gold",
            status: "pending",
            amount: 2500.0,
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400"
          }
        ],
      });
      setLoading(false);
    }, 800);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.pending}`}>
        {status}
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
      value: "03",
      note: "Upcoming Stays",
      Icon: Bed,
      card: "bg-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    },
    {
      label: "Events Planned",
      value: String(bookings.weddings.length),
      note: "Grand Celebrations",
      Icon: Heart,
      card: "bg-rose-50 border-rose-200",
      icon: "bg-rose-100 text-rose-600",
      text: "text-rose-700",
    },
    {
      label: "Total Value",
      value: `$${(bookings.rooms.reduce((s, b) => s + b.amount, 0) + bookings.weddings.reduce((s, b) => s + b.amount, 0)).toLocaleString()}`,
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

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <article key={stat.label} className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-xl shadow-slate-200/20 transition-all hover:-translate-y-2 duration-500">
                <div className="flex flex-col items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</h3>
                  </div>
                </div>
              </article>
            );
          })}
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
                currentData.map((item) => (
                  <div key={item.id} className="p-8 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-slate-50/50 transition-all duration-500">
                    {/* Image Box */}
                    <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden shadow-lg border border-white relative">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Resort" />
                      <div className="absolute top-3 left-3">
                         {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Elite Reservation</p>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {activeTab === "rooms" ? item.roomName : item.hallName}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">REF: #{item.id}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {activeTab === "rooms" ? `In: ${item.checkIn}` : `Date: ${item.eventDate}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {activeTab === "rooms" ? `Out: ${item.checkOut}` : `Package: ${item.package}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-6 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-slate-900">${item.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="h-5 w-5" />
                         </button>
                         <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-xl shadow-[#0F172A]/10">
                            Details
                            <ChevronRight className="h-4 w-4" />
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        {/* Assistance Card */}
        <section className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/20">
           <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-[#D4AF37]" />
           </div>
           <h3 className="text-3xl font-normal text-slate-900 mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>Need Assistance?</h3>
           <p className="text-slate-500 max-w-md mx-auto text-sm font-medium leading-relaxed mb-8">
             Our dedicated guest services team is available 24/7 to ensure your stay exceeds every expectation.
           </p>
           <button className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[10px] border-b-2 border-[#D4AF37] pb-1 hover:text-slate-900 hover:border-slate-900 transition-all">
             Contact Concierge
           </button>
        </section>
      </main>
    </div>
  );
}
