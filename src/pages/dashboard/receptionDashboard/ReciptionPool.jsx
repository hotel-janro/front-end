import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Waves,
  Users,
  DollarSign,
  Search,
  Plus,
  UserCheck,
} from 'lucide-react';
import { poolSlots, poolBookings } from '../../../data/newMockData.js';
import './ReciptionPool.css';

export function ReceptionPool() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('slots');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = poolBookings.filter((booking) =>
    booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.roomNumber && booking.roomNumber.includes(searchTerm))
  );

  const totalGuests = poolBookings.reduce((sum, b) => sum + b.numberOfGuests, 0);
  const activeNow = poolBookings.filter((b) => b.status === 'Checked-In').length;
  const totalRevenue = poolBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const getSlotFillPercent = (slot) => Math.round((slot.bookedCount / slot.capacity) * 100);

  const getSlotColor = (slot) => {
    const percent = getSlotFillPercent(slot);
    if (slot.status === 'Full') return { bar: 'bg-red-500', bg: 'bg-red-50 border-red-200', text: 'text-red-700' };
    if (percent > 70) return { bar: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' };
    return { bar: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
  };

  const getBookingStatusConfig = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: 'bg-emerald-100 text-emerald-800', action: 'Check In', actionColor: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'Checked-In':
        return { bg: 'bg-blue-100 text-blue-800', action: 'Check Out', actionColor: 'bg-amber-500 hover:bg-amber-600' };
      case 'Completed':
        return { bg: 'bg-gray-100 text-gray-600', action: null, actionColor: '' };
      default:
        return { bg: 'bg-gray-100 text-gray-800', action: null, actionColor: '' };
    }
  };

  return (
    <div className="reception-pool-page">
      {/* Header */}
      <div className="reception-pool-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pool Access Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage pool time slots and guest access</p>
        </div>
        <div className="reception-pool-header-actions">
          <button
            type="button"
            onClick={() => navigate('/reception')}
            className="reception-pool-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button type="button" className="reception-pool-primary-btn">
            <Plus className="w-4 h-4" />
            New Pool Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="reception-pool-stats-grid">
        <div className="reception-pool-stat-card bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <div className="reception-pool-stat-head">
            <Users className="w-5 h-5 text-cyan-600" />
            <span className="text-xs font-medium text-cyan-600">Active Now</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activeNow}</p>
          <p className="text-[10px] text-gray-500 mt-1">guests in pool</p>
        </div>
        <div className="reception-pool-stat-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="reception-pool-stat-head">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Total Booked</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalGuests}</p>
          <p className="text-[10px] text-gray-500 mt-1">guests today</p>
        </div>
        <div className="reception-pool-stat-card bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <div className="reception-pool-stat-head">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">${totalRevenue}</p>
          <p className="text-[10px] text-gray-500 mt-1">today's pool revenue</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="reception-pool-toggle-wrap">
        <button
          onClick={() => setActiveView('slots')}
          className={`reception-pool-toggle-btn ${
            activeView === 'slots'
              ? 'reception-pool-toggle-btn--active'
              : 'reception-pool-toggle-btn--inactive'
          }`}
        >
          Time Slots
        </button>
        <button
          onClick={() => setActiveView('bookings')}
          className={`reception-pool-toggle-btn ${
            activeView === 'bookings'
              ? 'reception-pool-toggle-btn--active'
              : 'reception-pool-toggle-btn--inactive'
          }`}
        >
          Guest Bookings
        </button>
      </div>

      {activeView === 'slots' ? (
        /* Time Slots View */
        <div className="reception-pool-slot-grid">
          {poolSlots.map((slot) => {
            const color = getSlotColor(slot);
            const fillPercent = getSlotFillPercent(slot);
            const spotsLeft = slot.capacity - slot.bookedCount;

            return (
              <div
                key={slot.id}
                className={`reception-pool-slot-card ${color.bg}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{slot.timeSlot}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                  <span
                    className={`reception-pool-slot-badge ${
                      slot.status === 'Full'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                {/* Capacity Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">
                      {slot.bookedCount} / {slot.capacity} booked
                    </span>
                    <span className={`font-bold ${color.text}`}>{fillPercent}%</span>
                  </div>
                  <div className="reception-pool-capacity-track">
                    <div
                      className={`reception-pool-capacity-fill ${color.bar}`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>

                <div className="reception-pool-slot-footer">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${slot.pricePerPerson}/person
                    </span>
                  </div>
                  <div className="text-right">
                    {spotsLeft > 0 ? (
                      <p className="text-xs font-semibold text-emerald-600">{spotsLeft} spots left</p>
                    ) : (
                      <p className="text-xs font-semibold text-red-600">Fully booked</p>
                    )}
                  </div>
                </div>

                {spotsLeft > 0 && (
                  <button className="reception-pool-book-btn">
                    Book Slot
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Guest Bookings View */
        <div>
          <div className="reception-pool-search-wrap">
            <Search className="reception-pool-search-icon" />
            <input
              type="text"
              placeholder="Search by guest name or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="reception-pool-search-input"
            />
          </div>

          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const config = getBookingStatusConfig(booking.status);

              return (
                <div
                  key={booking.id}
                  className="reception-pool-booking-card"
                >
                  <div className="reception-pool-booking-row">
                    <div className="flex items-center gap-3">
                      <div className="reception-pool-avatar-wrap">
                        <Waves className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{booking.guestName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <span>Room {booking.roomNumber || 'N/A'}</span>
                          <span>·</span>
                          <span>{booking.timeSlot}</span>
                          <span>·</span>
                          <span>{booking.numberOfGuests} guests</span>
                        </div>
                      </div>
                    </div>
                    <div className="reception-pool-booking-actions">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900">${booking.totalAmount}</span>
                      {config.action && (
                        <button
                          className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors ${config.actionColor}`}
                        >
                          {config.action}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBookings.length === 0 && (
            <div className="reception-pool-empty-state">
              <Waves className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No pool bookings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
