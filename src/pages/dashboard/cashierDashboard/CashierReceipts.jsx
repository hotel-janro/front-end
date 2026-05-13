import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Eye,
  X,
  CheckCircle,
  Package,
  Calendar,
  User,
  CreditCard,
  FileText,
} from 'lucide-react';
import { apiFetch } from '../../../api.js';
import { useSettings } from '../../../context/SettingsContext.jsx';


export function CashierReceipts() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const receipts = orders
    .filter((o) => o.paymentStatus === 'Paid' || o.orderStatus === 'Completed')
    .map((order) => ({
      id: `REC-${order._id.slice(-6).toUpperCase()}`,
      orderId: order._id,
      orderNumber: `#${order._id.slice(-8).toUpperCase()}`,
      customerName: order.customerName || 'Guest',
      items: order.items || [],
      subtotal: order.subtotal || 0,
      serviceCharge: order.serviceCharge || 0,
      deliveryFee: order.deliveryFee || 0,
      discount: order.discount || 0,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod || 'Cash',
      type: order.orderType,
      issuedAt: order.updatedAt || order.createdAt,
      status: 'Issued',
    }));

  const filtered = receipts.filter((r) =>
    (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500 mt-1">View and manage issued receipts from real transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
            {receipts.length} receipt(s) issued
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts by ID, order number, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && orders.length === 0 ? (
           <div className="col-span-full py-20 text-center">
              <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading receipts...</p>
           </div>
        ) : filtered.map((receipt) => (
          <div
            key={receipt.orderId}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
          >
            {/* Receipt Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-100 rounded-lg">
                    <Receipt className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{receipt.id}</p>
                    <p className="text-[10px] text-gray-500">{receipt.orderNumber}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  {receipt.status}
                </span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{receipt.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">
                  {new Date(receipt.issuedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{receipt.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{receipt.items.length} item(s) - {receipt.type}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-teal-700">{formatCurrency(receipt.total)}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSelectedReceipt(receipt)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="View Receipt"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No receipts found</p>
            <p className="text-sm text-gray-400 mt-1">Completed orders will appear here as receipts</p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Receipt Details</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="px-6 py-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{settings.hotelName.toUpperCase()}</h2>
                <p className="text-xs text-gray-500 mt-1">{settings.address}</p>
                <p className="text-xs text-gray-500">Tel: {settings.phone}</p>
                <div className="mt-3 border-t border-dashed border-gray-300 pt-3">
                  <p className="text-sm font-semibold text-gray-700">{selectedReceipt.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedReceipt.issuedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-semibold text-gray-900">{selectedReceipt.customerName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order: {selectedReceipt.orderNumber} | {selectedReceipt.type}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</p>
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1.5">
                    <div>
                      <span className="text-gray-900">{item.name} {item.portion ? `(${item.portion})` : ''}</span>
                      <span className="text-gray-400 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(selectedReceipt.subtotal)}</span>
                </div>
                {selectedReceipt.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service Charge (10%)</span>
                    <span className="text-gray-900">{formatCurrency(selectedReceipt.serviceCharge)}</span>
                  </div>
                )}
                {selectedReceipt.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="text-gray-900">{formatCurrency(selectedReceipt.deliveryFee)}</span>
                  </div>
                )}
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-rose-600">-{formatCurrency(selectedReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-300 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-teal-700">{formatCurrency(selectedReceipt.total)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center border-t border-dashed border-gray-300 pt-4">
                <p className="text-xs text-gray-500">Thank you for choosing {settings.hotelName}!</p>
                <p className="text-[10px] text-gray-400 mt-1">This is a computer-generated receipt</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium">
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}