// Events.jsx - Wedding & Events Page (Pure JavaScript)
import React, { useEffect, useMemo, useState } from "react";
import { EventCard } from "../../components/website/EventCard.jsx";

const HALLS = [
  {
    id: 1,
    name: "Royal Grand Hall",
    capacity: 450,
    price: 15000,
    location: "Main Building, Level 2",
    description: "Our magnificent Grand Ballroom is perfect for lavish weddings and gala events with crystal chandeliers and marble floors.",
    image: "https://images.unsplash.com/photo-1759519238029-689e99c6d19e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYWxscm9vbSUyMHdlZGRpbmclMjB2ZW51ZXxlbnwxfHx8fDE3NzI0ODIyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "Garden Celebration Hall",
    capacity: 300,
    price: 10000,
    location: "Garden Wing, Ground Level",
    description: "Elegant indoor-outdoor style venue surrounded by landscaped gardens, ideal for receptions and wedding ceremonies.",
    image: "https://images.unsplash.com/photo-1764471444363-e6dc0f9773bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwaGFsbCUyMGNvcnBvcmF0ZSUyMGV2ZW50fGVufDF8fHx8MTc3MjQ4MjI2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    name: "Pearl Banquet Hall",
    capacity: 200,
    price: 8000,
    location: "East Wing, Level 1",
    description: "A stylish medium-sized banquet hall designed for intimate weddings, engagement functions, and private events.",
    image: "https://images.unsplash.com/photo-1762216444919-043cf813e4de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwYXJ0eSUyMG91dGRvb3IlMjBldmVudCUyMHZlbnVlfGVufDF8fHx8MTc3MjQ4MjI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function Events({ onBook }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    // Reset availability when there is no selected date.
    if (!selectedDate) {
      setAvailabilityMap({});
      setAvailabilityError("");
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(
          `${apiBaseUrl}/api/wedding/halls/availability?date=${encodeURIComponent(selectedDate)}`
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch hall availability");
        }

        // Index availability by hallName to connect backend data with UI cards.
        const nextAvailabilityMap = {};
        (result.data || []).forEach((hall) => {
          nextAvailabilityMap[hall.hallName] = {
            isAvailable: hall.isAvailable,
            reason: hall.reason || ""
          };
        });

        setAvailabilityMap(nextAvailabilityMap);
      } catch (error) {
        setAvailabilityMap({});
        setAvailabilityError(error.message || "Unable to load hall availability");
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate]);

  const hallsWithAvailability = useMemo(
    () =>
      HALLS.map((hall) => ({
        ...hall,
        ...(availabilityMap[hall.name] || {})
      })),
    [availabilityMap]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Celebrations</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Weddings & Events
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Create unforgettable memories in our stunning event venues, tailored for every occasion.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white">
          <label className="text-sm text-gray-600 block mb-2">Select event date to check availability</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-80 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
          />
          {isLoadingAvailability && (
            <p className="text-sm text-gray-500 mt-2">Checking hall availability...</p>
          )}
          {availabilityError && (
            <p className="text-sm text-red-600 mt-2">{availabilityError}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hallsWithAvailability.map((hall) => (
            <EventCard
              key={hall.id}
              hall={hall}
              onBook={onBook}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
