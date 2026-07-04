
import React from "react";
import { Link } from "react-router-dom";
import { Crown, Phone, Mail, MapPin, Facebook } from "lucide-react";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.92 1.46 5.52 3.73 7.15.2.14.32.37.32.61l.07 2.14c.01.3.32.51.59.4l2.39-.97c.18-.07.38-.05.54.05 1.49.88 3.22 1.4 5.07 1.4 5.52 0 10-4.15 10-9.26S17.52 2 12 2zm1.09 12.36l-2.58-2.75-5.03 2.75c-.35.19-.75-.17-.58-.53l5.52-11.76c.22-.47.88-.47 1.1 0l2.58 2.75 5.03-2.75c.35-.19.75.17.58.53l-5.52 11.76c-.22.47-.88.47-1.1 0z" />
  </svg>
);

import { useSettings } from "../../context/SettingsContext";

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#0F172A] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-7 h-7 text-[#D4AF37]" />
              <span className="text-xl text-white tracking-wider uppercase" style={{ fontFamily: "DM Serif Display, serif" }}>
                {settings.hotelName}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Experience unparalleled luxury and world-class hospitality at {settings.hotelName}.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/HotelJanro" },
                { Icon: WhatsAppIcon, href: "https://wa.me/94763600041" },
                { Icon: MessengerIcon, href: "https://m.me/HotelJanro" },
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all">
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4 text-[#D4AF37]">Quick Links</h3>
            {["Rooms", "Events", "Restaurant", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="block text-sm text-gray-400 hover:text-[#D4AF37] transition-colors py-1"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white mb-4 text-[#D4AF37]">Services</h3>
            {["Room Booking", "Wedding Halls", "Restaurant", "Fine Dining", "Food Delivery"].map((s) => (
              <p key={s} className="text-sm text-gray-400 py-1">{s}</p>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4 text-[#D4AF37]">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">{settings.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-sm text-gray-400">{settings.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="text-sm text-gray-400">{settings.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {settings.hotelName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
