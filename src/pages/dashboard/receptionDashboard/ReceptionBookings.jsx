import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { apiFetch } from '../../../api';

const getRoomTypeName = (roomName, roomNumberStr) => {
  if (!roomName) return 'N/A';
  const lower = roomName.toLowerCase();
  // If DB already stores 'AC Standard Room' or 'Non-AC Standard Room'
  if (lower.includes('non-ac standard room') || lower.includes('non ac standard room')) {
    return 'Standard Room (Non-AC)';
  }
  if (lower.includes('ac standard room') || lower.includes('a/c standard room')) {
    return 'Standard Room (AC)';
  }
  // Fallback: determine from room number
  if (lower.includes('standard room') && roomNumberStr) {
    const match = String(roomNumberStr).match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return `Standard Room ${num >= 5 ? '(AC)' : '(Non-AC)'}`;
    }
  }
  return roomName;
};

export function ReceptionBookings() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // View Details Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/bookings');
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      (booking.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomTypeName(booking.room?.name, booking.roomNumber).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || booking.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginatedBookings = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const statusCounts = {
    All: bookings.length,
    Pending: bookings.filter((b) => b.status?.toLowerCase() === 'pending').length,
    Confirmed: bookings.filter((b) => b.status?.toLowerCase() === 'confirmed').length,
    'Checked-In': bookings.filter((b) => b.status?.toLowerCase() === 'checked-in').length,
    'Checked-Out': bookings.filter((b) => b.status?.toLowerCase() === 'checked-out').length,
    Cancelled: bookings.filter((b) => b.status?.toLowerCase() === 'cancelled').length,
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'checked-in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-out': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = (booking) => {
    setViewingBooking(booking);
    setShowViewModal(true);
  };
  
  const handleStatusAction = async (bookingId, newStatus) => {
    try {
        await apiFetch(`/bookings/${bookingId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        fetchBookings();
    } catch (e) {
        console.error(e);
        alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
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

      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest, email, or room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="mt-4 text-gray-500 font-medium">Loading reservations...</p>
        </div>
      ) : (
        <>
          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room & Add-ons</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{booking.fullName}</div>
                          <div className="text-xs text-gray-500">{booking.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getRoomTypeName(booking.room?.name, booking.roomNumber)}</div>
                          {booking.decorationItems && booking.decorationItems.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.roomNumber ? (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{booking.roomNumber}</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          {new Date(booking.checkInDate) > new Date(booking.checkOutDate) || 
                           (booking.startIndex !== undefined && booking.endIndex !== undefined && booking.endIndex < booking.startIndex) ? (
                            <span className="inline-flex items-center justify-center px-2 py-1 bg-red-100 text-[10px] text-red-700 border border-red-200 rounded font-black uppercase tracking-wider">
                              ⚠️ INVALID DATES
                            </span>
                          ) : new Date(booking.checkInDate).toLocaleDateString() === new Date(booking.checkOutDate).toLocaleDateString() && 
                           booking.checkInType === booking.checkOutType ? (
                            <div className="flex flex-col items-start gap-1">
                              <div className="text-slate-900 font-bold text-[11px]">
                                {new Date(booking.checkInDate).toLocaleDateString()}
                              </div>
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${
                                booking.checkInType === 'Day' 
                                  ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>
                                ONLY {booking.checkInType}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400">IN:</span>
                                <span className="text-[11px] font-bold text-slate-900">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-[9px] text-emerald-700 border border-emerald-100 rounded font-bold uppercase">{booking.checkInType || 'Day'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400">OUT:</span>
                                <span className="text-[11px] font-bold text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                <span className="px-1.5 py-0.5 bg-rose-50 text-[9px] text-rose-700 border border-rose-100 rounded font-bold uppercase">{booking.checkOutType || 'Night'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {booking.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Rs. {booking.totalPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                            {booking.status?.toLowerCase() === 'confirmed' && (
                                <button
                                    onClick={() => handleStatusAction(booking._id, 'checked-in')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                    Check In
                                </button>
                            )}
                            {booking.status?.toLowerCase() === 'checked-in' && (
                                <button
                                    onClick={() => handleStatusAction(booking._id, 'checked-out')}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors"
                                >
                                    Check Out
                                </button>
                            )}
                            <button 
                            onClick={() => handleViewDetails(booking)}
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors hover:underline"
                            >
                            <Eye className="w-4 h-4" />
                            View
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredBookings.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto animate-in fade-in duration-300">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  currentPage === 1 
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white active:scale-95 border border-slate-200"
                }`}
              >
                Previous
              </button>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  currentPage === totalPages 
                    ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white active:scale-95 border border-slate-200"
                }`}
              >
                Next
              </button>
            </div>
          )}
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No bookings found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showViewModal && viewingBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-indigo-600">
                    {viewingBooking.fullName?.split(' ').map((n) => n[0]).join('') || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{viewingBooking.fullName}</p>
                  <p className="text-sm text-gray-500">{viewingBooking.email}</p>
                  <p className="text-sm text-gray-500">{viewingBooking.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <InfoItem label="Booking ID" value={`#${viewingBooking._id?.slice(-5).toUpperCase() || 'N/A'}`} />
                <InfoItem label="Room" value={`${viewingBooking.roomNumber ? `Room ${viewingBooking.roomNumber}` : 'Unassigned'}`} />
                <InfoItem label="Room Type" value={`${getRoomTypeName(viewingBooking.room?.name, viewingBooking.roomNumber)}`} />
                <InfoItem label="Total Amount" value={`Rs. ${viewingBooking.totalPrice?.toLocaleString()}`} />
                
                <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <InfoItem label="Check-in Date" value={new Date(viewingBooking.checkInDate).toLocaleDateString()} />
                  <InfoItem label="Check-out Date" value={new Date(viewingBooking.checkOutDate).toLocaleDateString()} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm font-semibold text-gray-600 mr-2">Status:</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(viewingBooking.status)}`}>
                  {viewingBooking.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              {viewingBooking.status?.toLowerCase() === 'confirmed' && (
                <button
                    onClick={() => {
                        handleStatusAction(viewingBooking._id, 'checked-in');
                        setShowViewModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    Check In
                </button>
              )}
              {viewingBooking.status?.toLowerCase() === 'checked-in' && (
                <button
                    onClick={() => {
                        handleStatusAction(viewingBooking._id, 'checked-out');
                        setShowViewModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors"
                >
                    Check Out
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
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