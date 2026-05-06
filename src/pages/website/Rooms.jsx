// Rooms.jsx - Rooms Page (Pure JavaScript)
import React, { useState, useEffect } from "react";
import { RoomCard } from "../../components/website/RoomCard.jsx";
import { apiFetch } from "../../api";

const ORIGINAL_DESIGN = [
  {
    _id: "standard",
    name: "Standard Room",
    price: 5000,
    description: "Comfortable and elegant, our Standard Room features a king-size bed, work desk, and modern amenities for a pleasant stay.",
    availableRooms: 6,
    image: "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzI0NDEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    _id: "family",
    name: "Family Suite",
    price: 10000,
    description: "Designed for families, featuring two bedrooms, a play area, kid-friendly amenities, and connecting rooms. ",
    availableRooms: 2,
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    _id: "honeymoon",
    name: "Honeymoon Suite",
    price: 15000,
    description: "A romantic escape with private pool, candlelit dining setup, rose petal turndown, and couples spa treatment.",
    availableRooms: 2,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export function Rooms({ onBook, isLoggedIn = false }) {
  const [rooms, setRooms] = useState(ORIGINAL_DESIGN);

  useEffect(() => {
    const syncCounts = async () => {
      try {
        const response = await apiFetch("/rooms");
        if (response.success && response.data && response.data.length > 0) {
          // Update ONLY the counts in our original design
          const updatedRooms = ORIGINAL_DESIGN.map(designRoom => {
            // Find all backend entries for this type
            const backendRoomsOfType = response.data.filter(r => r.name === designRoom.name);
            const backendTotal = backendRoomsOfType.reduce((sum, r) => sum + (r.availableRooms || 0), 0);
            
            // Get the first available backend room ID to use for booking
            const firstBackendRoom = backendRoomsOfType[0];

            // Total = Original Design (6, 2, 2) + Admin Additions
            return {
              ...designRoom,
              // Use backend ID if available, otherwise keep the design ID
              _id: firstBackendRoom?._id || designRoom._id,
              availableRooms: designRoom.availableRooms + backendTotal
            };
          });
          setRooms(updatedRooms);
        }
      } catch (error) {
        console.error("Using default counts due to fetch error:", error);
      }
    };
    syncCounts();
  }, []);

  const handleRoomBook = (bookingData) => {
    const roomId = bookingData?.room?._id;
    if (!roomId) {
      onBook?.(bookingData);
      return;
    }

    const selectedRoom = rooms.find((room) => room._id === roomId);
    if (!selectedRoom) {
      onBook?.(bookingData);
      return;
    }

    if (selectedRoom.availableRooms <= 0) {
      alert("Sorry, this room type is fully booked.");
      return;
    }

    const updatedRoom = {
      ...selectedRoom,
      availableRooms: selectedRoom.availableRooms - 1,
    };

    setRooms((prevRooms) =>
      prevRooms.map((room) => (room._id === roomId ? updatedRoom : room))
    );

    onBook?.({
      ...bookingData,
      room: updatedRoom,
    });
  };

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
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} onBook={handleRoomBook} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      </div>
    </div>
  );
}
