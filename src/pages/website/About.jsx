// About.jsx - About Page (Pure JavaScript)
import React from "react";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import { Shield, Heart, Award, Clock, Star, Users } from "lucide-react";
import { useSettings } from "../../context/SettingsContext.jsx";


const GALLERY = [
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023707/hotel_janro/gallery/gallery_1.jpg",
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023167/hotel_janro/gallery/gallery_2.jpg",
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023170/hotel_janro/gallery/gallery_3.jpg",
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023178/hotel_janro/gallery/gallery_4.jpg",
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023181/hotel_janro/gallery/gallery_5.jpg",
  "https://res.cloudinary.com/dhuirf8i9/image/upload/v1783023184/hotel_janro/gallery/gallery_6.jpg",
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
                src="https://res.cloudinary.com/dhuirf8i9/image/upload/v1783022622/hotel_janro/hotel_about_exterior.jpg"
                alt="Hotel Janro Exterior"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Est. 2004</p>
              <h2 className="text-3xl text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                A Legacy of Elegance
              </h2>
              <p className="text-gray-500 mb-4 leading-relaxed">
                Founded in 2004, {settings.hotelName} was born from a vision to create a sanctuary of luxury in the lush, green surroundings of Dompe, Sri Lanka. What began as a premium banquet destination has grown into a world-class resort that combines warm local hospitality with modern sophistication.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Our team sets out to create a space where every guest feels like royalty and every celebration is unforgettable. Today, {settings.hotelName} stands as a testament to that vision -- a place where extraordinary experiences are crafted daily.
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
