/* AdminRooms.jsx */
import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ImagePlus,
  Layers
} from 'lucide-react';
import { apiFetch, API_HOST } from '../../../api';
import './AdminRooms.css';

export function AdminRooms() {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'bookings'
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  // New Room Type modal state
  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const [newTypeForm, setNewTypeForm] = useState({
    name: '',
    description: '',
    price: '',
    initialRooms: 1,
    defaultGuests: 2,
    amenities: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [newTypeSubmitting, setNewTypeSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  const toggleExpand = (typeName) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(typeName)) {
      newExpanded.delete(typeName);
    } else {
      newExpanded.add(typeName);
    }
    setExpandedTypes(newExpanded);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    availableRooms: '',
    defaultGuests: 1,
    amenities: '',
    image: '',
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
      setRooms(roomsRes?.data || []);
      setBookings(bookingsRes?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    // Look for an existing room of this type in the database to suggest defaults
    const existingRoom = rooms.find(r => r.name === type);
    
    if (existingRoom) {
      setFormData({
        ...formData,
        name: type,
        price: existingRoom.price,
        description: existingRoom.description,
        defaultGuests: existingRoom.defaultGuests,
        amenities: (existingRoom.amenities && Array.isArray(existingRoom.amenities)) ? existingRoom.amenities.join(', ') : '',
        image: existingRoom.image || ''
      });
      setImagePreview(existingRoom.image || null);
    } else {
      setFormData({
        ...formData,
        name: type,
        price: '',
        description: '',
        defaultGuests: 1,
        amenities: '',
        image: ''
      });
      setImagePreview(null);
    }
  };

  const hiddenRoomTypes = new Set([
    'family suite',
    'honeymoon suite',
    'a/c room',
    'ac room',
    'non a/c room',
    'non ac room',
    'photo location'
  ]);

  const roomTypeOptions = [
    'Standard Room',
    'Family Suite',
    'Honeymoon Suite',
    ...new Set(rooms.map(r => r.name))
  ].filter((type, index, array) => {
    const normalized = String(type || '').trim().toLowerCase();
    return !hiddenRoomTypes.has(normalized) && array.indexOf(type) === index;
  });

  const handleOpenModal = (room = null, preSelectedType = '') => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        description: room.description,
        price: room.price,
        availableRooms: room.availableRooms,
        totalRooms: room.totalRooms,
        defaultGuests: room.defaultGuests,
        amenities: (room.amenities && Array.isArray(room.amenities)) ? room.amenities.join(', ') : '',
        image: room.image || '',
        isActive: room.isActive
      });
      setImagePreview(room.image || null);
    } else {
      const defaultData = rooms.find(r => r.name === preSelectedType);
      setEditingRoom(null);
      setFormData({
        name: preSelectedType,
        description: defaultData ? defaultData.description : '',
        price: defaultData ? defaultData.price : '',
        availableRooms: '',
        defaultGuests: defaultData ? defaultData.defaultGuests : 1,
        amenities: (defaultData?.amenities && Array.isArray(defaultData.amenities)) ? defaultData.amenities.join(', ') : '',
        image: defaultData ? defaultData.image || '' : '',
        isActive: true
      });
      setImagePreview(defaultData ? defaultData.image || null : null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setImagePreview(null);
  };

  // ── New Room Type handlers ──────────────────────────────────────────
  const handleOpenNewTypeModal = () => {
    setNewTypeForm({ name: '', description: '', price: '', initialRooms: 1, defaultGuests: 2, amenities: '', image: '' });
    setImagePreview(null);
    setIsNewTypeModalOpen(true);
  };

  const handleCloseNewTypeModal = () => {
    setIsNewTypeModalOpen(false);
    setImagePreview(null);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file));
    // Upload to server
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiFetch('/upload', { method: 'POST', body: fd });
      if (res.success && res.url) {
        setNewTypeForm(prev => ({ ...prev, image: res.url }));
        setFormData(prev => ({ ...prev, image: res.url }));
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleNewTypeSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = (newTypeForm.name || '').trim();
    if (!trimmedName) { alert('Please enter a room type name.'); return; }
    if (!newTypeForm.price || Number(newTypeForm.price) <= 0) { alert('Please enter a valid price.'); return; }
    // Prevent duplicate type names
    const duplicate = rooms.find(r => r.name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) { alert(`A room type named "${trimmedName}" already exists. Use the existing "Create Room" button to add more units.`); return; }

    setNewTypeSubmitting(true);
    try {
      const count = Math.max(1, Number(newTypeForm.initialRooms) || 1);
      const amenitiesArr = (newTypeForm.amenities || '').split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name: trimmedName,
        description: newTypeForm.description || '',
        price: Number(newTypeForm.price),
        availableRooms: count,
        totalRooms: count,
        defaultGuests: Number(newTypeForm.defaultGuests) || 2,
        amenities: amenitiesArr,
        image: newTypeForm.image || '',
        isActive: true
      };
      await apiFetch('/rooms', { method: 'POST', body: JSON.stringify(payload) });
      handleCloseNewTypeModal();
      fetchData();
    } catch (err) {
      alert('Error creating room type: ' + err.message);
    } finally {
      setNewTypeSubmitting(false);
    }
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
        const updatedTotal = (existingRoom.totalRooms || 0) + 1;
        await apiFetch(`/rooms/${existingRoom._id}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            ...existingRoom, 
            availableRooms: updatedCount,
            totalRooms: updatedTotal,
            amenities: existingRoom.amenities 
          })
        });
      } else if (editingRoom) {
        // EDIT MODE: Standard update
        const payload = {
          ...formData,
          price: Number(formData.price),
          availableRooms: Number(formData.availableRooms),
          totalRooms: Number(formData.availableRooms) + getBookedCount(formData.name), // Sync total rooms
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
          totalRooms: 1,
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
    // Only aggregate ACTIVE rooms from the database
    const backendRoomsOfType = rooms.filter(r => 
      r.isActive && r.name === typeName
    );
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
          <h1 className="text-3xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500">Add rooms to your inventory. The count below shows your total hotel stock (Base + Added).</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="admin-rooms__action-button"
            onClick={handleOpenNewTypeModal}
          >
            <Layers className="w-5 h-5" />
            <span>Create Room Type</span>
          </button>
          <button className="admin-rooms__action-button" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5" />
            <span>Create Room</span>
          </button>
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
                            // Any room that is not booked can be deleted
                            const canDelete = !isBooked;

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
                                      title={isBooked ? "Occupied rooms cannot be deleted" : "Delete this room"}
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
                    <td><span className="font-bold text-slate-900">Rs. {booking.totalPrice.toLocaleString()}</span></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!booking.status || booking.status === 'pending') && (
                          <>
                            <button
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg transition-all shadow-sm font-semibold text-[11px] uppercase tracking-wider"
                              title="Confirm Booking"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Confirm</span>
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white rounded-lg transition-all shadow-sm font-semibold text-[11px] uppercase tracking-wider"
                              title="Reject Booking"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Reject</span>
                            </button>
                          </>
                        )}
                        <button 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm font-semibold text-[11px] uppercase tracking-wider flex-shrink-0"
                          title="Delete Booking"
                          onClick={() => handleDeleteBooking(booking._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                {/* Image Upload for Edit Mode */}
                <div className="admin-rooms__form-group admin-rooms__form-group--full" style={{ marginBottom: '16px' }}>
                  <label className="admin-rooms__label">Room Photo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #c4b5fd',
                      borderRadius: '14px',
                      background: imagePreview ? 'transparent' : '#faf5ff',
                      minHeight: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#7c3aed' }}>
                        <ImagePlus style={{ width: '36px', height: '36px', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: '600', fontSize: '14px' }}>Click to upload room photo</p>
                        <p style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px' }}>JPG, PNG, WEBP — recommended 800×600px</p>
                      </div>
                    )}
                    {imageUploading && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', color: '#7c3aed', fontWeight: '600'
                      }}>
                        Uploading…
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageFileChange}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, image: '' })); setNewTypeForm(p => ({...p, image: ''})); }}
                      style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Remove photo
                    </button>
                  )}
                </div>

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
                      {roomTypeOptions.map(type => (
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
                        className="admin-rooms__input border-slate-200 bg-slate-50 cursor-not-allowed" 
                        required 
                        disabled
                        value={formData.totalRooms}
                        onChange={(e) => setFormData({...formData, totalRooms: e.target.value})}
                      />
                      <p className="text-xs text-slate-400 mt-1 italic">Note: Use the "+" and trash icons in the table to manage room instances.</p>
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
                    <label className="admin-rooms__label">Amenities</label>
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

      {/* ── Create New Room Type Modal ──────────────────────────────── */}
      {isNewTypeModalOpen && (
        <div className="admin-rooms__modal-overlay">
          <div className="admin-rooms__modal" style={{ maxWidth: '560px' }}>
            <div className="admin-rooms__modal-header" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
              <div>
                <h2 className="admin-rooms__modal-title" style={{ color: '#fff' }}>Create New Room Type</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '2px' }}>Define a brand-new room category. It will appear on the booking page automatically.</p>
              </div>
              <button className="admin-rooms__modal-close" style={{ color: '#fff' }} onClick={handleCloseNewTypeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleNewTypeSubmit}>
              <div className="admin-rooms__modal-body">

                {/* Image Upload */}
                <div className="admin-rooms__form-group admin-rooms__form-group--full" style={{ marginBottom: '16px' }}>
                  <label className="admin-rooms__label">Room Photo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #c4b5fd',
                      borderRadius: '14px',
                      background: imagePreview ? 'transparent' : '#faf5ff',
                      minHeight: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#7c3aed' }}>
                        <ImagePlus style={{ width: '36px', height: '36px', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: '600', fontSize: '14px' }}>Click to upload room photo</p>
                        <p style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px' }}>JPG, PNG, WEBP — recommended 800×600px</p>
                      </div>
                    )}
                    {imageUploading && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', color: '#7c3aed', fontWeight: '600'
                      }}>
                        Uploading…
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageFileChange}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setNewTypeForm(p => ({ ...p, image: '' })); }}
                      style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                <div className="admin-rooms__form-grid">
                  {/* Room Type Name */}
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Room Type Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      className="admin-rooms__input"
                      placeholder="e.g. Deluxe Suite, Penthouse Room…"
                      required
                      value={newTypeForm.name}
                      onChange={e => setNewTypeForm(p => ({ ...p, name: e.target.value }))}
                    />
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>This exact name will appear on the booking page.</p>
                  </div>

                  {/* Price */}
                  <div className="admin-rooms__form-group">
                    <label className="admin-rooms__label">Price per Night (Rs.) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      className="admin-rooms__input"
                      placeholder="e.g. 12000"
                      required
                      min="0"
                      value={newTypeForm.price}
                      onChange={e => setNewTypeForm(p => ({ ...p, price: e.target.value }))}
                    />
                  </div>

                  {/* Max Guests */}
                  <div className="admin-rooms__form-group">
                    <label className="admin-rooms__label">Max Guests <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      className="admin-rooms__input"
                      required
                      min="1"
                      value={newTypeForm.defaultGuests}
                      onChange={e => setNewTypeForm(p => ({ ...p, defaultGuests: e.target.value }))}
                    />
                  </div>

                  {/* Initial Room Count */}
                  <div className="admin-rooms__form-group">
                    <label className="admin-rooms__label">Initial Room Count <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      className="admin-rooms__input"
                      required
                      min="1"
                      value={newTypeForm.initialRooms}
                      onChange={e => setNewTypeForm(p => ({ ...p, initialRooms: e.target.value }))}
                    />
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Number of rooms of this type to add to inventory.</p>
                  </div>

                  {/* Description */}
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Description</label>
                    <textarea
                      className="admin-rooms__textarea"
                      rows="3"
                      placeholder="Describe this room type — features, atmosphere, highlights…"
                      value={newTypeForm.description}
                      onChange={e => setNewTypeForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>

                  {/* Amenities */}
                  <div className="admin-rooms__form-group admin-rooms__form-group--full">
                    <label className="admin-rooms__label">Amenities</label>
                    <input
                      type="text"
                      className="admin-rooms__input"
                      placeholder="WiFi, AC, TV, Mini Bar, Jacuzzi …  (comma-separated)"
                      value={newTypeForm.amenities}
                      onChange={e => setNewTypeForm(p => ({ ...p, amenities: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-rooms__modal-footer">
                <button type="button" className="admin-rooms__btn admin-rooms__btn--secondary" onClick={handleCloseNewTypeModal}>Cancel</button>
                <button
                  type="submit"
                  className="admin-rooms__btn admin-rooms__btn--primary"
                  disabled={newTypeSubmitting || imageUploading}
                  style={{ opacity: (newTypeSubmitting || imageUploading) ? 0.7 : 1 }}
                >
                  {newTypeSubmitting ? 'Creating…' : '✦ Create Room Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
