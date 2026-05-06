import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Clock, CheckCircle, XCircle, DollarSign, Plus, TrendingUp, CreditCard } from 'lucide-react';
import { posOrders } from '../../../data/newMockData.js';

export function AdminPOS() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = posOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || order.type === filterType;
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Restaurant': return 'bg-orange-100 text-orange-800';
      case 'Pool': return 'bg-blue-100 text-blue-800';
      case 'Wedding': return 'bg-pink-100 text-pink-800';
      case 'Room Service': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrders = posOrders.length;
  const totalSales = posOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = posOrders.filter((o) => o.status === 'Pending').length;
  const todaySales = posOrders
    .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Orders & POS</h1>
          <p className="text-gray-500 mt-1">Point of sale and order management system</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />New Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg"><ShoppingCart className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-600">Total Orders</p><h3 className="text-2xl font-semibold text-gray-900">{totalOrders}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-600">Total Sales</p><h3 className="text-2xl font-semibold text-gray-900">${totalSales.toFixed(2)}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg"><TrendingUp className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-600">Pending Orders</p><h3 className="text-2xl font-semibold text-gray-900">{pendingOrders}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg"><CreditCard className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-sm text-gray-600">Today's Sales</p><h3 className="text-2xl font-semibold text-gray-900">${todaySales.toFixed(2)}</h3></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search by order number or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Restaurant</option><option>Pool</option><option>Wedding</option><option>Room Service</option><option>Other</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All</option><option>Pending</option><option>Completed</option><option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">{order.orderNumber}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{order.customerName}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(order.type)}`}>{order.type}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items?.slice(0, 2).map((item, idx) => (<div key={idx}>{item.quantity}x {item.name}</div>))}
                      {(order.items?.length || 0) > 2 && (<div className="text-xs text-gray-500">+{(order.items?.length || 0) - 2} more</div>)}
                      {(!order.items || order.items.length === 0) && <div className="text-gray-400 italic text-xs">No items specified</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Tax: ${order.tax.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No orders found</p></div>)}
        </div>
      </div>
    </div>
  );
}