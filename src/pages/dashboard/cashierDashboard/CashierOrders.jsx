import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { apiFetch } from '../../../api.js';
import { toast } from 'sonner';

export function CashierOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || order.orderType === filterType;
    const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
      case 'Preparing': return Clock;
      case 'Completed': return CheckCircle;
      case 'Cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Dine-in': return 'bg-orange-100 text-orange-800';
      case 'Delivery': return 'bg-blue-100 text-blue-800';
      case 'Take-away': return 'bg-pink-100 text-pink-800';
      case 'Room': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track all live orders from Restaurant & Web</p>
        </div>
        <button 
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Clock className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
          >
            <option value="All">All Types</option>
            <option value="Dine-in">Dine-in</option>
            <option value="Room">Room Service</option>
            <option value="Delivery">Delivery</option>
            <option value="Take-away">Take-away</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading && orders.length === 0 ? (
           <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Fetching live orders...</p>
           </div>
        ) : filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.orderStatus);
          const isExpanded = expandedOrder === order._id;

          return (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Order Header */}
              <div
                className="px-5 py-4 cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getTypeColor(order.orderType)}`}>
                          {order.orderType}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.orderStatus}
                        </span>
                        {order.paymentStatus === 'Paid' ? (
                          <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">Paid</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-100 text-rose-800">Unpaid</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{order.customerName || 'Guest'}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {order.tableNumber && (
                           <>
                             <span className="text-xs text-gray-400">|</span>
                             <span className="text-xs font-bold text-orange-600">Table: {order.tableNumber}</span>
                           </>
                        )}
                        {order.roomNumber && (
                           <>
                             <span className="text-xs text-gray-400">|</span>
                             <span className="text-xs font-bold text-purple-600">Room: {order.roomNumber}</span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-[10px] text-gray-500">{order.items?.length || 0} item(s)</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {isExpanded && (
                <div className="px-5 pb-4 border-t border-gray-100">
                  <div className="pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-md">
                              <Package className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name} {item.portion ? `(${item.portion})` : ''}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.serviceCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Service Charge (10%)</span>
                          <span className="font-medium text-gray-900">{formatCurrency(order.serviceCharge)}</span>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery Fee</span>
                          <span className="font-medium text-gray-900">{formatCurrency(order.deliveryFee)}</span>
                        </div>
                      )}
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="font-medium text-rose-600">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100">
                        <span className="text-gray-900">Total</span>
                        <span className="text-teal-700">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}