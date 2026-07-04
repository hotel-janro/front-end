import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import {
  Calendar,
  Search,
  LogIn,
  LogOut,
  Eye,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Bed,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { bookings } from '../../../data/mockData.js';

export function ReceptionBookings() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    All: bookings.length,
    Confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
    'Checked-In': bookings.filter((b) => b.status === 'Checked-In').length,
    'Checked-Out': bookings.filter((b) => b.status === 'Checked-Out').length,
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: 'bg-blue-100 text-blue-800', icon: CheckCircle, action: 'Check In', actionColor: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'Checked-In':
        return { bg: 'bg-emerald-100 text-emerald-800', icon: LogIn, action: 'Check Out', actionColor: 'bg-amber-500 hover:bg-amber-600' };
      case 'Checked-Out':
        return { bg: 'bg-gray-100 text-gray-600', icon: LogOut, action: null, actionColor: '' };
      case 'Cancelled':
        return { bg: 'bg-red-100 text-red-800', icon: XCircle, action: null, actionColor: '' };
      default:
        return { bg: 'bg-gray-100 text-gray-800', icon: Clock, action: null, actionColor: '' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Bookings Management
          </h1>
          <p className="text-slate-300 mt-2">
            Check-in, check-out, and manage guest reservations
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-xl font-medium transition-colors shadow-lg shadow-[#D4AF37]/20 self-start sm:self-center whitespace-nowrap">
          <Plus className="w-5 h-5" />
          Walk-in Booking
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by guest name, email, or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.map((booking) => {
          const config = getStatusConfig(booking.status);
          const StatusIcon = config.icon;
          const nights = Math.ceil(
            (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Guest Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">
                        {booking.guestName.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</p>
                      <p className="text-xs text-gray-500 truncate">{booking.guestEmail}</p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        Room {booking.roomNumber} · {booking.roomType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' → '}
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{nights} night{nights > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg}`}>
                      <StatusIcon className="w-3 h-3" />
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
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No bookings found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold text-indigo-600">
                    {selectedBooking.guestName.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedBooking.guestName}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.guestEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Booking ID" value={`#${selectedBooking.id.padStart(5, '0')}`} />
                <InfoItem label="Room" value={`${selectedBooking.roomNumber} (${selectedBooking.roomType})`} />
                <InfoItem label="Check-in" value={new Date(selectedBooking.checkIn).toLocaleDateString()} />
                <InfoItem label="Check-out" value={new Date(selectedBooking.checkOut).toLocaleDateString()} />
                <InfoItem label="Guests" value={selectedBooking.guests} />
                <InfoItem label="Total Amount" value={`Rs ${selectedBooking.totalAmount}`} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full ${getStatusConfig(selectedBooking.status).bg}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {getStatusConfig(selectedBooking.status).action && (
                <button
                  className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${getStatusConfig(selectedBooking.status).actionColor}`}
                >
                  {getStatusConfig(selectedBooking.status).action}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}