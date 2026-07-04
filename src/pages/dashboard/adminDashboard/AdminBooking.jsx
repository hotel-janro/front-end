import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Bed,
  DollarSign,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  X,
  Phone,
  Mail,
  MapPin,
  Hash,
  Users,
  Clock,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '../../../api';

export function AdminBookings() {
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
      (booking.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || booking.status.toLowerCase() === filterStatus.toLowerCase();
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

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDotColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-emerald-500';
      case 'checked-in': return 'bg-blue-500';
      case 'checked-out': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      case 'pending': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const handleViewDetails = (booking) => {
    setViewingBooking(booking);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reservations</h1>
          <p className="text-gray-500 mt-1">Manage room bookings and check-in status</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked-In</option>
              <option value="checked-out">Checked-Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room & Add-ons</th>
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
                      <div className="text-sm font-medium text-gray-900">{booking.room?.name || 'N/A'}</div>
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
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredBookings.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto animate-in fade-in duration-300">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              currentPage === 1 
                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                : "bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white active:scale-95 border border-slate-200"
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
                : "bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white active:scale-95 border border-slate-200"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Bed className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No reservations found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ===== VIEW BOOKING DETAILS MODAL ===== */}
      {showViewModal && viewingBooking && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Booking Details</h2>
                  <p className="text-blue-100 text-xs">Room Reservation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(viewingBooking.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${getStatusDotColor(viewingBooking.status)}`}></span>
                  {viewingBooking.status}
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {viewingBooking._id?.slice(-8).toUpperCase()}</span>
              </div>

              {/* Guest Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Guest Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">{viewingBooking.fullName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {viewingBooking.email || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {viewingBooking.phone || viewingBooking.contactNumber || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Guests</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {viewingBooking.guests || '—'} person(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Room & Dates */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Bed className="w-4 h-4 text-blue-500" /> Room & Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Room</p>
                    <p className="text-sm font-semibold text-gray-900">{viewingBooking.room?.name || 'N/A'}</p>
                    {viewingBooking.room?.type && (
                      <p className="text-xs text-gray-500">{viewingBooking.room.type}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Room Number</p>
                    <p className="text-sm font-semibold text-gray-900">{viewingBooking.room?.roomNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Check-In</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(viewingBooking.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      viewingBooking.checkInType === 'Day' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {viewingBooking.checkInType || 'Day'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Check-Out</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(viewingBooking.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      viewingBooking.checkOutType === 'Night' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {viewingBooking.checkOutType || 'Night'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {viewingBooking.decorationItems && viewingBooking.decorationItems.length > 0 && (
                <div className="bg-pink-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Add-ons / Decorations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingBooking.decorationItems.map((item, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-white text-pink-600 border border-pink-200 rounded-lg font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {viewingBooking.specialRequests && (
                <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Special Requests</h3>
                  <p className="text-sm text-gray-700">{viewingBooking.specialRequests}</p>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Payment Summary
                </h3>
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-sm font-semibold text-gray-600">Total Amount</span>
                  <span className="text-lg font-black text-gray-900">Rs. {viewingBooking.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Booking Meta */}
              {viewingBooking.createdAt && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Booked on {new Date(viewingBooking.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
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
