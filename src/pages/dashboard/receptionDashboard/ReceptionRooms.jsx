import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { apiFetch } from '../../../api';
import '../adminDashboard/AdminRooms.css';

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

export function ReceptionRooms() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'bookings'
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTypes, setExpandedTypes] = useState(new Set());
  
  const toggleExpand = (typeName) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeName)) {
      newExpanded.delete(typeName);
    } else {
      newExpanded.add(typeName);
    }
    setExpandedTypes(newExpanded);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch both rooms and bookings so inventory can show booked counts
      const [roomsRes, bookingsRes] = await Promise.all([
        apiFetch('/rooms/admin/list'),
        apiFetch('/bookings')
      ]);
      setRooms(roomsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count active bookings per room type
  const getBookedCount = (typeName) => {
    return bookings.filter(b => 
      b.room?.name?.toLowerCase() === typeName.toLowerCase() &&
      b.status !== 'cancelled' && b.status !== 'checked-out'
    ).length;
  };

  // ENSURE ALL TYPES ARE SHOWN IN THE TABLE
  const aggregatedRooms = Object.keys(ROOM_TYPES).map(typeName => {
    // Case-insensitive search to be more robust
    const backendRoomsOfType = rooms.filter(r => r.name?.toLowerCase() === typeName.toLowerCase());
    const typeDetails = ROOM_TYPES[typeName];
    const bookedCount = getBookedCount(typeName);
    
    if (backendRoomsOfType.length > 0) {
      const dbAvailable = backendRoomsOfType.reduce((sum, r) => sum + (r.availableRooms || 0), 0);
      const firstRoom = backendRoomsOfType[0];
      return {
        ...firstRoom,
        availableRooms: dbAvailable,
        bookedCount,
        isPlaceholder: false
      };
    }

    return {
      _id: `placeholder-${typeName}`,
      name: typeName,
      price: typeDetails.price,
      description: typeDetails.description,
      availableRooms: 0,
      bookedCount,
      defaultGuests: typeDetails.defaultGuests,
      isActive: true,
      isPlaceholder: true
    };
  });

  const filteredRooms = aggregatedRooms.filter(room => 
    (room.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => {
    const nameMatch = (booking.fullName || booking.guestName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const roomMatch = booking.room && (booking.room.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || roomMatch;
  });

  const totalUnits = Object.values(BASE_COUNTS).reduce((a, b) => a + b, 0) + rooms.reduce((acc, room) => acc + (room.availableRooms || 0), 0);
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length;

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
            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                to="/reception/bookings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                View Bookings
              </Link>
              <Link
                to="/reception/wedding"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Heart className="w-4 h-4 text-[#D4AF37]" />
                Wedding Events
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Total Types</p>
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
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Room Types</p>
              <p className="mt-2 text-2xl font-semibold text-white">{Object.keys(ROOM_TYPES).length}</p>
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
            <p className="text-sm font-medium text-slate-500">Total Types</p>
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

        {/* Content */}
        <div className="admin-rooms__table-container">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
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
                  const baseCount = BASE_COUNTS[room.name] || 0;
                  const addedCount = room.availableRooms || 0;
                  const bookedCount = room.bookedCount || 0;
                  const totalInStock = baseCount + addedCount + bookedCount;
                  const freeCount = baseCount + addedCount;
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
                          {/* Unified room list with continuous numbering */}
                          {Array.from({ length: totalInStock }).map((_, i) => {
                            const roomNumber = i + 1;
                            const isBooked = i < bookedCount;

                            return (
                              <tr 
                                key={`room-${room.name}-${i}`} 
                                className={`admin-rooms__sub-row ${isBooked ? 'admin-rooms__sub-row--booked' : ''}`}
                              >
                                <td className="pl-12">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className={`font-medium ${isBooked ? 'text-red-600' : 'text-slate-600'}`}>
                                      Room {roomNumber}
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
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking._id || Math.random()}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{booking.fullName || booking.guestName || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{booking.email || 'No email'}</span>
                      </div>
                    </td>
                    <td>{booking.room?.name || 'N/A'}</td>
                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-blue-600">IN: {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="font-medium text-red-600">OUT: {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td>{booking.guests || 1}</td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td><span className="font-bold text-slate-900">Rs. {(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}</span></td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}