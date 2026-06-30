// Rooms.jsx - Rooms Page (Pure JavaScript)
import React, { useState, useEffect } from "react";
import { RoomCard } from "../../components/website/RoomCard.jsx";
import { apiFetch } from "../../api";

// Flexible name helpers — strips all non-letters and lowercases before comparing
// so "A/C Room", "AC Room", "A C Room" all match "acroom"
const normalizeRoomName = (name) =>
  (name || "").toLowerCase().replace(/[^a-z]/g, "");

// Standard Room variants
const isAcRoomName     = (name) => normalizeRoomName(name) === "acroom";
const isNonAcRoomName  = (name) => normalizeRoomName(name) === "nonacroom";
const isStdRoomName    = (name) => normalizeRoomName(name) === "standardroom";

// Family Room variants  — matches "Family Room AC", "Family AC Room", "Family Room Non-AC" etc.
const isFamilyAcName   = (name) => {
  const n = normalizeRoomName(name);
  return n.includes("family") && n.includes("ac") && !n.includes("nonac") && !n.includes("nonfamily");
};
const isFamilyNonAcName = (name) => {
  const n = normalizeRoomName(name);
  return n.includes("family") && (n.includes("nonac") || (n.includes("non") && n.includes("ac")));
};
const isFamilyRoomName = (name) => {
  const n = normalizeRoomName(name);
  return n === "familyroom" || n === "familysuite";
};

const isPhotoLocName   = (name) => normalizeRoomName(name) === "photolocation";

// Is this room a variant that should be hidden (merged into a parent card)?
const isHiddenVariant = (name) =>
  isAcRoomName(name) || isNonAcRoomName(name) ||
  isStdRoomName(name) ||
  isFamilyAcName(name) || isFamilyNonAcName(name) ||
  isFamilyRoomName(name);

export function Rooms({ onBook, isLoggedIn = false, hideHeader = false }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiFetch("/rooms");
        if (response.success && response?.data) {
          // Remove photo location entries
          const filtered = (response.data || []).filter(
            (r) => !isPhotoLocName(r.name)
          );
          setRooms(filtered);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Build display list: merge AC + Non-AC into single cards per room type
  const buildDisplayRooms = () => {
    // Standard Room variants
    const acRoom    = rooms.find((r) => isAcRoomName(r.name));
    const nonAcRoom = rooms.find((r) => isNonAcRoomName(r.name));
    const stdRoom   = rooms.find((r) => isStdRoomName(r.name));

    // Family Room variants
    const familyAcRoom    = rooms.find((r) => isFamilyAcName(r.name));
    const familyNonAcRoom = rooms.find((r) => isFamilyNonAcName(r.name));
    const plainFamilyRoom = rooms.find((r) => isFamilyRoomName(r.name));

    const display = [];

    // --- Standard Room card ---
    if (acRoom || nonAcRoom) {
      const base = acRoom || nonAcRoom;
      display.push({
        ...base,
        name: "Standard Room",
        _isMergedStandard: true,
        _acVariants: { ac: acRoom || null, nonAc: nonAcRoom || null },
      });
    } else if (stdRoom) {
      const acRoomVirtual = {
        ...stdRoom,
        _isVirtualAc: true
      };
      const nonAcRoomVirtual = {
        ...stdRoom,
        price: Math.max(0, stdRoom.price - 1000), // AC premium is 1000 LKR (8500 vs 7500)
        _isVirtualNonAc: true
      };
      display.push({
        ...stdRoom,
        name: "Standard Room",
        _isMergedStandard: true,
        _acVariants: { ac: acRoomVirtual, nonAc: nonAcRoomVirtual },
      });
    }

    // --- Family Room card ---
    if (familyAcRoom || familyNonAcRoom) {
      const base = familyAcRoom || familyNonAcRoom;
      display.push({
        ...base,
        name: "Family Room",
        _isMergedStandard: true,
        _acVariants: { ac: familyAcRoom || null, nonAc: familyNonAcRoom || null },
      });
    } else if (plainFamilyRoom) {
      const acRoomVirtual = {
        ...plainFamilyRoom,
        _isVirtualAc: true
      };
      const nonAcRoomVirtual = {
        ...plainFamilyRoom,
        price: Math.max(0, plainFamilyRoom.price - 2000), // AC premium is 2000 LKR
        _isVirtualNonAc: true
      };
      display.push({
        ...plainFamilyRoom,
        name: "Family Room",
        _isMergedStandard: true,
        _acVariants: { ac: acRoomVirtual, nonAc: nonAcRoomVirtual },
      });
    }

    // Append all other rooms (Honeymoon Suite, etc.) — skip all merged variants
    rooms.forEach((r) => {
      if (!isHiddenVariant(r.name)) {
        display.push(r);
      }
    });

    // Sort by preferred order
    display.sort((a, b) => {
      const getPreferredIndex = (name) => {
        if (name === "Standard Room") return 0;
        if (name === "Family Suite" || name === "Family Room") return 1;
        if (name === "Honeymoon Suite" || name === "Wedding Couple Suite") return 2;
        // Custom room types created by admin fall here, sorted alphabetically
        return 100;
      };
      const ia = getPreferredIndex(a.name);
      const ib = getPreferredIndex(b.name);
      return ia - ib;
    });

    return display;
  };

  const handleRoomBook = (bookingData) => {
    const roomId = bookingData?.room?._id;
    if (!roomId) { onBook?.(bookingData); return; }

    const selectedRoom = rooms.find((room) => room._id === roomId);
    if (!selectedRoom) { onBook?.(bookingData); return; }

    if (selectedRoom.availableRooms <= 0) {
      alert("Sorry, this room type is fully booked.");
      return;
    }

    const updatedRoom = { ...selectedRoom, availableRooms: selectedRoom.availableRooms - 1 };
    setRooms((prev) => prev.map((r) => (r._id === roomId ? updatedRoom : r)));
    onBook?.({ ...bookingData, room: updatedRoom });
  };

  const displayRooms = buildDisplayRooms();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {!hideHeader && (
        <div className="bg-[#0F172A] py-20 text-center">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Accommodations</p>
          <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Rooms &amp; Suites
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Choose from our collection of elegantly appointed rooms and suites, each designed for ultimate comfort.
          </p>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              acVariants={room._isMergedStandard ? room._acVariants : null}
              onBook={handleRoomBook}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
