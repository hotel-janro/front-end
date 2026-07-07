// Home.jsx - Home Page (Pure JavaScript)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button.jsx";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import {
  Bed, Car, UtensilsCrossed, Waves, Star,
  ArrowRight, Quote, Dumbbell,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext.jsx";
import { apiFetch } from "../../api";

const DeliveryBikeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="19" cy="17.5" r="2.5" />
    <circle cx="5" cy="17.5" r="2.5" />
    <path d="M7.5 17.5h9" />
    <path d="M5 15l2-5h4l1.5 3H19" />
    <path d="M11 10V7h3" />
    <rect x="9" y="4" width="6" height="3" rx="1" />
  </svg>
);

const HERO_IMG = "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783022207/hotel_janro/hotel_hero.jpg";
const ROOM_IMG = "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzI0NDEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080";
const ROOM_IMG2 = "https://images.unsplash.com/photo-1708920326697-b219695c89ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHJvb20lMjBvY2VhbiUyMHZpZXd8ZW58MXx8fHwxNzcyNDgyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080";
const ROOM_IMG3 = "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBob3RlbCUyMHBlbnRob3VzZSUyMHJvb218ZW58MXx8fHwxNzcyNDgyMjc1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const EVENT_IMG = "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783026236/hotel_janro/hotel_event.jpg";
const FOOD_IMG = "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783025961/hotel_janro/hotel_food.jpg";

const facilities = [
  { icon: Bed, label: "Rooms" },
  { icon: Waves, label: "Swimming Pool" },
  { icon: Car, label: "Free Parking" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Dumbbell, label: "Gym" },
  { icon: DeliveryBikeIcon, label: "Food Delivery" },
];

const testimonials = [
  { name: "Chaminda Vitharana", role: "Local Guide", text: "Excellent location for a family gathering or a day outing with friends. The dishes are tasty and in good portions. The rates are very reasonable. BYOB allowed and no corkage charges. There’s a medium size pool with plenty playing options for kids. The hotel has a large banquet hall, guest rooms and a cabana.", rating: 5 },
  { name: "Dilan Perera", role: "Regular Customer", text: "Good service. Delicious food. Very pleasant manager (Mr. Suresh), he's very skillful man with attractive customer service. Also they have well maintained beautiful garden. That place situated at greenish environment. They have 2 modern reception halls. They have their own DJ entertainer. I proof that all because I'm regular customer here.", rating: 5 },
  { name: "Shalitha Senanayaka", role: "Local Guide", text: "Nice place to spending free time or a get a relax.. highly recommended for family outing and groups. Swimming pool is bit small but its awesome. Maximum deep is 5ft. We can see small bar out there but they are not serving any alcohols.", rating: 5 },
];

export function Home() {
  const { settings } = useSettings();
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    const fetchFeaturedRooms = async () => {
      try {
        const response = await apiFetch("/rooms");
        if (response.success && response?.data) {
          // Filter out photo locations and take the first 3 rooms to feature
          const filtered = (response.data || [])
            .filter((r) => r.name.toLowerCase().replace(/[^a-z]/g, "") !== "photolocation")
            .slice(0, 3);
          setFeaturedRooms(filtered);
        }
      } catch (error) {
        console.error("Error fetching featured rooms:", error);
      }
    };
    fetchFeaturedRooms();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={HERO_IMG} alt={settings.hotelName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/70 to-[#0F172A]/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-sm mb-4">Welcome to {settings.hotelName}</p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Experience Luxury<br />
            <span className="text-[#D4AF37]">Beyond Imagination</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
            Indulge in world-class amenities, exquisite dining, and unparalleled hospitality at the most prestigious hotel & resort.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/rooms">
              <Button variant="primary" className="text-lg px-8 py-4">
                Book Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="text-lg px-8 py-4">
                Discover More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">About Us</p>
          <h2 className="text-3xl md:text-4xl text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
            A Legacy of Luxury & Elegance
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Nestled in the lush, green surroundings of Dompe, Sri Lanka, {settings.hotelName} has been the epitome of luxury hospitality for over two decades. Our commitment to excellence, attention to detail, and personalized service ensure every guest experience is nothing short of extraordinary.
          </p>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Accommodations</p>
            <h2 className="text-3xl md:text-4xl text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
              Featured Rooms & Suites
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.name} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0F172A] px-3 py-1 rounded-full text-sm">{settings.currency.symbol}{room.price}/night</div>
                </div>
                <div className="p-6">
                  <h3 className="text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>{room.name}</h3>
                  <Link to="/rooms">
                    <Button variant="ghost" className="!px-0 text-sm">
                      View Details <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/rooms"><Button variant="secondary">View All Rooms</Button></Link>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[400px]">
              <ImageWithFallback src={EVENT_IMG} alt="Wedding & Events" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 to-transparent" />
            </div>
            <div>
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Celebrations</p>
              <h2 className="text-3xl md:text-4xl text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                Weddings & Events
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Make your special day truly unforgettable at Hotel Janro's magnificent wedding venues. From intimate gatherings to grand banquets, our dedicated team ensures every detail is perfect.
              </p>
              <ul className="space-y-3 mb-8">
                {["Royal Grand Hall – Up to 300 guests", "Garden Celebration Hall – Up to 200 guests", "Pearl Banquet Hall – Up to 150 guests", "Emerald Pool Terrace – Intimate gatherings"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/events"><Button variant="secondary">Explore Venues</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Preview */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Culinary Excellence</p>
              <h2 className="text-3xl md:text-4xl text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                Fine Dining Experience
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Savor authentic Sri Lankan and international cuisines crafted by our talented kitchen team. Enjoy hearty breakfast spreads, flavourful rice & curry buffets, grilled specialties, and refreshing poolside bites — all made with fresh, locally sourced ingredients.
              </p>
              <Link to="/restaurant"><Button variant="secondary">View Menu</Button></Link>
            </div>
            <div className="order-1 lg:order-2 relative rounded-2xl overflow-hidden h-[400px]">
              <ImageWithFallback src={FOOD_IMG} alt="Fine Dining" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Amenities</p>
          <h2 className="text-3xl md:text-4xl text-white mb-12" style={{ fontFamily: "DM Serif Display, serif" }}>
            World-Class Facilities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {facilities.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                  <f.icon className="w-7 h-7 text-[#D4AF37] group-hover:text-[#0F172A] transition-colors" />
                </div>
                <span className="text-gray-300 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
              What Our Guests Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <Quote className="w-8 h-8 text-[#D4AF37]/30 mb-4" />
                <p className="text-gray-600 text-sm mb-6 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>{t.name}</p>
                <p className="text-gray-400 text-sm">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
