// AdminDashboard.jsx - Admin Dashboard Page
import React, { useState, useEffect } from "react";
import {
  Bed,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader
} from "lucide-react";
import { useSettings } from "../../../context/SettingsContext.jsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AdminDashboard() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('janro_token') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/reports`, {
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        
        const json = await res.json();
        setDashboardData(json.data);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!dashboardData) return null;

  const {
    totalRevenue = 0,
    totalBookings = 0,
    avgDailyRevenue = 0,
    occupancyRate = 0,
    revenueData = [],
    bookingData = [],
    weeklyOccupancy = [],
    todayCheckIns = 0,
    todayCheckOuts = 0,
    availableRooms = 0,
    monthlyRevenue = 0
  } = dashboardData;

  const getGrowth = (current, previous) => {
    if (!previous || previous === 0) {
      if (current > 0) return { change: "+100.0%", trend: "up" };
      return { change: "0.0%", trend: "up" };
    }
    let diff = ((current - previous) / previous) * 100;
    const sign = diff >= 0 ? "+" : "";
    return {
      change: `${sign}${diff.toFixed(1)}%`,
      trend: diff >= 0 ? "up" : "down"
    };
  };

  const revenueGrowth = getGrowth(
    revenueData.length >= 1 ? revenueData[revenueData.length - 1]?.revenue : 0,
    revenueData.length >= 2 ? revenueData[revenueData.length - 2]?.revenue : 0
  );

  const bookingsGrowth = getGrowth(
    bookingData.length >= 1 ? bookingData[bookingData.length - 1]?.bookings : 0,
    bookingData.length >= 2 ? bookingData[bookingData.length - 2]?.bookings : 0
  );

  const occupancyGrowth = getGrowth(
    occupancyRate,
    weeklyOccupancy.length >= 2 ? weeklyOccupancy[weeklyOccupancy.length - 2]?.occupancy : 0
  );

  const stats = [
    {
      title: "Total Revenue",
      value: `${settings?.currency?.symbol || 'Rs '}${totalRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}`,
      change: revenueGrowth.change,
      trend: revenueGrowth.trend,
      comparison: "vs last month",
      icon: DollarSign,
      color: "bg-[#D4AF37]/20 text-[#9A7812]",
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      change: occupancyGrowth.change,
      trend: occupancyGrowth.trend,
      comparison: "vs yesterday",
      icon: Bed,
      color: "bg-[#0F172A]/10 text-[#0F172A]",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      change: bookingsGrowth.change,
      trend: bookingsGrowth.trend,
      comparison: "vs last month",
      icon: Calendar,
      color: "bg-[#1E3A8A]/15 text-[#1E3A8A]",
    },
    {
      title: "Monthly Revenue",
      value: `${settings?.currency?.symbol || 'Rs '}${monthlyRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}`,
      change: revenueGrowth.change,
      trend: revenueGrowth.trend,
      comparison: "vs last month",
      icon: TrendingUp,
      color: "bg-[#F8FAFC] text-[#0F172A]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-slate-300 mt-2">
            Welcome back! Here&apos;s your hotel overview
          </p>
        </div>
        
        {/* Real-time Clock Widget */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md shadow-lg shadow-black/10 self-start md:self-center shrink-0">
          <div className="p-1.5 bg-[#D4AF37]/20 rounded-lg">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium tracking-wide text-xs sm:text-sm">{formatDate(currentTime)}</span>
            <span className="text-white/20 text-xs sm:text-sm">|</span>
            <span className="font-bold tracking-wider text-xs sm:text-sm text-[#D4AF37]">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <h3 className="text-2xl font-semibold text-[#0F172A] mt-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-[#9A7812]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${
                        stat.trend === "up"
                          ? "text-[#9A7812]"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-slate-500">{stat.comparison}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10">
          <h3 className="text-lg text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
            Revenue Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" width={80} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #D4AF37",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${settings?.currency?.symbol || 'Rs '}${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ fill: "#D4AF37", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10">
          <h3 className="text-lg text-[#0F172A] mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
            Weekly Occupancy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyOccupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #D4AF37",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, "Occupancy"]}
              />
              <Bar dataKey="occupancy" fill="#0F172A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/20 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-[#9A7812]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Check-ins</p>
              <h3 className="text-2xl font-semibold text-[#0F172A]">
                {todayCheckIns}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0F172A]/10 rounded-lg">
              <ArrowDownRight className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Today&apos;s Check-outs</p>
              <h3 className="text-2xl font-semibold text-[#0F172A]">
                {todayCheckOuts}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#0F172A]/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#1E3A8A]/15 rounded-lg">
              <Bed className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Available Rooms</p>
              <h3 className="text-2xl font-semibold text-[#0F172A]">
                {availableRooms}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
