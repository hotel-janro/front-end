// About.jsx - About Page (Pure JavaScript)
import React from "react";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import { Shield, Heart, Award, Clock, Star, Users } from "lucide-react";
import { useSettings } from "../../context/SettingsContext.jsx";


const GALLERY = [
  "https://images.unsplash.com/photo-1764148716678-40a4b8c5b812?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwZ3JhbmQlMjBlbnRyYW5jZXxlbnwxfHx8fDE3NzI0ODIyNjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzI0NDEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1743525922686-badbeac16a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN3aW1taW5nJTIwcG9vbCUyMHRyb3BpY2FsfGVufDF8fHx8MTc3MjQ4MjI2OXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1543353071-873f17a7a088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudCUyMHBsYXRlZCUyMGZvb2R8ZW58MXx8fHwxNzcyNDgyMjY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1759519238029-689e99c6d19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYWxscm9vbSUyMHdlZGRpbmclMjB2ZW51ZXxlbnwxfHx8fDE3NzI0ODIyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1677763856232-d9eb9e127e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHJlbGF4YXRpb24lMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NzI0ODIyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

const whyUs = [
  { icon: Shield, title: "Premium Quality", desc: "Every detail is meticulously crafted to exceed expectations." },
  { icon: Heart, title: "Personalized Service", desc: "Tailored experiences that cater to your unique preferences." },
  { icon: Award, title: "Award Winning", desc: "Recognized globally for excellence in hospitality." },
  { icon: Clock, title: "24/7 Concierge", desc: "Round-the-clock assistance for all your needs." },
  { icon: Star, title: "5-Star Dining", desc: "World-class culinary experiences at your fingertips." },
  { icon: Users, title: "Expert Team", desc: "Highly trained staff dedicated to your comfort." },
];

export function About() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          About {settings.hotelName}
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Two decades of unparalleled luxury and world-class hospitality.
        </p>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden h-[400px]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1762421028657-347de51e7707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yJTIwbmlnaHR8ZW58MXx8fHwxNzcyNDQyMDI5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Hotel Exterior"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Est. 2004</p>
              <h2 className="text-3xl text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                A Legacy of Elegance
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">
                Founded in 2004, {settings.hotelName} was born from a vision to create a sanctuary of luxury in the heart of Paradise City. What began as a boutique hotel has grown into a world-renowned resort that combines timeless elegance with modern sophistication.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Our founder, inspired by the grand hotels of Europe, set out to create a space where every guest feels like royalty. Today, {settings.hotelName} stands as a testament to that vision -- a place where extraordinary experiences are crafted daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>Our Mission</h3>
              <p className="text-gray-500 leading-relaxed">
                To deliver exceptional hospitality experiences that exceed expectations, creating lasting memories for every guest through personalized service, luxurious amenities, and an unwavering commitment to excellence.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#1E3A8A]" />
              </div>
              <h3 className="text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>Our Vision</h3>
              <p className="text-gray-500 leading-relaxed">
                To be recognized as the world's premier luxury hospitality brand, setting the gold standard for guest experiences while fostering sustainable practices and community engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Gallery</p>
            <h2 className="text-3xl text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
              Glimpses of {settings.hotelName}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((img, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${i === 0 ? "md:col-span-2 md:row-span-2" : ""} group`}>
                <ImageWithFallback src={img} alt={`Gallery ${i + 1}`} className="w-full h-full min-h-[200px] object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Why {settings.hotelName}</p>
            <h2 className="text-3xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
              Why Choose Us
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUs.map((item) => (
              <div key={item.title} className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 group">
                <item.icon className="w-8 h-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
