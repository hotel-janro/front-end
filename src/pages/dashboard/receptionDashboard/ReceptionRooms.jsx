import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bed, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Info,
  Calendar,
  Heart,
  Users,
  DollarSign,
  X,
  ArrowUpDown,
  MoreVertical,
  PlusCircle,
  Home,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Eye
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { apiFetch } from '../../../api';
import { useSocket } from '../../../context/SocketContext.jsx';
import '../adminDashboard/AdminRooms.css';
import { Rooms } from '../../website/Rooms.jsx';

const getRoomTypeName = (roomName, roomNumberStr) => {
  if (!roomName) return 'N/A';
  const lower = roomName.toLowerCase();
  if (lower.includes('non-ac standard room') || lower.includes('non ac standard room')) {
    return 'Standard Room (Non-AC)';
  }
  if (lower.includes('ac standard room') || lower.includes('a/c standard room')) {
    return 'Standard Room (AC)';
  }
  if (lower.includes('standard room') && roomNumberStr) {
    const match = String(roomNumberStr).match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return `Standard Room ${num >= 5 ? '(AC)' : '(Non-AC)'}`;
    }
  }
  return roomName;
};

const ROOM_TYPES = {
  'Standard Room': {
    price: 5000,
    description: "Comfortable and elegant, our Standard Room features a king-size bed, work desk, and modern amenities for a pleasant stay.",
    defaultGuests: 4,
    amenities: "King-size bed, Work desk, WiFi, AC, TV"
  },
  'Family Suite': {
    price: 10000,
    description: "Designed for families, featuring two bedrooms, a play area, kid-friendly amenities, and connecting rooms.",
    defaultGuests: 4,
    amenities: "Two bedrooms, Play area, Kid-friendly amenities, Connecting rooms, WiFi, AC"
  },
  'Honeymoon Suite': {
    price: 15000,
    description: "A romantic escape with private pool, candlelit dining setup, rose petal turndown, and couples spa treatment.",
    defaultGuests: 2,
    amenities: "Private pool, Candlelit dining, Rose petal turndown, Couples spa, WiFi, AC"
  }
};

const BASE_COUNTS = {
  'Standard Room': 6,
  'Family Suite': 2,
  'Honeymoon Suite': 2
};

export function ReceptionRooms({ isLoggedIn, onBook }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'book'); // 'book', 'manage' or 'bookings'
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTypes, setExpandedTypes] = useState(new Set());
  const [viewingBooking, setViewingBooking] = useState(null);
  
  
  const toggleExpand = (typeName) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeName)) {
      newExpanded.delete(typeName);
    } else {
      newExpanded.add(typeName);
    }
    setExpandedTypes(newExpanded);
  };

  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(socket ? socket.connected : false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Always fetch both rooms and bookings so inventory can show booked counts
      const [roomsRes, bookingsRes] = await Promise.all([
        apiFetch('/rooms/admin/list'),
        apiFetch('/bookings')
      ]);
      setRooms(roomsRes?.data || []);
      setBookings(bookingsRes?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const handleBookingUpdate = () => {
      fetchData(true); // Silent refetch in background
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('bookingCreated', handleBookingUpdate);
    socket.on('bookingUpdated', handleBookingUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('bookingCreated', handleBookingUpdate);
      socket.off('bookingUpdated', handleBookingUpdate);
    };
  }, [socket]);

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;
    
    try {
      await apiFetch(`/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      fetchData(); // Refresh bookings list
    } catch (error) {
      alert('Error deleting booking: ' + error.message);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await apiFetch(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchData(); // Refresh bookings list
    } catch (error) {
      alert(`Error updating booking status to ${status}: ` + error.message);
    }
  };

  const handleRemoveOneRoom = async (room) => {
    if (!room || room.isPlaceholder || room.availableRooms <= 0) return;
    
    if (!window.confirm("Are you sure you want to delete this specific room? This action cannot be undone.")) {
      return;
    }

    try {
      // Fetch the live DB document first to get accurate totalRooms
      const liveRes = await apiFetch(`/rooms/admin/list`);
      const liveRooms = liveRes.data || [];
      const liveRoom = liveRooms.find(r => r._id === room._id);
      
      const currentAvailable = liveRoom ? liveRoom.availableRooms : room.availableRooms;
      const currentTotal = liveRoom ? (liveRoom.totalRooms ?? currentAvailable) : (room.totalRooms ?? room.availableRooms);
      
      // Send only clean database fields — never spread aggregated UI objects
      await apiFetch(`/rooms/${room._id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          availableRooms: Math.max(0, currentAvailable - 1),
          totalRooms: Math.max(0, currentTotal - 1)
        })
      });
      fetchData();
    } catch (error) {
      alert('Error removing room: ' + error.message);
    }
  };

  // Get booked room numbers per type (using actual roomNumber from bookings)
  const getBookedRoomNumbers = (typeName) => {
    const isStandard = typeName.toLowerCase() === 'standard room';
    return bookings
      .filter(b => {
        const roomName = (b.room?.name || '').toLowerCase();
        const matchesType = isStandard ? roomName.includes('standard room') : roomName === typeName.toLowerCase();
        return matchesType &&
          b.status !== 'cancelled' && b.status !== 'checked-out' &&
          b.roomNumber;
      })
      .map(b => b.roomNumber);
  };

  // Count active bookings per room type
  const getBookedCount = (typeName) => {
    const isStandard = typeName.toLowerCase() === 'standard room';
    return bookings.filter(b => {
      const roomName = (b.room?.name || '').toLowerCase();
      const matchesType = isStandard ? roomName.includes('standard room') : roomName === typeName.toLowerCase();
      return matchesType &&
        b.status !== 'cancelled' && b.status !== 'checked-out';
    }).length;
  };

  // ENSURE ALL TYPES ARE SHOWN IN THE TABLE (AND UNIFY STANDARD ROOMS)
  const normalizedRooms = rooms.map(r => {
    let name = r.name;
    if (name?.toLowerCase().includes('standard room')) {
      name = 'Standard Room';
    }
    return { ...r, normalizedName: name };
  });

  // Only show ACTIVE rooms in the inventory table
  const activeRooms = normalizedRooms.filter(r => r.isActive !== false);
  const uniqueTypes = [...new Set(activeRooms.map(r => r.normalizedName).filter(Boolean))];
  const aggregatedRooms = uniqueTypes.map(typeName => {
    const backendRoomsOfType = activeRooms.filter(r => r.normalizedName === typeName);
    const bookedRoomNumbers = getBookedRoomNumbers(typeName);
    const bookedCount = bookedRoomNumbers.length;
    
    if (backendRoomsOfType.length > 0) {
      const dbTotal = backendRoomsOfType.reduce((sum, r) => sum + (r.totalRooms !== undefined ? r.totalRooms : 1), 0);
      
      // Merge allRoomNumbers arrays from all matched DB rooms
      const mergedRoomNumbers = [];
      backendRoomsOfType.forEach(r => {
        if (r.allRoomNumbers && Array.isArray(r.allRoomNumbers)) {
           r.allRoomNumbers.forEach(label => {
             mergedRoomNumbers.push({
               label: label,
               originalRoom: r
             });
           });
        }
      });

      // Sort merged room numbers so they appear in numerical order
      mergedRoomNumbers.sort((a, b) => {
        const numA = parseInt(a.label.replace('Room ', '')) || 0;
        const numB = parseInt(b.label.replace('Room ', '')) || 0;
        return numA - numB;
      });

      const firstRoom = backendRoomsOfType[0];
      
      let finalTotalRooms = dbTotal;
      let finalAllRoomNumbers = mergedRoomNumbers;

      if (typeName === 'Standard Room') {
        finalTotalRooms = 6;
        finalAllRoomNumbers = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6'].map(label => ({
          label,
          originalRoom: firstRoom
        }));
      }

      return {
        ...firstRoom,
        name: typeName, // Override name with the unified typeName
        allRoomNumbers: finalAllRoomNumbers, // The newly merged array of objects!
        availableRooms: Math.max(0, finalTotalRooms - bookedCount),
        totalRooms: finalTotalRooms,
        bookedCount,
        bookedRoomNumbers,
        isPlaceholder: false
      };
    }
    return null;
  }).filter(Boolean);

  const totalUnits = aggregatedRooms.reduce(
    (sum, room) => sum + (Number(room.totalRooms) || 0),
    0
  );

  const filteredRooms = aggregatedRooms.filter(room =>
    (room.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => {
    const fullName = booking.fullName || booking.guestName || '';
    const roomName = booking.room?.name || '';
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           roomName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeBookings = bookings.filter(b =>
    !['cancelled', 'rejected', 'checked-out'].includes(String(b.status || '').toLowerCase())
  ).length;

  const getStatusBadge = (status) => {
    if (!status) return <span className="admin-rooms__status-badge admin-rooms__status-badge--maintenance">Unknown</span>;
    const s = status.toLowerCase();
    if (s === 'confirmed' || s === 'available') return <span className="admin-rooms__status-badge admin-rooms__status-badge--available">{status}</span>;
    if (s === 'occupied' || s === 'checked-in') return <span className="admin-rooms__status-badge admin-rooms__status-badge--occupied">{status}</span>;
    if (s === 'pending' || s === 'reserved') return <span className="admin-rooms__status-badge admin-rooms__status-badge--reserved">{status}</span>;
    return <span className="admin-rooms__status-badge admin-rooms__status-badge--maintenance">{status}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
            <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Room Status & Bookings
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl">
              View live hotel stock, track active reservations, and manage guest bookings from one clean dashboard.
            </p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm mt-4 w-fit shadow-inner animate-in fade-in duration-300">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {isConnected ? 'Live Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Room Type</p>
              <p className="mt-2 text-2xl font-semibold text-white">{aggregatedRooms.length}</p>
            </div>
            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#F5E7B2]">Active Bookings</p>
              <p className="mt-2 text-2xl font-semibold text-white">{activeBookings}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Total Units</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalUnits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-rooms__stat-card border-[#D4AF37]/20 bg-white">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--blue">
            <Bed className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Room Type</p>
            <h3 className="text-2xl font-bold text-slate-900">{aggregatedRooms.length}</h3>
          </div>
        </div>
        <div className="admin-rooms__stat-card border-[#D4AF37]/20 bg-white">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--green">
            <CheckCircle className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Units</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalUnits}
            </h3>
          </div>
        </div>
        <div className="admin-rooms__stat-card border-[#D4AF37]/20 bg-white">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--amber">
            <Calendar className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Bookings</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {activeBookings}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="admin-rooms__panel">
        <div className="admin-rooms__tab-container">
          <button 
            className={`admin-rooms__tab ${activeTab === 'book' ? 'admin-rooms__tab--active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            Book a Room
          </button>
          <button 
            className={`admin-rooms__tab ${activeTab === 'manage' ? 'admin-rooms__tab--active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Inventory Stock
          </button>
          <button 
            className={`admin-rooms__tab ${activeTab === 'bookings' ? 'admin-rooms__tab--active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Room Bookings
          </button>
        </div>

        {/* Search & Filters */}
        {activeTab !== 'book' && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'manage' ? "Search rooms by type..." : "Search bookings by guest..."}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="admin-rooms__table-container">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : activeTab === 'book' ? (
            <div className="p-6 bg-[#F8FAFC]">
              <Rooms onBook={onBook} isLoggedIn={isLoggedIn} hideHeader={true} />
            </div>
          ) : activeTab === 'manage' ? (
            <table className="admin-rooms__table">
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Price / Night</th>
                  <th>Total Units in Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => {
                  const totalInStock = room.totalRooms || 0;
                  const freeCount = room.availableRooms || 0;
                  const bookedCount = room.bookedCount || 0;
                  const isExpanded = expandedTypes.has(room.name);

                  return (
                    <React.Fragment key={room.name}>
                      <tr className={isExpanded ? 'admin-rooms__row--expanded' : ''}>
                        <td>
                          <div className="flex items-center gap-3">
                            <button 
                              className={`admin-rooms__expand-btn ${isExpanded ? 'admin-rooms__expand-btn--active' : ''}`}
                              onClick={() => toggleExpand(room.name)}
                            >
                              <Plus className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                            </button>
                            <div className="admin-rooms__room-info">
                              <span className="admin-rooms__room-name">{room.name}</span>
                              <span className="admin-rooms__room-type">Max Guests: {room.defaultGuests}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-semibold text-slate-900">Rs. {room.price.toLocaleString()}</span></td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md font-bold">{totalInStock}</span>
                              <span className="text-[10px] text-slate-400">Total</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-green-600">{freeCount} Free</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-red-500">{bookedCount} Booked</span>
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(room.isActive ? 'Available' : 'Inactive')}</td>
                      </tr>
                      {isExpanded && (
                        <>
                          {/* Unified room list with hotel-wide continuous numbering */}
                          {(room.allRoomNumbers || []).map((roomData, i) => {
                            // Support both strings (legacy mapping fallback) and objects (our new detailed mapping)
                            const roomLabel = typeof roomData === 'object' ? roomData.label : roomData;
                            const originalDbRoom = typeof roomData === 'object' ? roomData.originalRoom : room;
                            
                            const isBooked = (room.bookedRoomNumbers || []).includes(roomLabel);
                            const roomNumber = parseInt(roomLabel.replace('Room ', '')) || 0;

                            let variantLabel = '';
                            if ((room.name || '').toLowerCase().includes('standard room')) {
                              const dbName = (originalDbRoom.name || '').toLowerCase();
                              if (dbName === 'ac standard room') {
                                variantLabel = '(AC)';
                              } else if (dbName === 'non-ac standard room') {
                                variantLabel = '(Non-AC)';
                              } else {
                                // fallback for legacy unified standard room records
                                variantLabel = roomNumber >= 5 ? '(AC)' : '(Non-AC)';
                              }
                            }

                            return (
                              <tr 
                                key={`room-${room.name}-${i}`} 
                                className={`admin-rooms__sub-row ${isBooked ? 'admin-rooms__sub-row--booked' : ''}`}
                              >
                                <td className="pl-12">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className={`font-medium ${isBooked ? 'text-red-600' : 'text-slate-600'}`}>
                                      {roomLabel} {variantLabel}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-slate-400">-</td>
                                <td>
                                  {isBooked ? (
                                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">Occupied</span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded">Available</span>
                                  )}
                                </td>
                                <td>{getStatusBadge(isBooked ? 'Occupied' : 'Available')}</td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">No rooms found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-rooms__table">
              <thead>
                <tr>
                  <th>Guest Details</th>
                  <th>Room Type</th>
                  <th>Room No.</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{booking.fullName}</span>
                        <span className="text-xs text-slate-500">{booking.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{getRoomTypeName(booking.room?.name, booking.roomNumber)}</span>
                      </div>
                    </td>
                    <td>
                      {booking.roomNumber ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{booking.roomNumber}</span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5">
                        {new Date(booking.checkInDate) > new Date(booking.checkOutDate) || 
                         (booking.startIndex !== undefined && booking.endIndex !== undefined && booking.endIndex < booking.startIndex) ? (
                          <span className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-[10px] text-red-700 border border-red-200 rounded font-black uppercase tracking-wider">
                            ⚠️ INVALID DATES
                          </span>
                        ) : new Date(booking.checkInDate).toLocaleDateString() === new Date(booking.checkOutDate).toLocaleDateString() && 
                          booking.checkInType === booking.checkOutType ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-bold text-slate-900 text-[11px]">
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${
                              booking.checkInType === 'Day' 
                                ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              ONLY {booking.checkInType}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400">IN:</span>
                              <span className="text-[11px] font-bold text-slate-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                              <span className="px-1 py-0.5 bg-blue-50 text-[9px] text-blue-600 border border-blue-100 rounded font-bold uppercase">{booking.checkInType || 'Day'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400">OUT:</span>
                              <span className="text-[11px] font-bold text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                              <span className="px-1 py-0.5 bg-red-50 text-[9px] text-red-600 border border-red-100 rounded font-bold uppercase">{booking.checkOutType || 'Night'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{booking.guests}</td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900">Rs. {booking.totalPrice.toLocaleString()}</span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {booking.paymentMethod || 'Cash'}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded w-max ${
                            (booking.paymentStatus || 'Pending').toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {booking.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setViewingBooking(booking)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Booking Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setViewingBooking(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
                Booking Details
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                REF: #{String(viewingBooking._id || viewingBooking.id).slice(-8).toUpperCase()}
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Name</span>
                  <span className="text-sm font-bold text-slate-900">{viewingBooking.fullName || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Item</span>
                  <span className="text-sm font-bold text-slate-900">{viewingBooking.room?.name || viewingBooking.roomName || viewingBooking.hallName || "N/A"}</span>
                </div>
                {viewingBooking.checkInDate && viewingBooking.checkOutDate && new Date(viewingBooking.checkInDate).toLocaleDateString() === new Date(viewingBooking.checkOutDate).toLocaleDateString() && viewingBooking.checkInType === viewingBooking.checkOutType ? (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-500">Date</span>
                    <span className="text-sm font-bold text-slate-900">
                      {new Date(viewingBooking.checkInDate).toLocaleDateString()}
                      {viewingBooking.checkInType ? ` (Only ${viewingBooking.checkInType})` : ""}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-500">Date In</span>
                      <span className="text-sm font-bold text-slate-900">
                        {new Date(viewingBooking.checkInDate || viewingBooking.eventDate).toLocaleDateString()}
                        {viewingBooking.checkInType ? ` (${viewingBooking.checkInType})` : ""}
                      </span>
                    </div>
                    {viewingBooking.checkOutDate && (
                      <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-500">Date Out</span>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(viewingBooking.checkOutDate).toLocaleDateString()}
                          {viewingBooking.checkOutType ? ` (${viewingBooking.checkOutType})` : ""}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Guests</span>
                  <span className="text-sm font-bold text-slate-900">{viewingBooking.guests || "N/A"}</span>
                </div>
                {viewingBooking.decorationItems && viewingBooking.decorationItems.length > 0 && (
                  <div className="py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-500 block mb-2">Decorations / Add-ons</span>
                    <div className="flex flex-wrap gap-2">
                      {viewingBooking.decorationItems.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold rounded-md">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {viewingBooking.specialRequests && (
                  <div className="py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-500 block mb-1">Special Requests</span>
                    <span className="text-sm font-medium text-slate-800">{viewingBooking.specialRequests}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-[#D4AF37]">
                    Rs. {Number(viewingBooking.totalPrice || viewingBooking.amount || viewingBooking.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}