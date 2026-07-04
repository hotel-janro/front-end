// Events.jsx - Wedding & Events Page (Dynamic)
import React, { useEffect, useMemo, useState } from "react";
import { useSettings } from "../../context/SettingsContext.jsx";
import { apiFetch } from "../../api.js";
import { EventCard } from "../../components/website/EventCard.jsx";
import { Calendar, Hotel, Heart, MapPin, Users, Sparkles, X, CheckCircle, Info, ChevronRight, Loader2, Award, Check } from "lucide-react";

const menuDetails = {
  welcomeDrink: ["Orange Juice", "Mango Juice", "Mix Fruit Juice"],
  soup: ["Chicken Soup", "Vegetable Soup", "Egg Soup (Select One)"],
  rice: ["Steam Basmathi Rice", "Yellow Rice", "Chicken Fried Rice", "Vegetable Noodles (Select Three)"],
  chicken: ["Chicken Red Curry", "Chilli Chicken", "Spicy Chicken Badum", "Chicken Kuruma (Select One)"],
  fish: ["Fish Talapath Red Curry", "Fish Peppered Curry", "Fish Ambultiyal", "Fish Masala (Select One)"],
  vegetables: ["Tempered Potato & Potato Curry", "Brinjal Capsicum & Tomato Moju or Pahi", "Tempered Dhal or Dhal Fry", "Garlic Green Beans", "Tempered Mushroom with Kunisso", "Cashew & Green Peas Curry (Select Four)"],
  salad: ["Tomato, Onion or Green Chilli Salad", "Cucumber Curd with Salad", "Mix Vegetable Salad", "Salada Kola (Select Four)"],
  condiments: ["Dry Fish", "Sinhala Achcharu", "Mango Chutney", "Chilli Paste", "Tomato Sauce", "Papadam", "Dry Chilly (All Included)"],
  desserts: ["Cream Orange Caramel", "Watalappam", "Fresh Fruits Salad", "Fresh Fruit Cuts (Papaya, Pineapple, Banana, Watermelon)", "Rainbow Jelly (Red & Green)", "Custard Pudding (Select Four)"]
};

export function Events() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState("halls");
  const [hallsList, setHallsList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [packageTab, setPackageTab] = useState("wedding");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallsRes, packagesRes] = await Promise.all([
          apiFetch("/wedding/halls"),
          apiFetch("/wedding/packages")
        ]);
        if (hallsRes.success && Array.isArray(hallsRes.data)) {
          // Normalize hallName to name for frontend EventCard component mapping
          const normalized = hallsRes.data.map(h => ({
            ...h,
            id: h._id,
            name: h.hallName
          }));
          setHallsList(normalized);
        }
        if (packagesRes.success && Array.isArray(packagesRes.data)) {
          setPackagesList(packagesRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch wedding and event details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const weddingPackages = useMemo(() => {
    return packagesList.filter(p => p.type === 'wedding');
  }, [packagesList]);

  const eventPackages = useMemo(() => {
    return packagesList.filter(p => p.type === 'event');
  }, [packagesList]);

  const currentData = useMemo(() => {
    return hallsList.filter(hall => {
      const type = (hall.type || "").toLowerCase();
      if (activeTab === "halls") {
        return type === "hall";
      } else {
        return type === "event area" || type === "area";
      }
    });
  }, [hallsList, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Premier Venues</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Weddings & Events
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto px-4">
          Discover a collection of grand ballrooms and scenic outdoor areas designed to host your most prestigious celebrations with unparalleled luxury.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl shadow-[#0F172A]/10 border border-white flex items-center gap-2">
            <button
              onClick={() => setActiveTab("halls")}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${
                activeTab === "halls"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-xl shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Hotel className="w-4 h-4" />
              Grand Halls
            </button>
            <button
              onClick={() => setActiveTab("areas")}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer ${
                activeTab === "areas"
                  ? "bg-[#0F172A] text-[#D4AF37] shadow-xl shadow-[#0F172A]/20"
                  : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Outdoor Areas
            </button>
          </div>
        </div>

        {/* Venue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
          {currentData.map((hall) => (
            <EventCard
              key={hall.id}
              hall={hall}
            />
          ))}
        </div>

        {/* Packages Section */}
        <div className="mb-32">
          <div className="text-center mb-10">
            <Heart className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <h2 className="text-3xl md:text-4xl text-[#0F172A] font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
              Exclusive Packages & Menus
            </h2>
            <p className="text-gray-500 mt-2">Tailored pricing packages designed to make your event absolutely flawless.</p>
          </div>

          {/* Sub-tab Selector */}
          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => setPackageTab("wedding")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                packageTab === "wedding"
                  ? "bg-[#D4AF37] border-[#D4AF37] text-[#0F172A] shadow-md shadow-[#D4AF37]/10"
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              }`}
            >
              Wedding Packages
            </button>
            <button
              onClick={() => setPackageTab("event")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                packageTab === "event"
                  ? "bg-[#D4AF37] border-[#D4AF37] text-[#0F172A] shadow-md shadow-[#D4AF37]/10"
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              }`}
            >
              Other Event Packages
            </button>
          </div>

          {packageTab === "wedding" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-in fade-in duration-300">
              {weddingPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                    pkg.popular 
                      ? "border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5 scale-105 z-10" 
                      : "border-gray-100 hover:border-gray-300 shadow-md"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0F172A] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Most Popular
                    </span>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-[#0F172A]">Rs. {pkg.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm">/ per plate</span>
                    </div>

                    <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6 bg-[#D4AF37]/5 p-3 rounded-xl border border-[#D4AF37]/10 text-center">
                      {pkg.bites}
                    </p>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">Included Services:</p>
                      {pkg.inclusions.slice(0, 8).map((inc, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{inc}</span>
                        </div>
                      ))}
                      {pkg.inclusions.length > 8 && (
                        <p className="text-xs text-[#D4AF37] font-semibold pl-6">+ And {pkg.inclusions.length - 8} more premium custom services</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsMenuModalOpen(true)}
                      className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-gray-100"
                    >
                      View Menu Details
                    </button>
                    <a 
                      href="#inquiry" 
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block w-full py-4 text-center rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                        pkg.popular 
                          ? "bg-[#D4AF37] text-[#0F172A] hover:bg-[#B8962D] shadow-lg shadow-[#D4AF37]/20" 
                          : "bg-[#0F172A] text-white hover:bg-slate-800"
                      }`}
                    >
                      Inquire For Booking
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch animate-in fade-in duration-300">
              {eventPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                    pkg.popular 
                      ? "border-[#D4AF37] shadow-xl shadow-[#D4AF37]/5 scale-105 z-10" 
                      : "border-gray-100 hover:border-gray-300 shadow-md"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0F172A] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Best Selection
                    </span>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-[#0F172A]">Rs. {pkg.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm">/ per plate</span>
                    </div>

                    <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6 bg-[#D4AF37]/5 p-3 rounded-xl border border-[#D4AF37]/10 text-center">
                      {pkg.bites}
                    </p>

                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">Menu Inclusions:</p>
                      {pkg.inclusions.map((inc, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a 
                      href="#inquiry" 
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`block w-full py-4 text-center rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                        pkg.popular 
                          ? "bg-[#D4AF37] text-[#0F172A] hover:bg-[#B8962D] shadow-lg shadow-[#D4AF37]/20" 
                          : "bg-[#0F172A] text-white hover:bg-slate-800"
                      }`}
                    >
                      Inquire For Booking
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry Section */}
        <div id="inquiry" className="bg-white rounded-[3rem] p-12 md:p-20 mb-32 shadow-2xl shadow-[#0F172A]/5 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
             <Hotel className="w-full h-full text-[#0F172A] -rotate-12 transform translate-x-1/4" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-4xl font-bold text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                Plan Your Event with Our Specialists
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Every event at {settings.hotelName} is tailored to your unique vision. Our dedicated events team is here to assist you with hall tours, custom catering menus, and technical requirements.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Capacity Consultation</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Custom Decor Themes</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-center w-full md:w-auto shadow-2xl">
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Direct Reservations</p>
              <h4 className="text-white text-2xl font-bold mb-2">Speak with us</h4>
              <p className="text-gray-400 text-sm mb-8">Available 9:00 AM - 8:00 PM</p>
              <a 
                href={`tel:${settings.phone}`} 
                className="block w-full bg-[#D4AF37] text-[#0F172A] py-5 px-10 rounded-2xl font-bold text-lg hover:bg-[#B8962D] transition-all mb-4 shadow-xl shadow-[#D4AF37]/10"
              >
                {settings.phone}
              </a>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="w-full bg-white/5 text-white py-5 px-10 rounded-2xl font-bold text-sm hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Send an Inquiry <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Detail Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-[#0F172A] p-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.05] pointer-events-none">
                <Sparkles className="w-full h-full text-white" />
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>Wedding Banquet Menu Options</h3>
                <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">Special Package Customizations</p>
              </div>
              <button 
                onClick={() => setIsMenuModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all z-10 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#F8FAFC]">
              {/* Welcome Drink & Soup */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🍹 Welcome Drinks</h4>
                <ul className="space-y-2">
                  {menuDetails.welcomeDrink.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mt-6 mb-4 border-b pb-2 border-slate-100">🍲 Soups</h4>
                <ul className="space-y-2">
                  {menuDetails.soup.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rice & Noodles */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🍚 Rice & Noodles</h4>
                <ul className="space-y-2">
                  {menuDetails.rice.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Meat & Seafood */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🍗 Chicken Selection</h4>
                <ul className="space-y-2 mb-6">
                  {menuDetails.chicken.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🐟 Fish Selection</h4>
                <ul className="space-y-2">
                  {menuDetails.fish.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vegetables */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🥗 Vegetables & Salads</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-2">VEGETABLES:</p>
                    <ul className="space-y-2">
                      {menuDetails.vegetables.map((item, idx) => (
                        <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-2">SALADS:</p>
                    <ul className="space-y-2">
                      {menuDetails.salad.map((item, idx) => (
                        <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Condiments */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🌶️ Condiments Platter</h4>
                <ul className="space-y-2">
                  {menuDetails.condiments.map((item, idx) => (
                    <li key={idx} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desserts */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 lg:col-span-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 border-slate-100">🍰 Desserts selection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {menuDetails.desserts.map((item, idx) => (
                    <div key={idx} className="text-gray-600 text-xs flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 text-center shrink-0">
              <p className="text-xs text-gray-500">
                * Note: Menu items can be fully customized or swapped depending on your preferences. Speak to our event manager.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
