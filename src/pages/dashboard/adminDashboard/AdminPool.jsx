import { useState } from 'react';
import { Waves, Clock, Users, DollarSign, Plus, Search } from 'lucide-react';
import { poolSlots, poolBookings } from '../../../data/newMockData.js';
import './AdminPool.css';

export function AdminPool() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredBookings = poolBookings.filter((booking) => {
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

  const totalBookings = poolBookings.length;
  const activeBookings = poolBookings.filter((b) => b.status === 'Checked-In').length;
  const totalRevenue = poolBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Pool Management</h1>
          <p className="mt-1 text-gray-500">Manage pool access, time slots, and bookings</p>
        </div>
        <button className="admin-pool__action-button self-start">
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
            <div><p className="text-sm text-gray-600">Total Revenue</p><h3 className="text-2xl font-semibold text-gray-900">${totalRevenue}</h3></div>
          </div>
        </div>
      </div>

      <div className="admin-pool__panel">
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
                </tr>
              </thead>
              <tbody className="admin-pool__table-body">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="admin-pool__table-row">
                    <td className="admin-pool__table-cell"><span className="admin-pool__booking-code">#POOL-{booking.id.padStart(3, '0')}</span></td>
                    <td className="admin-pool__table-cell"><div><div className="admin-pool__guest-name">{booking.guestName}</div><div className="admin-pool__guest-email">{booking.guestEmail}</div></div></td>
                    <td className="admin-pool__table-cell">{booking.roomNumber || 'N/A'}</td>
                    <td className="admin-pool__table-cell">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="admin-pool__table-cell">{booking.timeSlot}</td>
                    <td className="admin-pool__table-cell">{booking.numberOfGuests}</td>
                    <td className="admin-pool__table-cell"><span className={getStatusClass(booking.status)}>{booking.status}</span></td>
                    <td className="admin-pool__table-cell"><span className="admin-pool__amount">${booking.totalAmount}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (<div className="py-12 text-center"><p className="text-gray-500">No bookings found</p></div>)}
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
                    <div className="admin-pool__slot-meta-item"><DollarSign className="admin-pool__slot-meta-icon" />${slot.pricePerPerson} per person</div>
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
    </div>
  );
}
