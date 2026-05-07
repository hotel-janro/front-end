
import React, { useState } from 'react';
import { CreditCard, Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { payments } from '../../../data/newMockData.js';

export function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || payment.type === filterType;
    const matchesStatus = filterStatus === 'All' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'All' || payment.paymentMethod === filterMethod;
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
      case 'Room Booking': return 'bg-blue-100 text-blue-800';
      case 'Restaurant': return 'bg-orange-100 text-orange-800';
      case 'Wedding': return 'bg-pink-100 text-pink-800';
      case 'Pool': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayments = payments.length;
  const totalRevenue = payments.filter((p) => p.status === 'Completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'Pending').length;
  const successRate = ((payments.filter((p) => p.status === 'Completed').length / totalPayments) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Manage and track all payment transactions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CreditCard className="w-5 h-5" />New Payment
        </button>
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
            <div><p className="text-sm text-gray-600">Total Revenue</p><h3 className="text-2xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</h3></div>
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
              <option>All</option><option>Room Booking</option><option>Restaurant</option><option>Wedding</option><option>Pool</option><option>Other</option>
            </select>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Cash</option><option>Credit Card</option><option>Debit Card</option><option>Online Transfer</option><option>Mobile Payment</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Pending</option><option>Completed</option><option>Failed</option><option>Refunded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900 font-mono">{payment.transactionId}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{payment.customerName}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(payment.type)}`}>{payment.type}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">${payment.amount.toLocaleString()}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(payment.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(payment.date).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>{payment.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{payment.referenceNumber || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No payments found</p></div>)}
        </div>
      </div>
    </div>
  );
}
