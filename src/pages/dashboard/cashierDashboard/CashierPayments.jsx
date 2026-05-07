import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Wifi,
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { posOrders } from '../../../data/newMockData.js';

// Derive payment records from posOrders
const paymentRecords = posOrders
  .filter((o) => o.status === 'Completed' || o.status === 'Pending')
  .map((order, idx) => ({
    id: `PAY-${String(idx + 1).padStart(3, '0')}`,
    orderId: order.orderNumber,
    customerName: order.customerName,
    amount: order.totalAmount,
    tax: order.tax,
    method: order.paymentMethod,
    status: order.status === 'Completed' ? 'Settled' : 'Pending',
    date: order.createdAt,
    type: order.type,
  }));

export function CashierPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = paymentRecords.filter((p) => {
    const matchSearch =
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMethod = filterMethod === 'All' || p.method === filterMethod;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchMethod && matchStatus;
  });

  const totalSettled = paymentRecords
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentRecords
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTax = paymentRecords
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.tax, 0);

  const methodCounts = paymentRecords.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {});

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Card': return CreditCard;
      case 'Cash': return Banknote;
      case 'Online': return Wifi;
      case 'Room Charge': return DollarSign;
      default: return DollarSign;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'Card': return 'bg-blue-100 text-blue-700';
      case 'Cash': return 'bg-green-100 text-green-700';
      case 'Online': return 'bg-purple-100 text-purple-700';
      case 'Room Charge': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = [
    {
      label: 'Total Settled',
      value: `$${totalSettled.toFixed(2)}`,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Pending Amount',
      value: `$${totalPending.toFixed(2)}`,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Tax Collected',
      value: `$${totalTax.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600 border-violet-200',
      iconBg: 'bg-violet-100',
    },
    {
      label: 'Total Transactions',
      value: paymentRecords.length,
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track and manage all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
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

      {/* Payment Method Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(methodCounts).map(([method, count]) => {
          const MIcon = getMethodIcon(method);
          return (
            <div key={method} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getMethodColor(method)}`}>
                <MIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{method}</p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by payment ID, order, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="All">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
              <option value="Room Charge">Room Charge</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="All">All Status</option>
              <option value="Settled">Settled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((payment) => {
                const MIcon = getMethodIcon(payment.method);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-gray-900">{payment.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{payment.orderId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-900 font-medium">{payment.customerName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                        <MIcon className="w-3 h-3" />
                        {payment.method}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm text-gray-900">{new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'Settled' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500">Tax: ${payment.tax.toFixed(2)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No payments found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}