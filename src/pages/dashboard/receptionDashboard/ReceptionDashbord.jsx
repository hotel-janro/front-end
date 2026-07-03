import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  LogIn,
  LogOut,
  Users2,
  Users,
  Waves,
  AlertTriangle,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { apiFetch } from '../../../api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function ReceptionDashboard() {
  const { settings } = useSettings();
  
  const [data, setData] = useState({
    todayCheckIns: [],
    todayCheckOuts: [],
    upcomingWeddings: [],
    activePoolBookings: [],
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    reservedRooms: 0,
    totalRooms: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data
        const [bookingsRes, roomsRes] = await Promise.all([
          apiFetch('/bookings').catch(() => ({ data: [] })),
          apiFetch('/rooms/admin/list').catch(() => ({ data: [] }))
        ]);
        
        const allBookings = bookingsRes.data || [];
        const allRooms = roomsRes.data || [];
        
        let poolBookings = [];
        try {
          const poolRes = await fetch(`${API_BASE}/api/pool-bookings`);
          if (poolRes.ok) {
            const poolData = await poolRes.json();
            poolBookings = poolData.bookings || [];
          }
        } catch(e) {}
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isToday = (dateString) => {
          if (!dateString) return false;
          const d = new Date(dateString);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        };

        const todayCheckIns = allBookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && isToday(b.checkInDate));
        const todayCheckOuts = allBookings.filter(b => b.status === 'checked-in' && isToday(b.checkOutDate));
        
        const occupiedRooms = allBookings.filter(b => b.status === 'checked-in').length;
        const reservedRooms = allBookings.filter(b => b.status === 'confirmed').length;

        const activeRooms = allRooms.filter(room => room.isActive !== false);
        const totalRooms = activeRooms.reduce(
          (acc, room) => acc + (Number(room.totalRooms) || Number(room.availableRooms) || 0),
          0
        );
        const availableRooms = activeRooms.reduce(
          (acc, room) => acc + (Number(room.availableRooms) || 0),
          0
        );
        
        const activePoolBookings = poolBookings.filter(p => p.status === 'Confirmed' || p.status === 'Checked-In');
        
        setData({
          todayCheckIns,
          todayCheckOuts,
          upcomingWeddings: [], // API not fully implemented yet for all bookings
          activePoolBookings,
          occupiedRooms,
          availableRooms: availableRooms > 0 ? availableRooms : 0,
          maintenanceRooms: 0,
          reservedRooms,
          totalRooms: totalRooms > 0 ? totalRooms : 1 // prevent division by zero
        });
        
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const quickStats = [
    {
      label: "Today's Check-ins",
      value: data.todayCheckIns.length,
      icon: LogIn,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconBg: 'bg-emerald-100',
    },
    {
      label: "Today's Check-outs",
      value: data.todayCheckOuts.length,
      icon: LogOut,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Available Rooms',
      value: data.availableRooms,
      icon: Bed,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Occupied Rooms',
      value: data.occupiedRooms,
      icon: Users,
      color: 'bg-violet-50 text-violet-600 border-violet-200',
      iconBg: 'bg-violet-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
            <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
              Good {getGreeting()}! Welcome to Reception
            </h1>
            <p className="text-slate-300 mt-2">
              Here's your daily overview
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/reception/bookings"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                Manage Bookings
              </Link>
              <Link
                to="/reception/rooms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium transition-colors text-white"
              >
                <Bed className="w-4 h-4 text-[#D4AF37]" />
                Room Status
              </Link>
            </div>
          </div>
          
          {/* Real-time Clock Widget */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-lg shadow-black/10 self-start md:self-center shrink-0">
            <div className="p-1.5 bg-[#D4AF37]/20 rounded-lg">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium tracking-wide text-xs sm:text-sm">{formatDate(currentTime)}</span>
              <span className="text-white/20 text-xs sm:text-sm">|</span>
              <span className="font-bold tracking-wider text-xs sm:text-sm text-[#D4AF37]">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-xl border p-4 ${stat.color}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium opacity-80">{stat.label}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Occupancy Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Room Occupancy Overview</h2>
          <Link
            to="/reception/rooms"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex rounded-full overflow-hidden h-6 bg-gray-100">
          <div
            className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(data.occupiedRooms / data.totalRooms) * 100}%` }}
            title={`Occupied: ${data.occupiedRooms}`}
          >
            {data.occupiedRooms > 0 && data.occupiedRooms}
          </div>
          <div
            className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(data.reservedRooms / data.totalRooms) * 100}%` }}
            title={`Reserved: ${data.reservedRooms}`}
          >
            {data.reservedRooms > 0 && data.reservedRooms}
          </div>
          <div
            className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(data.availableRooms / data.totalRooms) * 100}%` }}
            title={`Available: ${data.availableRooms}`}
          >
            {data.availableRooms > 0 && data.availableRooms}
          </div>
          <div
            className="bg-red-400 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(data.maintenanceRooms / data.totalRooms) * 100}%` }}
            title={`Maintenance: ${data.maintenanceRooms}`}
          >
            {data.maintenanceRooms > 0 && data.maintenanceRooms}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Occupied ({data.occupiedRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-400" /> Reserved ({data.reservedRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Available ({data.availableRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-red-400" /> Maintenance ({data.maintenanceRooms})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Check-ins */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <LogIn className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Pending Check-ins</h2>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              {data.todayCheckIns.length} guests
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {data.todayCheckIns.length > 0 ? (
              data.todayCheckIns.map((booking) => (
                <div key={booking._id || Math.random()} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.fullName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{booking.room?.name || 'Unassigned'}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{booking.guests} guest(s)</span>
                      </div>
                    </div>
                    <Link to="/reception/bookings" className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap">
                      Check In
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending check-ins today</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Check-outs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <LogOut className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Pending Check-outs</h2>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              {data.todayCheckOuts.length} guests
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {data.todayCheckOuts.length > 0 ? (
              data.todayCheckOuts.map((booking) => (
                <div key={booking._id || Math.random()} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.fullName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{booking.room?.name || 'Unassigned'}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{settings.currency.symbol}{booking.totalPrice}</span>
                      </div>
                    </div>
                    <Link to="/reception/bookings" className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap">
                      Check Out
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending check-outs today</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-pink-100 rounded-lg">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
            </div>
            <Link
              to="/reception/wedding"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {data.upcomingWeddings.length > 0 ? data.upcomingWeddings.map((event) => (
              <div key={event.id || Math.random()} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{event.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{event.hallName}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                    {event.guestCount} guests
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center">
                <Heart className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming events currently linked.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pool Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <Waves className="w-4 h-4 text-cyan-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Pool Bookings</h2>
            </div>
            <Link
              to="/reception/pool"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {data.activePoolBookings.length > 0 ? data.activePoolBookings.map((booking) => (
              <div key={booking._id || Math.random()} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{booking.guestName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{booking.timeSlot}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500">{booking.numberOfGuests} guests</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      booking.status === 'Checked-In'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            )) : (
               <div className="px-5 py-8 text-center">
                <Waves className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active pool bookings today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
