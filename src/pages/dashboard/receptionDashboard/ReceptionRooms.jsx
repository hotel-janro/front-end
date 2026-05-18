import React, { useState, useEffect } from 'react';
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
import { apiFetch } from '../../../api';
import '../adminDashboard/AdminRooms.css';
import { Rooms } from '../../website/Rooms.jsx';

export function ReceptionRooms({ isLoggedIn, onBook }) {
  const [activeTab, setActiveTab] = useState('book'); // 'book', 'manage' or 'bookings'
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
      setRooms(roomsRes?.data || []);
      setBookings(bookingsRes?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Count active bookings per room type
  const getBookedCount = (typeName) => {
    return bookings.filter(b => 
      b.room?.name?.toLowerCase() === typeName.toLowerCase() &&
      b.status !== 'cancelled' && b.status !== 'checked-out'
    ).length;
  };

  // ENSURE ALL TYPES ARE SHOWN IN THE TABLE
  const uniqueTypes = [...new Set(rooms.map(r => r.name).filter(Boolean))];
  const aggregatedRooms = uniqueTypes.map(typeName => {
    // Case-insensitive search to be more robust
    const backendRoomsOfType = rooms.filter(r => r.name === typeName);
    const bookedCount = getBookedCount(typeName);
    
    if (backendRoomsOfType.length > 0) {
      const dbAvailable = backendRoomsOfType.reduce((sum, r) => sum + (r.availableRooms || 0), 0);
      const dbTotal = backendRoomsOfType.reduce((sum, r) => sum + (r.totalRooms || 1), 0);
      const firstRoom = backendRoomsOfType[0];
      return {
        ...firstRoom,
        availableRooms: dbAvailable,
        totalRooms: dbTotal,
        bookedCount,
        isPlaceholder: false
      };
    }
    return null;
  }).filter(Boolean);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Room Status & Bookings</h1>
          <p className="text-slate-500">View live hotel stock and manage guest bookings.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {aggregatedRooms.map((room) => {
          const totalInStock = room.totalRooms || 0;
          const freeCount = room.availableRooms || 0;
          
          let iconColorClass = "admin-rooms__stat-icon-wrap--blue";
          if (room.name?.includes("Family")) iconColorClass = "admin-rooms__stat-icon-wrap--green";
          if (room.name?.includes("Honeymoon")) iconColorClass = "admin-rooms__stat-icon-wrap--amber";

          return (
            <div key={room.name} className="admin-rooms__stat-card">
              <div className={`admin-rooms__stat-icon-wrap ${iconColorClass}`}>
                <Bed className="admin-rooms__stat-icon" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{room.name}</p>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</p>
                    <h3 className="text-xl font-bold text-slate-900">{totalInStock}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-green-500 font-bold">Available</p>
                    <h3 className="text-xl font-bold text-green-600">{freeCount}</h3>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
                  <th className="text-right">Actions</th>
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
                        <span className="font-medium">{booking.room?.name || 'N/A'}</span>
                        {booking.decorationItems && booking.decorationItems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.decorationItems.map((item, idx) => (
                              <span 
                                key={idx} 
                                className="text-[9px] px-1.5 py-0.5 bg-pink-50 text-pink-600 border border-pink-100 rounded-md font-bold uppercase tracking-wider"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5">
                        {new Date(booking.checkInDate).toLocaleDateString() === new Date(booking.checkOutDate).toLocaleDateString() && 
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
                    <td><span className="font-bold text-slate-900">Rs. {booking.totalPrice.toLocaleString()}</span></td>
                    <td className="text-right">
                      <button 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Booking"
                        onClick={() => handleDeleteBooking(booking._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No bookings found.</td>
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