import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, BarChart3, Loader, Mail } from 'lucide-react';
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
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmail, setExportEmail] = useState('');
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'download'
  const [downloadCategory, setDownloadCategory] = useState('rooms'); // 'rooms', 'pool', 'wedding', 'restaurant'

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

  const handleExport = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsExporting(true);
      const token = localStorage.getItem('janro_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          dateRange,
          email: exportEmail
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(data.message || 'Report exported successfully!');
        setShowExportModal(false);
      } else {
        throw new Error(data.message || 'Failed to export report');
      }
    } catch (err) {
      alert(err.message || 'Error exporting report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsExporting(true);
      const token = localStorage.getItem('janro_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/reports/download?dateRange=${encodeURIComponent(dateRange)}&category=${downloadCategory}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to download report');
      }
      
      const disposition = res.headers.get('content-disposition');
      let filename = `${downloadCategory}_report_${dateRange.replace(/\s+/g, '_')}.csv`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (err) {
      alert(err.message || 'Error downloading report');
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

  const getMetricStyleColor = (colorClass) => {
    switch (colorClass) {
      case 'bg-blue-600':
        return '#3B82F6';
      case 'bg-orange-600':
        return '#F97316';
      case 'bg-cyan-600':
        return '#06B6D4';
      case 'bg-pink-600':
        return '#EC4899';
      case 'bg-red-600':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const filteredServiceData = serviceData.filter(s => serviceType === 'All Services' || s.name === serviceType);
  const showRevenue = reportType === 'All Reports' || reportType === 'Revenue';
  const showBookings = reportType === 'All Reports' || reportType === 'Bookings';
  const showServices = reportType === 'All Reports' || reportType === 'Services' || reportType === 'Revenue';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Reports & Analytics
          </h1>
          <p className="text-slate-300 mt-2">
            View comprehensive business reports and insights
          </p>
        </div>
        <button 
          onClick={() => {
            setExportEmail(localStorage.getItem('janro_user') ? JSON.parse(localStorage.getItem('janro_user')).email : '');
            setShowExportModal(true);
          }}
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
            <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" width={80} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip formatter={(value) => [`${settings.currency.symbol}${Number(value).toFixed(2)}`, "Revenue"]} />
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
              <Tooltip formatter={(value) => [`${settings.currency.symbol}${Number(value).toFixed(2)}`, "Revenue"]} />
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
                  <div className="h-2 rounded-full" style={{ width: metric.width, backgroundColor: getMetricStyleColor(metric.color) }} />
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
      {/* Export/Download Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Export Business Report</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select export option for the <strong>{dateRange}</strong> report.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'email'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Send via Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('download')}
                className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'download'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Download to Device
              </button>
            </div>
            
            {activeTab === 'email' ? (
              <form onSubmit={handleExport} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. manager@hoteljanro.com"
                      value={exportEmail}
                      onChange={(e) => setExportEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    * A professional HTML report will be sent immediately to this address.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-[#1E293B] transition-all shadow-lg shadow-gray-200 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isExporting ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {isExporting ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDownload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Category</label>
                  <select
                    value={downloadCategory}
                    onChange={(e) => setDownloadCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                  >
                    <option value="rooms">Room Bookings CSV</option>
                    <option value="pool">Pool Bookings CSV</option>
                    <option value="wedding">Wedding Bookings CSV</option>
                    <option value="restaurant">Restaurant Orders CSV</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-2">
                    * Detailed transaction listing for {dateRange} will be downloaded as a CSV sheet.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExporting}
                    className="flex-1 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-[#1E293B] transition-all shadow-lg shadow-gray-200 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isExporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Downloading...' : 'Download CSV'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
