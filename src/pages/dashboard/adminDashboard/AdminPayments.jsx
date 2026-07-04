import React, { useState, useEffect } from 'react';
import { CreditCard, Search, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AdminPayments() {
  const { settings } = useSettings();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('janro_token');
      const res = await fetch(`${API_BASE}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const customerName = payment.user?.name || "Guest";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || payment.onModel === filterType;
    const matchesStatus = filterStatus === 'All' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'All' || payment.method === filterMethod;
    return matchesSearch && matchesType && matchesStatus && matchesMethod;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Booking': return 'bg-blue-100 text-blue-800';
      case 'Order': return 'bg-orange-100 text-orange-800';
      case 'WeddingBooking': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayments = payments.length;
  const totalRevenue = payments.filter((p) => p.status === 'Completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'Pending').length;
  const successRate = totalPayments > 0 ? ((payments.filter((p) => p.status === 'Completed').length / totalPayments) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings?.hotelName || "HOTEL JANRO"}</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Payments
          </h1>
          <p className="text-slate-300 mt-2">
            Manage and track all payment transactions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg"><CreditCard className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-600">Total Transactions</p><h3 className="text-2xl font-semibold text-gray-900">{totalPayments}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-600">Total Revenue</p><h3 className="text-2xl font-semibold text-gray-900">Rs {totalRevenue.toLocaleString()}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg"><Clock className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-600">Pending</p><h3 className="text-2xl font-semibold text-gray-900">{pendingPayments}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg"><CheckCircle className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-sm text-gray-600">Success Rate</p><h3 className="text-2xl font-semibold text-gray-900">{successRate}%</h3></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search by transaction ID or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Booking</option><option>Order</option><option>WeddingBooking</option>
            </select>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Cash</option><option>Card</option><option>Online</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Pending</option><option>Completed</option><option>Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Loading payments...</p></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900 font-mono">{payment._id.slice(-8).toUpperCase()}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{payment.user?.name || "Guest"}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(payment.onModel)}`}>{payment.onModel}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">Rs {payment.amount.toLocaleString()}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>{payment.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{payment.referenceId ? payment.referenceId.slice(-6).toUpperCase() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredPayments.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No payments found</p></div>)}
        </div>
      </div>
    </div>
  );
}
