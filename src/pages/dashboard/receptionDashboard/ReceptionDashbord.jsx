import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  DollarSign,
  Grid3X3,
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
import { dashboardStats } from '../../../data/mockData.js';
import { bookings } from '../../../data/mockData.js';
import { rooms } from '../../../data/mockData.js';
import { poolBookings, weddingBookings } from '../../../data/newMockData.js';

export function ReceptionDashboard() {
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();

  const handleTabClick = (tabLabel) => {
    setActiveTab(tabLabel);
    if (tabLabel === 'Pool Access') {
      navigate('/reception/pool');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const panelDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const panelTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const receptionTabs = [
    { label: 'Dashboard', icon: Grid3X3 },
    { label: 'Bookings', icon: Calendar },
    { label: 'Rooms', icon: Bed },
    { label: 'Wedding Events', icon: Heart },
    { label: 'Pool Access', icon: Waves },
    { label: 'Customers', icon: Users2 },
  ];

  const todayCheckIns = bookings.filter((b) => b.status === 'Confirmed');
  const todayCheckOuts = bookings.filter((b) => b.status === 'Checked-In');
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;
  const reservedRooms = rooms.filter((r) => r.status === 'Reserved').length;
  const totalRooms = rooms.length;

  const upcomingWeddings = weddingBookings.filter((w) => w.status === 'Confirmed');
  const activePoolBookings = poolBookings.filter(
    (p) => p.status === 'Confirmed' || p.status === 'Checked-In'
  );

  const quickStats = [
    {
      label: "Today's Check-ins",
      value: todayCheckIns.length,
      icon: LogIn,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconBg: 'bg-emerald-100',
    },
    {
      label: "Today's Check-outs",
      value: todayCheckOuts.length,
      icon: LogOut,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Available Rooms',
      value: availableRooms,
      icon: Bed,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Occupied Rooms',
      value: occupiedRooms,
      icon: Users,
      color: 'bg-violet-50 text-violet-600 border-violet-200',
      iconBg: 'bg-violet-100',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm">
        <div className="bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl leading-none font-bold tracking-tight">HotelPro</h2>
                <p className="text-white/80 text-sm mt-1">Reception Panel</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium">
                {panelDate} | {panelTime}
              </div>
              <button
                type="button"
                className="relative w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-[11px] leading-5 font-bold text-white text-center">
                  3
                </span>
              </button>
              <div className="rounded-2xl bg-white/10 border border-white/20 px-3 py-2 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">SD</div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Sarah Desk</p>
                  <p className="text-xs text-white/75">Front Desk Agent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600 px-2 sm:px-4 pb-3">
          <div className="overflow-x-auto">
            <div className="min-w-max flex items-center gap-2">
              {receptionTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.label;

                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => handleTabClick(tab.label)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-white text-indigo-700'
                        : 'text-white/85 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="160" cy="50" r="40" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Good {getGreeting()}! Welcome to Reception</h1>
          <p className="text-indigo-100 mt-1">
            Here's your daily overview for{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              to="/reception/bookings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Manage Bookings
            </Link>
            <Link
              to="/reception/rooms"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors"
            >
              <Bed className="w-4 h-4" />
              Room Status
            </Link>
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
            style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }}
            title={`Occupied: ${occupiedRooms}`}
          >
            {occupiedRooms > 0 && occupiedRooms}
          </div>
          <div
            className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(reservedRooms / totalRooms) * 100}%` }}
            title={`Reserved: ${reservedRooms}`}
          >
            {reservedRooms > 0 && reservedRooms}
          </div>
          <div
            className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(availableRooms / totalRooms) * 100}%` }}
            title={`Available: ${availableRooms}`}
          >
            {availableRooms > 0 && availableRooms}
          </div>
          <div
            className="bg-red-400 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }}
            title={`Maintenance: ${maintenanceRooms}`}
          >
            {maintenanceRooms > 0 && maintenanceRooms}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Occupied ({occupiedRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-400" /> Reserved ({reservedRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Available ({availableRooms})
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-red-400" /> Maintenance ({maintenanceRooms})
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
              {todayCheckIns.length} guests
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {todayCheckIns.length > 0 ? (
              todayCheckIns.map((booking) => (
                <div key={booking.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">Room {booking.roomNumber}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{booking.roomType}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{booking.guests} guest(s)</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap">
                      Check In
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending check-ins</p>
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
              {todayCheckOuts.length} guests
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {todayCheckOuts.length > 0 ? (
              todayCheckOuts.map((booking) => (
                <div key={booking.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{booking.guestName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">Room {booking.roomNumber}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">${booking.totalAmount}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">
                          Out: {new Date(booking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap">
                      Check Out
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending check-outs</p>
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
          <div className="divide-y divide-gray-50">
            {upcomingWeddings.map((event) => (
              <div key={event.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
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
            ))}
          </div>
        </div>

        {/* Pool Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <Waves className="w-4 h-4 text-cyan-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Pool Bookings Today</h2>
            </div>
            <Link
              to="/reception/pool"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activePoolBookings.map((booking) => (
              <div key={booking.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
