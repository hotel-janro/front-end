import { useEffect, useMemo, useState } from 'react';
import { Waves, Clock, Users, DollarSign, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { poolSlots, poolBookings as mockPoolBookings } from '../../../data/newMockData.js';
import './AdminPool.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const defaultForm = {
  guestName: '',
  guestEmail: '',
  roomNumber: '',
  date: '',
  timeSlot: 'Morning (09:00 - 11:00)',
  numberOfGuests: '1',
  pricePerPerson: '500',
  status: 'Confirmed'
};

const normalizeBooking = (booking, index = 0) => {
  const fallbackId = booking?.id || String(index + 1).padStart(3, '0');
  const bookingId = booking?._id || fallbackId;

  return {
    id: fallbackId,
    _id: bookingId,
    guestName: booking?.guestName || '',
    guestEmail: booking?.guestEmail || '',
    roomNumber: booking?.roomNumber || '',
    date: booking?.date || new Date().toISOString(),
    timeSlot: booking?.timeSlot || '',
    numberOfGuests: Number(booking?.numberOfGuests || 0),
    status: booking?.status || 'Confirmed',
    totalAmount: Number(booking?.totalAmount || 0),
    pricePerPerson: Number(booking?.pricePerPerson || 0)
  };
};

export function AdminPool() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [bookings, setBookings] = useState(mockPoolBookings.map((booking, index) => normalizeBooking(booking, index)));
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState(defaultForm);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/pool-bookings`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load pool bookings');
        }

        const normalized = (result.bookings || []).map((booking, index) => normalizeBooking(booking, index));
        setBookings(normalized);
        setFetchError('');
      } catch (error) {
        setFetchError(error.message || 'Could not load pool bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.roomNumber && booking.roomNumber.includes(searchTerm));
    const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSlots = poolSlots.filter((slot) =>
    slot.timeSlot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'admin-pool__status-badge admin-pool__status-badge--confirmed';
      case 'Checked-In': return 'admin-pool__status-badge admin-pool__status-badge--checked-in';
      case 'Completed': return 'admin-pool__status-badge admin-pool__status-badge--completed';
      case 'Cancelled': return 'admin-pool__status-badge admin-pool__status-badge--cancelled';
      default: return 'admin-pool__status-badge admin-pool__status-badge--completed';
    }
  };

  const getSlotStatusClass = (status) => {
    switch (status) {
      case 'Available': return 'admin-pool__status-badge admin-pool__status-badge--available';
      case 'Full': return 'admin-pool__status-badge admin-pool__status-badge--full';
      case 'Closed': return 'admin-pool__status-badge admin-pool__status-badge--closed';
      default: return 'admin-pool__status-badge admin-pool__status-badge--closed';
    }
  };

  const getTabClass = (tabName) =>
    `admin-pool__tab ${activeTab === tabName ? 'admin-pool__tab--active' : ''}`.trim();

  const getProgressClass = (slot) => {
    if (slot.bookedCount === slot.capacity) {
      return 'admin-pool__progress-fill admin-pool__progress-fill--high';
    }

    if (slot.bookedCount / slot.capacity > 0.7) {
      return 'admin-pool__progress-fill admin-pool__progress-fill--medium';
    }

    return 'admin-pool__progress-fill admin-pool__progress-fill--low';
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === 'Checked-In').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  const timeSlotOptions = useMemo(() => {
    const slots = new Set(poolSlots.map((slot) => `${slot.timeSlot} (${slot.startTime} - ${slot.endTime})`));

    bookings.forEach((booking) => {
      if (booking.timeSlot) {
        slots.add(booking.timeSlot);
      }
    });

    return Array.from(slots);
  }, [bookings]);

  const handleOpenBookingModal = () => {
    setSubmitError('');
    setFormData(defaultForm);
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmitBooking = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const isEditing = !!editingBooking;
      const url = isEditing 
        ? `${API_BASE}/api/pool-bookings/${editingBooking}`
        : `${API_BASE}/api/pool-bookings`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          numberOfGuests: Number(formData.numberOfGuests),
          pricePerPerson: Number(formData.pricePerPerson)
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'create'} booking`);
      }

      const newBooking = normalizeBooking(result.booking);
      if (isEditing) {
        setBookings((previous) => previous.map(b => (b._id === editingBooking || b.id === editingBooking) ? newBooking : b));
      } else {
        setBookings((previous) => [newBooking, ...previous]);
      }
      
      setIsModalOpen(false);
      setFormData(defaultForm);
      setEditingBooking(null);
    } catch (error) {
      setSubmitError(error.message || `Failed to ${editingBooking ? 'update' : 'create'} booking`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (booking) => {
    setSubmitError('');
    setFormData({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      roomNumber: booking.roomNumber,
      date: booking.date ? booking.date.split('T')[0] : '',
      timeSlot: booking.timeSlot,
      numberOfGuests: booking.numberOfGuests.toString(),
      pricePerPerson: booking.pricePerPerson.toString(),
      status: booking.status
    });
    setEditingBooking(booking._id || booking.id);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/pool-bookings/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete booking');
      }

      setBookings((previous) => previous.filter((b) => b._id !== id && b.id !== id));
    } catch (error) {
      alert(error.message || 'Failed to delete booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Pool Management</h1>
          <p className="mt-1 text-gray-500">Manage pool access, time slots, and bookings</p>
        </div>
        <button className="admin-pool__action-button self-start" onClick={activeTab === 'bookings' ? handleOpenBookingModal : undefined}>
          <Plus className="admin-pool__action-icon" />
          {activeTab === 'bookings' ? 'New Booking' : 'Add Time Slot'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-pool__stat-card">
          <div className="admin-pool__stat-content">
            <div className="admin-pool__stat-icon-wrap admin-pool__stat-icon-wrap--blue"><Waves className="admin-pool__stat-icon" /></div>
            <div><p className="text-sm text-gray-600">Total Bookings</p><h3 className="text-2xl font-semibold text-gray-900">{totalBookings}</h3></div>
          </div>
        </div>
        <div className="admin-pool__stat-card">
          <div className="admin-pool__stat-content">
            <div className="admin-pool__stat-icon-wrap admin-pool__stat-icon-wrap--cyan"><Users className="admin-pool__stat-icon" /></div>
            <div><p className="text-sm text-gray-600">Active Now</p><h3 className="text-2xl font-semibold text-gray-900">{activeBookings}</h3></div>
          </div>
        </div>
        <div className="admin-pool__stat-card">
          <div className="admin-pool__stat-content">
            <div className="admin-pool__stat-icon-wrap admin-pool__stat-icon-wrap--green"><DollarSign className="admin-pool__stat-icon" /></div>
            <div><p className="text-sm text-gray-600">Total Revenue</p><h3 className="text-2xl font-semibold text-gray-900">{settings.currency.symbol}{totalRevenue}</h3></div>
          </div>
        </div>
      </div>

      <div className="admin-pool__panel">
        {fetchError && (
          <div className="admin-pool__inline-alert">
            {fetchError}
          </div>
        )}
        <div className="flex border-b border-gray-200">
          <div>
            <button onClick={() => setActiveTab('bookings')} className={getTabClass('bookings')}>Bookings</button>
            <button onClick={() => setActiveTab('slots')} className={getTabClass('slots')}>Time Slots</button>
          </div>
        </div>

        <div className="border-b border-gray-100 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="admin-pool__search-wrap flex-1">
              <Search className="admin-pool__search-icon" />
              <input type="text" placeholder={activeTab === 'bookings' ? 'Search by guest or room number...' : 'Search time slots...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-pool__input" />
            </div>
            {activeTab === 'bookings' && (
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-pool__select">
                <option>All</option><option>Confirmed</option><option>Checked-In</option><option>Completed</option><option>Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {activeTab === 'bookings' ? (
          <div className="overflow-x-auto">
            <table className="admin-pool__table">
              <thead className="admin-pool__table-head">
                <tr>
                  <th className="admin-pool__table-header">Booking ID</th>
                  <th className="admin-pool__table-header">Guest Name</th>
                  <th className="admin-pool__table-header">Room Number</th>
                  <th className="admin-pool__table-header">Date</th>
                  <th className="admin-pool__table-header">Time Slot</th>
                  <th className="admin-pool__table-header">Guests</th>
                  <th className="admin-pool__table-header">Status</th>
                  <th className="admin-pool__table-header">Amount</th>
                  <th className="admin-pool__table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="admin-pool__table-body">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id || booking.id} className="admin-pool__table-row">
                    <td className="admin-pool__table-cell"><span className="admin-pool__booking-code">#POOL-{booking.id.padStart(3, '0')}</span></td>
                    <td className="admin-pool__table-cell"><div><div className="admin-pool__guest-name">{booking.guestName}</div><div className="admin-pool__guest-email">{booking.guestEmail}</div></div></td>
                    <td className="admin-pool__table-cell">{booking.roomNumber || 'N/A'}</td>
                    <td className="admin-pool__table-cell">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="admin-pool__table-cell">{booking.timeSlot}</td>
                    <td className="admin-pool__table-cell">{booking.numberOfGuests}</td>
                    <td className="admin-pool__table-cell"><span className={getStatusClass(booking.status)}>{booking.status}</span></td>
                    <td className="admin-pool__table-cell"><span className="admin-pool__amount">{settings.currency.symbol}{booking.totalAmount}</span></td>
                    <td className="admin-pool__table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(booking)} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Edit Booking">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteBooking(booking._id || booking.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Delete Booking">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="py-12 text-center"><p className="text-gray-500">Loading bookings...</p></div>}
            {!isLoading && filteredBookings.length === 0 && (<div className="py-12 text-center"><p className="text-gray-500">No bookings found</p></div>)}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSlots.map((slot) => (
                <div key={slot.id} className="admin-pool__slot-card">
                  <div className="admin-pool__slot-head">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{slot.timeSlot}</h3>
                      <p className="mt-1 text-sm text-gray-500">{new Date(slot.date).toLocaleDateString()}</p>
                    </div>
                    <span className={getSlotStatusClass(slot.status)}>{slot.status}</span>
                  </div>
                  <div className="admin-pool__slot-meta">
                    <div className="admin-pool__slot-meta-item"><Clock className="admin-pool__slot-meta-icon" />{slot.startTime} - {slot.endTime}</div>
                    <div className="admin-pool__slot-capacity"><Users className="admin-pool__slot-meta-icon" />{slot.bookedCount} / {slot.capacity} guests</div>
                    <div className="admin-pool__slot-meta-item"><DollarSign className="admin-pool__slot-meta-icon" />{settings.currency.symbol}{slot.pricePerPerson} per person</div>
                  </div>
                  <div className="admin-pool__slot-progress">
                    <div className="admin-pool__progress-track">
                      <div className={getProgressClass(slot)} style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }} />
                    </div>
                    <p className="admin-pool__slot-remaining">{slot.capacity - slot.bookedCount} spots remaining</p>
                  </div>
                  <button className="admin-pool__slot-button" disabled={slot.status === 'Full' || slot.status === 'Closed'}>
                    {slot.status === 'Full' ? 'Fully Booked' : slot.status === 'Closed' ? 'Closed' : 'Book Slot'}
                  </button>
                </div>
              ))}
            </div>
            {filteredSlots.length === 0 && (<div className="py-12 text-center"><p className="text-gray-500">No time slots found</p></div>)}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-pool__modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-pool__modal-card">
            <div className="admin-pool__modal-head">
              <h2 className="admin-pool__modal-title">{editingBooking ? 'Edit Pool Booking' : 'Create Pool Booking'}</h2>
              <button type="button" className="admin-pool__modal-close" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <form className="admin-pool__modal-form" onSubmit={handleSubmitBooking}>
              <label className="admin-pool__field">
                Guest Name
                <input className="admin-pool__input" name="guestName" value={formData.guestName} onChange={handleFormChange} required />
              </label>

              <label className="admin-pool__field">
                Guest Email
                <input className="admin-pool__input" type="email" name="guestEmail" value={formData.guestEmail} onChange={handleFormChange} required />
              </label>

              <label className="admin-pool__field">
                Room Number (Optional)
                <input className="admin-pool__input" name="roomNumber" value={formData.roomNumber} onChange={handleFormChange} />
              </label>

              <label className="admin-pool__field">
                Date
                <input className="admin-pool__input" type="date" name="date" value={formData.date} onChange={handleFormChange} required />
              </label>

              <label className="admin-pool__field">
                Time Slot
                <select className="admin-pool__select" name="timeSlot" value={formData.timeSlot} onChange={handleFormChange} required>
                  {timeSlotOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="admin-pool__field">
                Number Of Guests
                <input className="admin-pool__input" type="number" min="1" name="numberOfGuests" value={formData.numberOfGuests} onChange={handleFormChange} required />
              </label>

              <label className="admin-pool__field">
                Price Per Person
                <input className="admin-pool__input" type="number" min="0" step="0.01" name="pricePerPerson" value={formData.pricePerPerson} onChange={handleFormChange} required />
              </label>

              <label className="admin-pool__field">
                Status
                <select className="admin-pool__select" name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>

              {submitError && <p className="admin-pool__form-error">{submitError}</p>}

              <div className="admin-pool__modal-actions">
                <button type="button" className="admin-pool__secondary-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-pool__primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingBooking ? 'Update Booking' : 'Save Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
