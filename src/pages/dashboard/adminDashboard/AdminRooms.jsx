/* AdminRooms.jsx */
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
import './AdminRooms.css';

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

export function AdminRooms() {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'bookings'
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
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
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    availableRooms: '',
    defaultGuests: 1,
    amenities: '',
    isActive: true
  });

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

  const handleTypeChange = (type) => {
    if (type && ROOM_TYPES[type]) {
      const details = ROOM_TYPES[type];
      setFormData({
        ...formData,
        name: type,
        price: details.price,
        description: details.description,
        defaultGuests: details.defaultGuests,
        amenities: details.amenities
      });
    } else {
      setFormData({
        ...formData,
        name: type,
        price: '',
        description: '',
        defaultGuests: 1,
        amenities: ''
      });
    }
  };

  const handleOpenModal = (room = null, preSelectedType = '') => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        description: room.description,
        price: room.price,
        availableRooms: room.availableRooms,
        defaultGuests: room.defaultGuests,
        amenities: room.amenities.join(', '),
        isActive: room.isActive
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: preSelectedType,
        description: preSelectedType ? ROOM_TYPES[preSelectedType].description : '',
        price: preSelectedType ? ROOM_TYPES[preSelectedType].price : '',
        availableRooms: '',
        defaultGuests: preSelectedType ? ROOM_TYPES[preSelectedType].defaultGuests : 1,
        amenities: preSelectedType ? ROOM_TYPES[preSelectedType].amenities : '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please select a room type');
      return;
    }
    
    try {
      // Find if this room type already exists in our database
      const existingRoom = rooms.find(r => r.name === formData.name);

      if (existingRoom && !editingRoom) {
        // INCREMENT MODE: Type exists, just add 1 to the count
        const updatedCount = (existingRoom.availableRooms || 0) + 1;
        await apiFetch(`/rooms/${existingRoom._id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            ...existingRoom, 
            availableRooms: updatedCount,
            amenities: existingRoom.amenities 
          })
        });
      } else if (editingRoom) {
        // EDIT MODE: Standard update
        const payload = {
          ...formData,
          price: Number(formData.price),
          availableRooms: Number(formData.availableRooms),
          defaultGuests: Number(formData.defaultGuests),
          amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item !== '')
        };
        await apiFetch(`/rooms/${editingRoom._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // NEW ENTRY MODE: Create with count 1 (The UI will add the Base Count)
        const payload = {
          ...formData,
          price: Number(formData.price),
          availableRooms: 1,
          defaultGuests: Number(formData.defaultGuests),
          amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item !== '')
        };
        await apiFetch('/rooms', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      
      handleCloseModal();
      fetchData();
    } catch (error) {
      alert('Error saving room: ' + error.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room type and all its added stock?')) {
      try {
        await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        alert('Error deleting room: ' + error.message);
      }
    }
  };

  const handleRemoveOneRoom = async (room) => {
    if (!room || room.isPlaceholder || room.availableRooms <= 0) return;
    
    try {
      const updatedCount = room.availableRooms - 1;
      if (updatedCount === 0) {
        await apiFetch(`/rooms/${room._id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...room, availableRooms: 0 })
        });
      } else {
        await apiFetch(`/rooms/${room._id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...room, availableRooms: updatedCount })
        });
      }
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
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => 
    booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.room && booking.room.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
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
          <h1 className="text-3xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500">Add rooms to your inventory. The count below shows your total hotel stock (Base + Added).</p>
        </div>
        <button className="admin-rooms__action-button" onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5" />
          <span>Create Room</span>
        </button>
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
            <p className="text-sm font-medium text-slate-500">Available Units</p>
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
                  <th>Actions</th>
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
                        <td>
                          <div className="flex items-center">
                            <button 
                              className="admin-rooms__action-btn" 
                              title={room.isPlaceholder ? "Add Stock" : "Update Details"} 
                              onClick={() => handleOpenModal(room.isPlaceholder ? null : room, room.isPlaceholder ? room.name : '')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              className={`admin-rooms__action-btn admin-rooms__action-btn--delete ${room.isPlaceholder ? 'admin-rooms__action-btn--disabled' : ''}`} 
                              title={room.isPlaceholder ? "No added stock to delete" : "Delete All Added Stock"} 
                              onClick={() => !room.isPlaceholder && handleDeleteRoom(room._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <>
                          {/* Unified room list with continuous numbering */}
                          {Array.from({ length: totalInStock }).map((_, i) => {
                            const roomNumber = i + 1;
                            const isBooked = i < bookedCount;
                            const isBase = roomNumber <= baseCount;
                            // Added rooms that are not booked can be deleted
                            const canDelete = !isBase && !isBooked;

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
                                <td>
                                  {canDelete ? (
                                    <button 
                                      className="admin-rooms__action-btn admin-rooms__action-btn--delete" 
                                      title="Delete this room"
                                      onClick={() => handleRemoveOneRoom(room)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button 
                                      className="admin-rooms__action-btn admin-rooms__action-btn--disabled" 
                                      title={isBooked ? "Room is currently booked" : "Base room cannot be deleted"}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
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
                    <td colSpan="5" className="p-8 text-center text-slate-500">No additional rooms found in database. Click "Create Room" to add to your base stock.</td>
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
                  <tr key={booking._id}>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{booking.fullName}</span>
                        <span className="text-xs text-slate-500">{booking.email}</span>
                      </div>
                    </td>
                    <td>{booking.room?.name || 'N/A'}</td>
                    <td>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-blue-600">IN: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                        <span className="font-medium text-red-600">OUT: {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>{booking.guests}</td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td><span className="font-bold text-slate-900">Rs. {booking.totalPrice.toLocaleString()}</span></td>
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

      {/* Add/Edit Room Modal */}
      {isModalOpen && (
        <div className="admin-rooms__modal-overlay">
          <div className="admin-rooms__modal">
            <div className="admin-rooms__modal-header">
              <h2 className="admin-rooms__modal-title">{editingRoom ? 'Adjust Inventory' : 'Add New Room Instance'}</h2>
              <button className="admin-rooms__modal-close" onClick={handleCloseModal}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-rooms__modal-body">
                <div className="admin-rooms__form-grid">
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Select Room Type</label>
                    <select 
                      className="admin-rooms__select" 
                      required 
                      disabled={!!editingRoom}
                      value={formData.name}
                      onChange={(e) => handleTypeChange(e.target.value)}
                    >
                      <option value="">-- Select Room Type --</option>
                      {Object.keys(ROOM_TYPES).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {!editingRoom && <p className="text-xs text-blue-600 mt-1">Selecting a type and clicking "Create" will add 1 room to your stock.</p>}
                  </div>

                  {editingRoom && (
                    <div className="admin-rooms__form-group admin-rooms__form-group--full">
                      <label className="admin-rooms__label">Total Units in Stock</label>
                      <input 
                        type="number" 
                        className="admin-rooms__input border-blue-300 bg-blue-50" 
                        required 
                        value={formData.availableRooms}
                        onChange={(e) => setFormData({...formData, availableRooms: e.target.value})}
                      />
                      <p className="text-xs text-slate-500 mt-1">You are manually adjusting the total count for this room type.</p>
                    </div>
                  )}

                   <div className="admin-rooms__form-group">
                    <label className="admin-rooms__label">Price per Night (Rs.)</label>
                    <input 
                      type="number" 
                      className="admin-rooms__input" 
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  
                  <div className="admin-rooms__form-group">
                    <label className="admin-rooms__label">Max Guests</label>
                    <input 
                      type="number" 
                      className="admin-rooms__input" 
                      required 
                      value={formData.defaultGuests}
                      onChange={(e) => setFormData({...formData, defaultGuests: e.target.value})}
                    />
                  </div>
                  
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Description</label>
                    <textarea 
                      className="admin-rooms__textarea" 
                      rows="2" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Amenities (comma separated)</label>
                    <input 
                      type="text" 
                      className="admin-rooms__input" 
                      placeholder="WiFi, AC, TV"
                      value={formData.amenities}
                      onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-rooms__modal-footer">
                <button type="button" className="admin-rooms__btn admin-rooms__btn--secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="admin-rooms__btn admin-rooms__btn--primary">
                  {editingRoom ? 'Save Changes' : 'Create Room (+1)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
