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

export function ReceptionRooms() {
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
      setRooms(roomsRes?.data || []);
      setBookings(bookingsRes?.data || []);
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
        <div className="admin-rooms__stat-card">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--blue">
            <Bed className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Types</p>
            <h3 className="text-2xl font-bold text-slate-900">{aggregatedRooms.length}</h3>
          </div>
        </div>
        <div className="admin-rooms__stat-card">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--green">
            <CheckCircle className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Units</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {Object.values(BASE_COUNTS).reduce((a, b) => a + b, 0) + rooms.reduce((acc, room) => acc + (room.availableRooms || 0), 0)}
            </h3>
          </div>
        </div>
        <div className="admin-rooms__stat-card">
          <div className="admin-rooms__stat-icon-wrap admin-rooms__stat-icon-wrap--amber">
            <Calendar className="admin-rooms__stat-icon" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Bookings</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').length}
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