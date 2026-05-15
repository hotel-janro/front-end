// Rooms.jsx - Rooms Page (Pure JavaScript)
import React, { useState, useEffect } from "react";
import { RoomCard } from "../../components/website/RoomCard.jsx";
import { apiFetch } from "../../api";

export function Rooms({ onBook, isLoggedIn = false }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiFetch("/rooms");
        if (response.success && response?.data) {
          // Sort rooms by a specific predefined order
          const preferredOrder = ['Standard Room', 'Family Suite', 'Honeymoon Suite'];
          
          const sortedRooms = (response.data || []).sort((a, b) => {
            const indexA = preferredOrder.indexOf(a.name);
            const indexB = preferredOrder.indexOf(b.name);
            
            // If name not in list, put it at the end
            const finalIndexA = indexA === -1 ? 99 : indexA;
            const finalIndexB = indexB === -1 ? 99 : indexB;
            
            return finalIndexA - finalIndexB;
          });

          setRooms(sortedRooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
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
