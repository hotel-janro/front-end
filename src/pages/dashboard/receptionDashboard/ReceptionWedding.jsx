import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Phone,
  Mail,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Music,
  Camera,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { weddingHalls, weddingBookings } from '../../../data/newMockData.js';

export function ReceptionWedding() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredBookings = weddingBookings.filter((booking) => {
    const matchesSearch =
      (booking.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.hallName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' };
      case 'Pending':
        return { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' };
      case 'Completed':
        return { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
      case 'Cancelled':
        return { bg: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const getServiceIcon = (service) => {
    switch (service.toLowerCase()) {
      case 'catering':
        return ChefHat;
      case 'photography':
      case 'videography':
        return Camera;
      case 'dj':
      case 'live band':
        return Music;
      case 'decoration':
        return Sparkles;
      default:
        return CheckCircle;
    }
  };

  const getDaysUntil = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Past';
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
  };

  const totalEvents = weddingBookings.length;
  const confirmedEvents = weddingBookings.filter((b) => b.status === 'Confirmed').length;
  const totalRevenue = weddingBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalCollected = weddingBookings.reduce((sum, b) => sum + b.advancePaid, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">Hotel Janro</p>
            <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Wedding & Events
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl">
              View upcoming weddings, event schedules, and venue activity with a richer reception-style header.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                to="/reception/bookings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Booking Overview
              </Link>
              <Link
                to="/reception/rooms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Room Availability
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Events</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalEvents}</p>
            </div>
            <div className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#F5E7B2]">Confirmed</p>
              <p className="mt-2 text-2xl font-semibold text-white">{confirmedEvents}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Value</p>
              <p className="mt-2 text-2xl font-semibold text-white">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Collected</p>
              <p className="mt-2 text-2xl font-semibold text-white">${totalCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#F5E7B2]">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalEvents}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#F5E7B2]">Confirmed</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{confirmedEvents}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#F5E7B2]">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#F5E7B2]">Collected</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">${totalCollected.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events or halls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Confirmed', 'Pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Halls Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Venue Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weddingHalls.map((hall) => (
            <div key={hall.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{hall.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {hall.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> ${hall.pricePerDay.toLocaleString()}/day
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    hall.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {hall.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Event Schedule</h2>
        <div className="space-y-3">
          {filteredBookings.map((event) => {
            const config = getStatusConfig(event.status);
            const daysUntil = getDaysUntil(event.eventDate);

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-stretch">
                  {/* Left Color Bar */}
                  <div className={`w-1.5 ${config.dot} flex-shrink-0`} />

                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{event.customerName}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${config.bg}`}>
                            {event.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {event.hallName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {event.eventTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.guestCount} guests
                          </span>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(event.services || []).map((service) => {
                            const ServiceIcon = getServiceIcon(service);
                            return (
                              <span
                                key={service}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full"
                              >
                                <ServiceIcon className="w-2.5 h-2.5" />
                                {service}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Countdown</p>
                          <p className={`text-sm font-bold ${daysUntil === 'Today!' ? 'text-red-600' : 'text-indigo-600'}`}>
                            {daysUntil}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total / Paid</p>
                          <p className="text-sm font-bold text-gray-900">
                            ${(event.totalAmount || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            Paid: ${(event.advancePaid || 0).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No events found</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{selectedEvent.customerName}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedEvent.customerEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {selectedEvent.customerPhone}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Venue" value={selectedEvent.hallName} />
                <DetailItem label="Event Date" value={new Date(selectedEvent.eventDate).toLocaleDateString()} />
                <DetailItem label="Time" value={selectedEvent.eventTime} />
                <DetailItem label="Guest Count" value={selectedEvent.guestCount} />
                <DetailItem label="Package" value={selectedEvent.packageType} />
                <DetailItem label="Status" value={selectedEvent.status} />
                <DetailItem label="Total Amount" value={`$${selectedEvent.totalAmount.toLocaleString()}`} />
                <DetailItem label="Advance Paid" value={`$${selectedEvent.advancePaid.toLocaleString()}`} />
              </div>
              {selectedEvent.specialRequests && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Special Requests</p>
                  <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3">
                    {selectedEvent.specialRequests}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Services Included</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedEvent.services || []).map((service) => {
                    const ServiceIcon = getServiceIcon(service);
                    return (
                      <span
                        key={service}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg"
                      >
                        <ServiceIcon className="w-3.5 h-3.5" />
                        {service}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="font-bold text-red-600">
                    ${(selectedEvent.totalAmount - selectedEvent.advancePaid).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
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

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}