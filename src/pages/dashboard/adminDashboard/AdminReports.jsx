import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, BarChart3, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSettings } from '../../../context/SettingsContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AdminReports() {
  const { settings } = useSettings();
  const [reportType, setReportType] = useState('All Reports');
  const [dateRange, setDateRange] = useState('This Month');
  const [serviceType, setServiceType] = useState('All Services');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('janro_token') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/reports?dateRange=${encodeURIComponent(dateRange)}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const json = await res.json();
        setReportData(json.data);
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('janro_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(data.message || 'Report exported successfully!');
      } else {
        throw new Error(data.message || 'Failed to export report');
      }
    } catch (err) {
      alert(err.message || 'Error exporting report');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
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

  if (!reportData) return null;

  const {
    serviceData,
    bookingData,
    revenueData,
    totalRevenue,
    totalBookings,
    avgDailyRevenue,
    metrics
  } = reportData;

  const filteredServiceData = serviceData.filter(s => serviceType === 'All Services' || s.name === serviceType);
  const showRevenue = reportType === 'All Reports' || reportType === 'Revenue';
  const showBookings = reportType === 'All Reports' || reportType === 'Bookings';
  const showServices = reportType === 'All Reports' || reportType === 'Services' || reportType === 'Revenue';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">Hotel Janro</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Reports & Analytics
          </h1>
          <p className="text-slate-300 mt-2">
            View comprehensive business reports and insights
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-xl font-medium transition-colors shadow-lg shadow-[#D4AF37]/20 self-start sm:self-center whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isExporting ? 'Exporting...' : 'Export Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg"><DollarSign className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-600">Total Revenue</p><h3 className="text-2xl font-semibold text-gray-900">{settings.currency.symbol}{totalRevenue.toLocaleString()}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-600">Growth Rate</p><h3 className="text-2xl font-semibold text-gray-900">+12.5%</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg"><BarChart3 className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-sm text-gray-600">Total Bookings</p><h3 className="text-2xl font-semibold text-gray-900">{totalBookings}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg"><FileText className="w-6 h-6 text-orange-600" /></div>
            <div><p className="text-sm text-gray-600">Avg. Daily Revenue</p><h3 className="text-2xl font-semibold text-gray-900">{settings.currency.symbol}{avgDailyRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}</h3></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Reports</option><option>Revenue</option><option>Bookings</option><option>Services</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Today</option><option>This Week</option><option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option><option>All Time</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Services</option><option>Rooms</option><option>Restaurant</option><option>Wedding</option><option>Pool</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showRevenue && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue (Last 6 Months)</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip formatter={(value) => [`${settings.currency.symbol}${value}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}

        {showServices && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue by Service</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={filteredServiceData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {filteredServiceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip formatter={(value) => [`${settings.currency.symbol}${value}`, "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        )}

        {showBookings && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Booking Trends (Last 6 Months)</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="bookings" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}

        {(showRevenue || showBookings) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h2>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-semibold text-gray-900">{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${metric.color} h-2 rounded-full`} style={{ width: metric.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {showServices && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Summary by Service</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServiceData.map((service) => {
                const filteredTotal = filteredServiceData.reduce((sum, item) => sum + item.value, 0);
                return (
                <tr key={service.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: service.color }} />
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{settings.currency.symbol}{service.value.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{filteredTotal > 0 ? ((service.value / filteredTotal) * 100).toFixed(1) : 0}%</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
