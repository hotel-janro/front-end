// Contact.jsx - Contact Page (Pure JavaScript)
import React, { useState } from "react";
import { Button } from "../../components/common/Button.jsx";
import { Phone, Mail, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { apiFetch } from "../../api";

export function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setErrorMsg("");
    setSubmitted(false);

    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(form)
      });

      if (res.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setErrorMsg(res.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please check your internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Get In Touch</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Contact Us
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          We'd love to hear from you. Reach out to us anytime.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
              Send Us a Message
            </h2>
            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                Thank you! Your message has been sent successfully.
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-semibold">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
                <input type="text" required disabled={isSending} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
                <input type="email" required disabled={isSending} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Message</label>
                <textarea required rows={5} disabled={isSending} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-[#F8FAFC] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none disabled:opacity-50" />
              </div>
              <Button type="submit" variant="secondary" className="w-full flex items-center justify-center gap-2" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-[#0F172A] mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                Contact Information
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Phone, label: "Phone", value:settings.phone },
                  { icon: Mail, label: "Email", value: settings.email },
                  { icon: MapPin, label: "Address", value: settings.address },
                  { icon: Clock, label: "Front Desk", value: "24/7 Available" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{item.label}</p>
                      <p className="text-[#0F172A] text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <iframe
                title={`${settings.hotelName} Location`}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.4160097785643!2d80.0418666!3d6.950317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae255ae1245d795%3A0x36b7963848f72f34!2sHotel+Janro!5e0!3m2!1sen!2slk!4v1720000000000!5m2!1sen!2slk"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[280px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
