import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Users, 
  Clock, 
  Hotel, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  ChevronRight, 
  Info,
  ShieldCheck,
  Camera,
  Music,
  Cake,
  Lightbulb,
  Flower2
} from "lucide-react";
import { apiFetch } from "../../api";
import { toast } from "sonner";

const HALLS = [
  { id: "661234567890123456789012", name: "Royal Grand Hall", capacity: 450, price: 15000, description: "Magnificent Grand Ballroom" },
  { id: "661234567890123456789013", name: "Garden Celebration Hall", capacity: 300, price: 10000, description: "Indoor-outdoor Garden style" },
  { id: "661234567890123456789014", name: "Pearl Banquet Hall", capacity: 200, price: 8000, description: "Stylish intimate venue" }
];

const PACKAGES = [
  { 
    name: "Silver", 
    price: 30, 
    features: ["Standard 3-Course Buffet", "Welcome Drink", "Standard Tables & Chairs", "Service Staff"] 
  },
  { 
    name: "Gold", 
    price: 50, 
    features: ["Premium 5-Course Buffet", "Welcome Drinks & Appetizers", "Luxury Table Setup", "Event Coordinator"] 
  },
  { 
    name: "Platinum", 
    price: 80, 
    features: ["International Grand Buffet", "Premium Bar Service", "Elite Floral Decor", "Dedicated Event Manager"] 
  }
];

const OPTIONAL_SERVICES = [
  { name: "Decorations", price: 500, icon: Sparkles },
  { name: "DJ/Music", price: 300, icon: Music },
  { name: "Photography", price: 600, icon: Camera },
  { name: "Videography", price: 700, icon: Camera },
  { name: "Wedding Cake", price: 200, icon: Cake },
  { name: "Lighting System", price: 250, icon: Lightbulb },
  { name: "Flower Arrangements", price: 400, icon: Flower2 }
];

export function WeddingBooking({ user }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    eventType: "Wedding",
    eventDate: "",
    startTime: "08:00",
    endTime: "14:00",
    guestCount: 50,
    hallId: "",
    packageType: "Silver",
    optionalServices: [],
    specialRequests: "",
    seatingStyle: "Banquet",
    isAgreedToTerms: false
  });

  const [pricing, setPricing] = useState({
    hallFee: 0,
    cateringTotal: 0,
    servicesTotal: 0,
    estimatedTotal: 0,
    depositRequired: 0
  });

  // Pre-fill user data when context is ready
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || ""
      }));
    }
  }, [user]);

  // Real-time Calculation
  useEffect(() => {
    const selectedHall = HALLS.find(h => h.id === formData.hallId);
    const selectedPackage = PACKAGES.find(p => p.name === formData.packageType);
    
    const hallFee = selectedHall?.price || 0;
    const cateringTotal = (selectedPackage?.price || 0) * Number(formData.guestCount);
    
    const servicesTotal = formData.optionalServices.reduce((acc, serviceName) => {
      const service = OPTIONAL_SERVICES.find(s => s.name === serviceName);
      return acc + (service?.price || 0);
    }, 0);

    const estimatedTotal = hallFee + cateringTotal + servicesTotal;
    const depositRequired = estimatedTotal * 0.2;

    setPricing({
      hallFee,
      cateringTotal,
      servicesTotal,
      estimatedTotal,
      depositRequired
    });
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceToggle = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      optionalServices: prev.optionalServices.includes(serviceName)
        ? prev.optionalServices.filter(s => s !== serviceName)
        : [...prev.optionalServices, serviceName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if hall is selected
    if (!formData.hallId) {
      toast.error("Please select a Wedding Hall");
      return;
    }

    // Check capacity
    const selectedHall = HALLS.find(h => h.id === formData.hallId);
    if (formData.guestCount > selectedHall.capacity) {
      toast.error(`Guest count exceeds ${selectedHall.name} capacity (${selectedHall.capacity})`);
      return;
    }

    if (!formData.isAgreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/wedding/bookings", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (response.success) {
        toast.success("Booking request submitted successfully!");
        // Reset or Redirect
      } else {
        toast.error(response.message || "Failed to submit booking");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* Premium Hero Header */}
      <div className="relative h-[40vh] bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury Wedding" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        
        <div className="relative z-10 text-center px-4 animate-in fade-in zoom-in duration-1000">
          <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-[10px] font-black mb-4">Elite Event Planning</p>
          <h1 className="text-4xl md:text-6xl text-white font-normal mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
            Reserve Your <span className="italic text-[#D4AF37]">Grand</span> Moment
          </h1>
          <div className="w-24 h-px bg-[#D4AF37]/50 mx-auto" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section 1: Guest Information */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Event Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                  <input 
                    type="text" name="name" value={formData.name} readOnly
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email" name="email" value={formData.email} readOnly
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input 
                    type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Event Type</label>
                  <select 
                    name="eventType" value={formData.eventType} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                  >
                    <option value="Wedding">Wedding Ceremony</option>
                    <option value="Engagement">Engagement Party</option>
                    <option value="Reception">Wedding Reception</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Timing & Capacity */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Timing & Capacity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Event Date</label>
                  <input 
                    type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Expected Guest Count</label>
                  <input 
                    type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} min="1"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start Time</label>
                  <input 
                    type="time" name="startTime" value={formData.startTime} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">End Time</label>
                  <input 
                    type="time" name="endTime" value={formData.endTime} onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hall Selection */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Hotel className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Exquisite Venues</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HALLS.map((hall) => (
                  <label key={hall.id} className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${formData.hallId === hall.id ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input 
                      type="radio" name="hallId" value={hall.id} 
                      onChange={handleInputChange} className="hidden" 
                    />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Venue</p>
                      <p className="font-bold text-[#0F172A] mb-2">{hall.name}</p>
                      <p className="text-[10px] text-slate-400">Capacity: {hall.capacity}</p>
                      <p className="text-sm font-bold text-[#D4AF37] mt-3">${hall.price.toLocaleString()}</p>
                    </div>
                    {formData.hallId === hall.id && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#D4AF37]" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 4: Catering Packages */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Catering Packages</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACKAGES.map((pkg) => (
                  <label key={pkg.name} className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${formData.packageType === pkg.name ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input 
                      type="radio" name="packageType" value={pkg.name} 
                      onChange={handleInputChange} className="hidden" 
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">Elite Menu</p>
                    <p className="text-xl font-bold text-[#0F172A] mb-4">{pkg.name}</p>
                    <div className="space-y-2 mb-6">
                      {pkg.features.map(f => (
                        <div key={f} className="flex items-start gap-2 text-[10px] text-slate-500 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-lg font-bold text-[#0F172A] border-t border-slate-100 pt-4">${pkg.price} <span className="text-[10px] text-slate-400">/ guest</span></p>
                    {formData.packageType === pkg.name && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#D4AF37]" />}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 5: Optional Services */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Tailored Services</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {OPTIONAL_SERVICES.map((service) => {
                  const Icon = service.icon;
                  const isSelected = formData.optionalServices.includes(service.name);
                  return (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => handleServiceToggle(service.name)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-[#0F172A]' : 'text-slate-500'}`}>{service.name}</span>
                      <span className="text-[10px] font-black text-[#D4AF37]">${service.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Special Requests */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-[#0F172A]/5 border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#0F172A] text-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A]">Special Requests</h3>
              </div>
              
              <textarea 
                name="specialRequests" value={formData.specialRequests} onChange={handleInputChange}
                rows="4" placeholder="Any specific requirements or traditions we should be aware of?"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Right Sidebar: Booking Summary */}
          <div className="space-y-6">
            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
              <h3 className="text-[#D4AF37] text-xl font-normal mb-8" style={{ fontFamily: "DM Serif Display, serif" }}>Booking Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Hall Fee</span>
                  <span className="text-white font-bold">${pricing.hallFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Catering ({formData.packageType})</span>
                  <span className="text-white font-bold">${pricing.cateringTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Optional Services</span>
                  <span className="text-white font-bold">${pricing.servicesTotal.toLocaleString()}</span>
                </div>
                <div className="w-full h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-[#D4AF37] font-black uppercase tracking-[0.2em] text-[10px]">Estimated Total</span>
                  <span className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>${pricing.estimatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl mt-4">
                  <div>
                    <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest">Required Deposit</p>
                    <p className="text-xs text-white opacity-60">20% to confirm</p>
                  </div>
                  <span className="text-lg text-white font-bold">${pricing.depositRequired.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" name="isAgreedToTerms" checked={formData.isAgreedToTerms} onChange={handleInputChange}
                    className="mt-1 accent-[#D4AF37]" 
                  />
                  <span className="text-[10px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    I agree to the Hotel Janro <span className="text-[#D4AF37] underline">Booking Policy</span> and cancellation terms.
                  </span>
                </label>
                
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-[#D4AF37] text-[#0F172A] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#B8962D] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#D4AF37]/10 disabled:opacity-50"
                >
                  {loading ? <CheckCircle2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Confirm Booking
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20">
              <div className="flex items-center gap-3 text-slate-900 font-bold text-sm mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Secure Reservation
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Your reservation is encrypted and protected. Our events team will contact you within 24 hours to finalize details.
              </p>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
