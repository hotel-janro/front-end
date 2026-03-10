// Rooms.jsx - Rooms Page (Pure JavaScript)
import React from "react";
import { RoomCard } from "../../components/website/RoomCard.jsx";

const ROOMS = [
  {
    id: 1,
    name: "Standard Room",
    price: 150,
    description: "Comfortable and elegant, our Standard Room features a king-size bed, work desk, and modern amenities for a pleasant stay.",
    image: "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzI0NDEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "Deluxe Ocean View",
    price: 250,
    description: "Wake up to stunning ocean views in our Deluxe room with a private balcony, premium linens, and spa-inspired bathroom.",
    image: "https://images.unsplash.com/photo-1708920326697-b219695c89ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHJvb20lMjBvY2VhbiUyMHZpZXd8ZW58MXx8fHwxNzcyNDgyMjY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    name: "Royal Suite",
    price: 350,
    description: "Spacious and luxurious, the Royal Suite offers a living area, dining space, premium minibar, and butler service.",
    image: "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBob3RlbCUyMHBlbnRob3VzZSUyMHJvb218ZW58MXx8fHwxNzcyNDgyMjc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 4,
    name: "Presidential Penthouse",
    price: 750,
    description: "The ultimate luxury experience with panoramic views, private terrace, jacuzzi, and 24/7 personal concierge.",
    image: "https://images.unsplash.com/photo-1762421028657-347de51e7707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yJTIwbmlnaHR8ZW58MXx8fHwxNzcyNDQyMDI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 5,
    name: "Family Suite",
    price: 400,
    description: "Designed for families, featuring two bedrooms, a play area, kid-friendly amenities, and connecting rooms.",
    image: "https://images.unsplash.com/photo-1677763856232-d9eb9e127e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHJlbGF4YXRpb24lMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NzI0ODIyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 6,
    name: "Honeymoon Villa",
    price: 550,
    description: "A romantic escape with private pool, candlelit dining setup, rose petal turndown, and couples spa treatment.",
    image: "https://images.unsplash.com/photo-1743525922686-badbeac16a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN3aW1taW5nJTIwcG9vbCUyMHRyb3BpY2FsfGVufDF8fHx8MTc3MjQ4MjI2OXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function Rooms({ onBook }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Accommodations</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Rooms & Suites
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Choose from our collection of elegantly appointed rooms and suites, each designed for ultimate comfort.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} onBook={onBook} />
          ))}
        </div>
      </div>
    </div>
  );
}
