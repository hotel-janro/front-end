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
    amenities: ["King-size bed", "Work desk", "WiFi", "AC", "TV"],
    image: "https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzI0NDEzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    _id: "family",
    name: "Family Suite",
    price: 10000,
    description: " Designed for families, featuring Twin & Double Beds, a play area, kid-friendly amenities and Balcony,perfect for a relaxing stay ",
    availableRooms: 2,
    amenities: ["Two bedrooms", "Play area", "Kid-friendly amenities", "Connecting rooms", "WiFi", "AC"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    _id: "honeymoon",
    name: "Honeymoon Suite",
    price: 7500,
    description: "Experience luxury and romance in our Honeymoon Suite, specially Designed for couples to enjoy a comfortable and memorable stay with elegant interiors and relaxing facilities. ",
    availableRooms: 2,
    amenities: ["Private pool", "Candlelit dining", "Rose petal turndown", "Couples spa", "WiFi", "AC"],
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
            // Find all backend entries matching this room type by name
            const backendRoomsOfType = response.data.filter(r =>
              r.name?.toLowerCase().trim() === designRoom.name?.toLowerCase().trim()
            );

            // Get the first backend room to use its real MongoDB _id
            const firstBackendRoom = backendRoomsOfType[0];

            // Use backend availability if available, otherwise fall back to design default
            const backendAvailable = backendRoomsOfType.reduce((sum, r) => sum + (r.availableRooms || 0), 0);

            return {
              ...designRoom,
              _id: firstBackendRoom?._id || designRoom._id,
              price: firstBackendRoom?.price || designRoom.price,
              amenities: firstBackendRoom?.amenities || designRoom.amenities,
              availableRooms: firstBackendRoom ? backendAvailable : designRoom.availableRooms
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
