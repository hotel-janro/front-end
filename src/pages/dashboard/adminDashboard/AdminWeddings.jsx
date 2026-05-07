import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, Users, DollarSign, Plus, Search,
  CheckCircle, XCircle, MoreVertical, Filter, Download,
  RefreshCw, Hotel, Loader2
} from 'lucide-react';
import { apiFetch } from '../../../api';
import { toast } from 'sonner';

export function AdminWedding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, confirmedEvents: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID of booking being acted on

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Run requests in parallel; each apiFetch throws on failure
      const [bookingsData, hallsData, statsData] = await Promise.all([
        apiFetch(`/wedding/all-bookings?status=${filterStatus}&search=${encodeURIComponent(searchTerm)}`),
        apiFetch('/wedding/halls'),
        apiFetch('/wedding/dashboard-stats'),
      ]);

      setBookings(bookingsData.data || []);
      setHalls(hallsData.data || []);
      setStats(statsData.data || { totalBookings: 0, confirmedEvents: 0, totalRevenue: 0 });
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    // Debounce search slightly so we don't fire on every keystroke
    const timer = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // ── Status Update ───────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id + newStatus);
    try {
      await apiFetch(`/wedding/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ bookingStatus: newStatus }),
      });
      toast.success(`Booking ${newStatus} successfully!`);
      // Optimistic update locally
      setBookings(prev =>
        prev.map(b => b._id === id ? { ...b, bookingStatus: newStatus } : b)
      );
      // Refresh stats
      const statsData = await apiFetch('/wedding/dashboard-stats');
      setStats(statsData.data || stats);
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    setActionLoading(id + 'delete');
    try {
      await apiFetch(`/wedding/bookings/${id}`, { method: 'DELETE' });
      toast.success('Booking deleted.');
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':   return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'rejected':  return 'bg-slate-100 text-slate-600 border-slate-200';
      default:          return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getHallStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':    return 'bg-emerald-100 text-emerald-700';
      case 'maintenance':  return 'bg-rose-100 text-rose-700';
      case 'unavailable':  return 'bg-slate-100 text-slate-600';
      default:             return 'bg-gray-100 text-gray-600';
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-normal text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Wedding &amp; Event Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Oversee grand celebrations and venue scheduling at Hotel Janro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/wedding-booking')}
            className="px-5 py-2.5 bg-[#0F172A] text-[#D4AF37] rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-bold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'bookings' ? 'New Booking' : 'New Hall'}
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Reservations', value: stats.totalBookings,  icon: Heart,        color: 'text-rose-500',    bg: 'bg-rose-50' },
          { label: 'Confirmed Events',   value: stats.confirmedEvents, icon: CheckCircle,  color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Projected Revenue',  value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:border-[#D4AF37]/40 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-4 ${s.bg} ${s.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">{s.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content Card ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">

        {/* Tabs + Filters */}
        <div className="p-6 md:p-8 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row justify-between gap-4">

            {/* Tab switcher */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl w-fit">
              {['bookings', 'halls'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-white text-[#0F172A] shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'bookings' ? 'Event Bookings' : 'Wedding Halls'}
                </button>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by client or hall…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:bg-white transition-all w-60"
                />
              </div>

              {activeTab === 'bookings' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Loading data…</span>
          </div>
        )}

        {/* ── Bookings Table ── */}
        {!loading && activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 bg-slate-50/60">
                  <th className="px-8 py-4 text-left">Booking ID</th>
                  <th className="px-8 py-4 text-left">Client</th>
                  <th className="px-8 py-4 text-left">Venue &amp; Date</th>
                  <th className="px-8 py-4 text-left">Guests</th>
                  <th className="px-8 py-4 text-left">Package</th>
                  <th className="px-8 py-4 text-left">Status</th>
                  <th className="px-8 py-4 text-left">Total / Deposit</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        #WED-{booking._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-[#0F172A]">{booking.customerId?.name || '—'}</p>
                      <p className="text-xs text-slate-400">{booking.customerId?.email || '—'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-[#0F172A]">{booking.hallId?.hallName || '—'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{booking.guestCount}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        {booking.packageType || '—'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-[#0F172A]">${(booking.totalAmount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Deposit: ${(booking.depositAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-1.5">
                        {booking.bookingStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                              disabled={actionLoading === booking._id + 'confirmed'}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
                              title="Confirm"
                            >
                              {actionLoading === booking._id + 'confirmed'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                              disabled={actionLoading === booking._id + 'cancelled'}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all disabled:opacity-50"
                              title="Cancel"
                            >
                              {actionLoading === booking._id + 'cancelled'
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <XCircle className="w-4 h-4" />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(booking._id)}
                          disabled={actionLoading === booking._id + 'delete'}
                          className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 hover:text-slate-600 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {actionLoading === booking._id + 'delete'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <MoreVertical className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="py-20 text-center">
                <Heart className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-semibold">No event bookings found.</p>
                <p className="text-slate-300 text-xs mt-1">Try adjusting your filters or add a new booking.</p>
                <button
                  onClick={() => navigate('/wedding-booking')}
                  className="mt-6 px-6 py-3 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  + New Booking
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Halls Grid ── */}
        {!loading && activeTab === 'halls' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map(hall => (
              <div key={hall._id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300">
                <div className="h-44 bg-slate-900 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    alt={hall.hallName}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getHallStatusStyle(hall.status)}`}>
                      {hall.status}
                    </span>
                    <h3 className="text-white font-bold text-lg mt-1.5">{hall.hallName}</h3>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500"><Users className="w-4 h-4" /> Capacity</span>
                    <span className="font-bold text-[#0F172A]">{hall.capacity} guests</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500"><DollarSign className="w-4 h-4" /> Base Price</span>
                    <span className="font-bold text-[#D4AF37]">${(hall.price || 0).toLocaleString()}</span>
                  </div>
                  <button className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-[#D4AF37] transition-all mt-2">
                    Manage Schedule
                  </button>
                </div>
              </div>
            ))}

            {halls.length === 0 && (
              <div className="col-span-3 py-20 text-center">
                <Hotel className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-semibold">No wedding halls found in the database.</p>
                <p className="text-slate-300 text-xs mt-1">Add halls via the backend or admin seed scripts.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
