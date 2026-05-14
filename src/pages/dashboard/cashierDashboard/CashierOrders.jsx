/**
 * CashierOrders.jsx
 * Boutique Cashier Management Interface.
 * Real-time order monitoring, settlement processing, and receipt generation.
 */
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
  Gem,
  RefreshCcw,
  User,
  CreditCard,
  Banknote,
  X,
  Calendar,
  Printer,
  Trash2
} from 'lucide-react';
import { apiFetch } from '../../../api.js';
import { toast } from 'sonner';

export function CashierOrders() {
  // --- 1. COMPONENT STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settlement States
  const [settlingOrder, setSettlingOrder] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [isSettling, setIsSettling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // --- 2. DATA ACTIONS ---
  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
      setLastPollTime(new Date());
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

  // --- 3. UI STYLE HELPERS ---
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
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

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Dine-in': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Delivery': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Take-away': return 'bg-pink-50 text-pink-600 border-pink-100';
      case 'Room': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  // --- 4. BUSINESS LOGIC (Settlement & Cancellation) ---
  const handleSettleOrder = async () => {
    if (!settlingOrder) return;
    const received = Number(cashReceived || 0);
    const balance = Math.max(received - settlingOrder.totalAmount, 0);

    if (received < settlingOrder.totalAmount) {
      toast.error("Insufficient amount received");
      return;
    }

    try {
      setIsSettling(true);
      await apiFetch(`/orders/${settlingOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          paymentStatus: 'Paid',
          paymentMethod: 'Cash',
          amountReceived: received,
          balance: balance,
          orderStatus: settlingOrder.orderStatus === 'Pending' ? 'Preparing' : settlingOrder.orderStatus
        })
      });

      toast.success(`Order ${settlingOrder._id.slice(-6).toUpperCase()} settled successfully!`);
      setSettlingOrder(null);
      setCashReceived('');
      loadOrders();
    } catch (error) {
      toast.error("Failed to settle order");
    } finally {
      setIsSettling(false);
    }
  };

  // --- 5. THERMAL PRINTING LOGIC ---
  const handlePrintReceipt = (order) => {
    if (!order) return toast.error("No order data provided");
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast.error('Pop-up blocked! Please click the icon in your browser address bar to allow pop-ups.');

    const itemsHtml = (order.items || []).map(it => `
      <tr>
        <td style="padding: 2px 0;">
          ${it?.name || 'Item'}
          ${it?.portion ? `<br/><span style="font-size: 8px; color: #333;">(${it.portion})</span>` : ''}
        </td>
        <td style="text-align: center;">${it?.quantity || 1}</td>
        <td style="text-align: right;">${((Number(it?.price) || 0) * (Number(it?.quantity) || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

    // Calculate daily sequence number
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
    const dailyNum = sameDayOrders.length - sameDayOrders.indexOf(order);
    const dailySeqStr = dailyNum.toString().padStart(3, '0');

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
          <div style="text-align: center; margin-bottom: 5px;">
            <div style="font-size: 16px; font-weight: bold; border: 2px solid #000; display: inline-block; padding: 4px 10px;">ORDER #${dailySeqStr}</div>
          </div>
          <div class="divider"></div>
          <div style="display:flex; justify-content:space-between;">
            <span>ID: #${(order?._id || "").slice(-6).toUpperCase()}</span>
            <span>${order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
             <span>Time: ${order?.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
             <span class="badge">${(order?.orderType || "").toUpperCase()}</span>
          </div>
          ${order?.customerName ? `<div>Guest: ${order.customerName}</div>` : ''}
          <div class="divider"></div>
          <table>
            <thead>
              <tr style="border-bottom: 1px dashed #000;">
                <th style="text-align: left;">ITEM</th>
                <th style="width: 30px;">QTY</th>
                <th style="text-align: right; width: 70px;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="text-align: right; space-y: 2px;">
            <div>Subtotal: Rs ${(order.subtotal || 0).toLocaleString()}</div>
            ${order.serviceCharge > 0 ? `<div>Service (10%): Rs ${order.serviceCharge.toLocaleString()}</div>` : ''}
            ${order.deliveryFee > 0 ? `<div>Delivery Fee: Rs ${order.deliveryFee.toLocaleString()}</div>` : ''}
            ${order.discount > 0 ? `<div>Discount: -Rs ${order.discount.toLocaleString()}</div>` : ''}
            <div class="divider"></div>
            <div class="total-row">NET TOTAL: Rs ${(order.totalAmount || 0).toLocaleString()}</div>
          </div>
          <div class="footer">
            <p style="margin: 5px 0;">*** Thank You! ***</p>
            <p style="margin: 0;">Generated by Antigravity OS</p>
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
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: 'Cancelled' })
      });
      toast.success("Order cancelled");
      loadOrders();
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(15,23,42,0.4)]">
            <Gem className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-wider">Live Orders</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Real-time Boutique Operations</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button 
            onClick={loadOrders}
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-[#0F172A] hover:text-[#D4AF37] hover:border-[#0F172A] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl active:scale-95"
          >
            <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            Refresh Live Stream
          </button>
          <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest pr-2">
            Last Sync: {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Luxury Search & Filters */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white shadow-[0_10px_50px_-20px_rgba(0,0,0,0.05)] p-2">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Locate an order or guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-300"
            />
          </div>
          <div className="h-12 w-px bg-slate-100 hidden lg:block" />
          <div className="flex gap-2 p-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-6 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[140px] text-center"
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
              className="px-6 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[140px] text-center"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Preparing">Preparing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {loading && orders.length === 0 ? (
           <div className="py-32 text-center">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6 shadow-inner" />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing with Kitchen...</p>
           </div>
        ) : filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.orderStatus);
          const isExpanded = expandedOrder === order._id;

          // Calculate daily sequence number
          const orderDate = new Date(order.createdAt).toLocaleDateString();
          const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
          const dailySequenceNum = sameDayOrders.length - sameDayOrders.indexOf(order);

          return (
            <div
              key={order._id}
              className={`group bg-white rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative ${isExpanded ? 'border-[#D4AF37]/30 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] ring-1 ring-[#D4AF37]/10' : 'border-slate-50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:border-[#D4AF37]/20'}`}
            >
              <div className={`absolute left-0 top-0 w-1.5 h-full bg-[#D4AF37] transition-all duration-700 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

              {/* Order Header */}
              <div
                className={`px-8 py-6 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'}`}
                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-[#0F172A] text-[#D4AF37] rotate-[15deg] shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm group-hover:rotate-12'}`}>
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-[#0F172A] text-[#D4AF37] text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-[#D4AF37]/20">
                          Order {dailySequenceNum.toString().padStart(3, '0')}
                        </span>
                        <p className="text-sm font-black text-slate-400 tracking-widest uppercase">#{order._id.slice(-8).toUpperCase()}</p>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border ${getTypeStyles(order.orderType)}`}>
                          {order.orderType}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.orderStatus}
                        </span>
                        {order.paymentStatus === 'Paid' ? (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full bg-emerald-500 text-white shadow-[0_5px_15px_-5px_rgba(16,185,129,0.5)]">Paid</span>
                        ) : (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-rose-100 bg-rose-50 text-rose-600">Unpaid</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-2.5 h-2.5 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{order.customerName || 'Guest'}</span>
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold">|</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold">|</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {(order.tableNumber || order.roomNumber) && (
                           <>
                             <span className="text-[10px] text-slate-300 font-bold">|</span>
                             <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${order.tableNumber ? 'text-orange-500' : 'text-purple-500'}`}>
                               {order.tableNumber ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                             </span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{order.items?.length || 0} Items</p>
                      <p className="text-2xl font-black text-[#0F172A] tracking-tighter" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-[#D4AF37] border-[#D4AF37] text-white rotate-180' : 'bg-white text-slate-300'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Luxury Details */}
              {isExpanded && (
                <div className="px-8 pb-8 bg-slate-50/50 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Package className="w-3 h-3 text-[#D4AF37]" />
                        Boutique Selection
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-4 px-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group/item">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover/item:bg-[#0F172A] transition-colors">
                                <span className="text-xs font-black text-[#D4AF37]">{item.quantity}x</span>
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{item.name}</p>
                                {item.portion && <p className="text-[9px] font-bold text-[#D4AF37] uppercase mt-0.5">{item.portion}</p>}
                              </div>
                            </div>
                            <p className="text-xs font-black text-slate-900">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Financial Summary</h4>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                          </div>
                          {order.serviceCharge > 0 && (
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span>Service (10%)</span>
                              <span>{formatCurrency(order.serviceCharge)}</span>
                            </div>
                          )}
                          {order.deliveryFee > 0 && (
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span>Delivery</span>
                              <span>{formatCurrency(order.deliveryFee)}</span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest">
                              <span>Discount</span>
                              <span>-{formatCurrency(order.discount)}</span>
                            </div>
                          )}
                          <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-black text-[#0F172A] uppercase tracking-[0.2em]">Net Total</span>
                            <span className="text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-3">
                         {order.paymentStatus === 'Unpaid' ? (
                           <button 
                             onClick={() => setSettlingOrder(order)}
                             className="flex-1 py-4 bg-[#D4AF37] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#0F172A] hover:text-[#D4AF37] transition-all active:scale-95 flex items-center justify-center gap-2"
                           >
                             <Banknote className="w-4 h-4" />
                             Settle Bill
                           </button>
                         ) : (
                           <button 
                             onClick={() => handlePrintReceipt(order)}
                             className="flex-1 py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                           >
                             Print Receipt
                           </button>
                         )}
                         <button 
                           onClick={() => handleCancelOrder(order._id)}
                           className="px-6 py-4 border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
                         >
                           <XCircle className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No active orders found</p>
            <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Adjust filters or sync to refresh</p>
          </div>
        )}
      </div>

      {/* Settle Bill Modal */}
      {settlingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSettlingOrder(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
            {/* Modal Header */}
            <div className="bg-[#0F172A] px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-white font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Settle <span className="text-[#D4AF37]">Order</span></h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">#{settlingOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSettlingOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Due</p>
                  <h3 className="text-4xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(settlingOrder.totalAmount)}</h3>
                </div>
                <div className="text-right">
                   <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{settlingOrder.orderType}</p>
                   <p className="text-xs font-black text-slate-900">{settlingOrder.customerName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Received (Rs)</label>
                  <div className="relative">
                    <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                    <input
                      autoFocus
                      type="number"
                      placeholder="Enter amount..."
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xl font-black text-[#0F172A]"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Balance to Return</span>
                  <span className="text-2xl font-black text-emerald-700" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    {formatCurrency(Math.max((Number(cashReceived) || 0) - settlingOrder.totalAmount, 0))}
                  </span>
                </div>
              </div>

              <button
                disabled={isSettling || (Number(cashReceived) || 0) < settlingOrder.totalAmount}
                onClick={handleSettleOrder}
                className="w-full py-5 rounded-2xl bg-[#0F172A] text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSettling ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}