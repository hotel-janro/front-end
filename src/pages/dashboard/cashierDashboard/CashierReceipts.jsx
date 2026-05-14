import React, { useState, useEffect } from 'react';
import {
  Gem,
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
    .map((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
      const dailySequenceNum = sameDayOrders.length - sameDayOrders.indexOf(order);

      return {
        id: `REC-${order._id.slice(-6).toUpperCase()}`,
        orderId: order._id,
        orderNumber: `#${order._id.slice(-8).toUpperCase()}`,
        dailySequenceNum,
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
      };
    });

  const filtered = receipts.filter((r) =>
    (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-lg">
            <Gem className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Receipts</h1>
            <p className="text-gray-500 text-xs font-medium">Boutique Transaction History</p>
          </div>
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

      {/* Luxury Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && orders.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium tracking-widest uppercase text-[10px]">Curating your records...</p>
          </div>
        ) : filtered.map((receipt) => (
          <div key={receipt.orderId} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_80px_-30px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/40 transition-all duration-700 overflow-hidden relative">
            {/* Luxury Card Header */}
            <div className="px-7 py-6 bg-gradient-to-br from-slate-50/50 to-white border-b border-slate-50 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-center group-hover:rotate-[15deg] group-hover:border-[#D4AF37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-500">
                    <Gem className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{receipt.id}</p>
                      <span className="px-2 py-0.5 bg-[#0F172A] text-[#D4AF37] text-[7px] font-black uppercase tracking-widest rounded-md">
                        Order {receipt.dailySequenceNum.toString().padStart(3, '0')}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{receipt.orderNumber}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  {receipt.status}
                </span>
              </div>
            </div>

            {/* Luxury Card Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Guest</p>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{receipt.customerName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Date</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-700 uppercase">
                    {new Date(receipt.issuedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CreditCard className="w-3 h-3" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Payment</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-700 uppercase">{receipt.paymentMethod}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{receipt.items.length} Items</span>
                </div>
                <span className="text-[8px] font-black text-[#D4AF37] uppercase bg-[#D4AF37]/5 px-2 py-0.5 rounded-full border border-[#D4AF37]/10">{receipt.type}</span>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Settled Amount</p>
                  <p className="text-xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    {formatCurrency(receipt.total)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(receipt)}
                  className="w-12 h-12 bg-[#0F172A] text-[#D4AF37] rounded-2xl shadow-lg hover:bg-white hover:text-[#0F172A] hover:border border-slate-100 transition-all duration-500 flex items-center justify-center group/btn"
                  title="View Details"
                >
                  <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
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
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-[400px] border border-white/20 relative overflow-hidden">
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
            <div className="px-6 py-4">
              {/* Header */}
              <div className="text-center mb-3">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{settings.hotelName}</h2>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold tracking-widest">{settings.address}</p>
                <p className="text-[10px] text-gray-400 font-bold">Tel: {settings.phone}</p>
                <div className="mt-2 border-t border-dashed border-slate-200 pt-2">
                  <p className="text-sm font-black text-slate-800 tracking-widest">{selectedReceipt.id}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(selectedReceipt.issuedAt).toLocaleDateString('en-GB')} | {new Date(selectedReceipt.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Details</p>
                <p className="text-sm font-black text-[#0F172A] uppercase">{selectedReceipt.customerName}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-0.5 tracking-wider">
                  Order: {selectedReceipt.orderNumber} | {selectedReceipt.type}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Order Summary</p>
                <div className="max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                        {item.portion && <span className="text-[8px] font-bold text-[#D4AF37] uppercase">{item.portion}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 mr-3">x{item.quantity}</span>
                        <span className="text-[11px] font-black text-slate-900">{formatCurrency(item.quantity * item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-200 pt-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                </div>
                {selectedReceipt.serviceCharge > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Service (10%)</span>
                    <span>{formatCurrency(selectedReceipt.serviceCharge)}</span>
                  </div>
                )}
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-rose-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Net Total</span>
                  <span className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(selectedReceipt.total)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 text-center border-t border-dashed border-slate-200 pt-3">
                <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Boutique Experience by Janro</p>
                <p className="text-[8px] font-bold text-slate-400 mt-0.5">Please retain this computer-generated receipt</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return alert('Pop-up blocked! Please allow pop-ups for printing.');

                  const itemsHtml = selectedReceipt.items.map(it => `
                    <tr>
                      <td style="padding: 4px 0;">${it.name} ${it.portion ? `<br/><span style="font-size: 8px; color: #666;">(${it.portion})</span>` : ''}</td>
                      <td style="text-align: center; color: #666;">x${it.quantity}</td>
                      <td style="text-align: right; font-weight: bold;">${formatCurrency(it.price * it.quantity)}</td>
                    </tr>
                  `).join('');

                  printWindow.document.write(`
                    <html>
                      <head>
                        <style>
                          @media print { @page { margin: 0; } body { margin: 0.2cm; } }
                          body { 
                            font-family: 'Courier New', Courier, monospace; 
                            font-size: 11px; 
                            line-height: 1.2; 
                            color: #000; 
                            width: 100%; 
                            max-width: 300px;
                            margin: 0 auto;
                          }
                          .header { text-align: center; margin-bottom: 8px; }
                          .divider { border-top: 1px dashed #000; margin: 4px 0; }
                          table { width: 100%; border-collapse: collapse; }
                          .total-row { font-weight: bold; font-size: 13px; }
                          .footer { text-align: center; margin-top: 10px; font-size: 9px; }
                          .badge { display: inline-block; padding: 2px 4px; border: 1px solid #000; font-weight: bold; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h2 style="margin:0; font-size: 18px;">HOTEL JANRO</h2>
                          <p style="margin:1px 0;">Malwana Road, Dompe</p>
                          <p style="margin:1px 0;">Tel: 011-1234567</p>
                        </div>
                        <div class="divider"></div>
                        <div style="display:flex; justify-content:space-between;">
                          <span>Ref: ${selectedReceipt.id}</span>
                          <span>${new Date(selectedReceipt.issuedAt).toLocaleDateString()}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                           <span>Time: ${new Date(selectedReceipt.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <span class="badge">${selectedReceipt.type.toUpperCase()}</span>
                        </div>
                        <div style="margin-top:2px;">Guest: ${selectedReceipt.customerName}</div>
                        
                        <div class="divider"></div>
                        <table>
                          <thead>
                            <tr style="border-bottom: 1px dashed #000;">
                              <th style="text-align: left;">ITEM</th>
                              <th style="width: 30px;">QTY</th>
                              <th style="text-align: right; width: 70px;">PRICE</th>
                            </tr>
                          </thead>
                          <tbody>${itemsHtml}</tbody>
                        </table>
                        <div class="divider"></div>
                        
                        <div style="text-align: right; space-y: 2px;">
                          <div>Subtotal: ${formatCurrency(selectedReceipt.subtotal)}</div>
                          ${selectedReceipt.serviceCharge > 0 ? `<div>Service (10%): ${formatCurrency(selectedReceipt.serviceCharge)}</div>` : ''}
                          ${selectedReceipt.deliveryFee > 0 ? `<div>Delivery: ${formatCurrency(selectedReceipt.deliveryFee)}</div>` : ''}
                          ${selectedReceipt.discount > 0 ? `<div>Discount: -${formatCurrency(selectedReceipt.discount)}</div>` : ''}
                          <div class="divider"></div>
                          <div class="total-row">NET TOTAL: ${formatCurrency(selectedReceipt.total)}</div>
                        </div>

                        <div class="footer">
                          <p style="margin: 5px 0;">*** Thank You! ***</p>
                          <p style="margin: 0;">Please retain this bill.</p>
                          <p style="margin: 0; font-size: 7px; color: #666;">Boutique Experience by Janro</p>
                        </div>
                        <script>
                          setTimeout(function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                            setTimeout(function() { window.close(); }, 2000);
                          }, 500);
                        </script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0F172A] text-[#D4AF37] rounded-2xl hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
