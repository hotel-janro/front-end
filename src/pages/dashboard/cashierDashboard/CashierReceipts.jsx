import React, { useState, useEffect } from 'react';
import {
  Gem,
  Search,
  Printer,
  Eye,
  X,
  Package,
  Calendar,
  User,
  CreditCard,
  FileText,
  RefreshCcw,
  Utensils,
  Truck,
  ShoppingBag,
  Bed,
  ListFilter,
  ChevronDown,
  ScrollText as Receipt
} from 'lucide-react';
import { apiFetch } from '../../../api.js';
import { useSettings } from '../../../context/SettingsContext.jsx';


export function CashierReceipts() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPollTime, setLastPollTime] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
      setLastPollTime(new Date());
    } catch (error) {
      /* error logged */
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
        customerName: order.customerName || 'Boutique Guest',
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

  const filtered = receipts.filter((r) => {
    const matchesSearch = (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || r.type === filterType;
    const matchesDate = (() => {
      if (dateFilter === 'All') return true;
      const issuedDate = new Date(r.issuedAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        return issuedDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'Week') {
        const diffTime = Math.abs(now - issuedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === 'Month') {
        return issuedDate.getMonth() === now.getMonth() && issuedDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'Year') {
        return issuedDate.getFullYear() === now.getFullYear();
      }
      return true;
    })();
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 py-6 shadow-2xl overflow-hidden border border-slate-200 mb-8">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D4AF37]/10 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-2">
              <Gem className="w-3 h-3 animate-pulse" /> Boutique Transaction History
            </div>
            <h2 className="text-2xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Receipt <span className="text-[#D4AF37]">Archive</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={loadOrders}
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl active:scale-95"
            >
              <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
              Refresh Archive
            </button>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest pr-2 mt-2">
              Last Sync: {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="w-full lg:flex-1 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-[0_10px_50px_-20px_rgba(0,0,0,0.05)] p-2">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Locate receipt by ID, guest name or order reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filters Group (Category Tabs + Date Dropdown) */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Category/Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All', value: 'All', icon: ListFilter },
              { label: 'Dine-in', value: 'Dine-in', icon: Utensils },
              { label: 'Room Service', value: 'Room', icon: Bed },
              { label: 'Delivery', value: 'Delivery', icon: Truck },
              { label: 'Take-away', value: 'Take-away', icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = filterType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilterType(tab.value)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0F172A] border-[#D4AF37] shadow-[0_10px_20px_rgba(212,175,55,0.15)] scale-[1.02]'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F172A]' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative group/select">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-6 pr-10 py-3 bg-slate-100 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-wider text-slate-500 cursor-pointer appearance-none min-w-[140px] text-center hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover/select:text-[#D4AF37] transition-colors" />
          </div>
        </div>
      </div>

      {/* Luxury Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading && orders.length === 0 ? (
          <div className="col-span-full py-40 text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6" />
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Curating your boutique records...</p>
          </div>
        ) : filtered.map((receipt) => (
          <div key={receipt.orderId} className="group bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_-20px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/30 transition-all duration-700 overflow-hidden relative">
            {/* Luxury Card Header */}
            <div className="px-8 py-7 bg-slate-50/20 border-b border-slate-200 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center group-hover:rotate-[15deg] group-hover:border-[#D4AF37] transition-all duration-500">
                    <Gem className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{receipt.id}</p>
                      <span className="px-2.5 py-0.5 bg-slate-50 text-[#D4AF37] text-[8px] font-black uppercase tracking-widest rounded-lg">
                        #{receipt.dailySequenceNum.toString().padStart(3, '0')}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">{receipt.orderNumber}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {receipt.status}
                </span>
              </div>
            </div>

            {/* Luxury Card Body */}
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0F172A] transition-all duration-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Boutique Guest</p>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{receipt.customerName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-slate-900">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Issued Date</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                    {new Date(receipt.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Channel</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{receipt.paymentMethod}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{receipt.items.length} Items</span>
                </div>
                <span className="text-[9px] font-black text-[#D4AF37] uppercase bg-[#D4AF37]/5 px-3 py-1 rounded-full border border-[#D4AF37]/10">{receipt.type}</span>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Total Settled</p>
                  <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>
                    {formatCurrency(receipt.total)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(receipt)}
                  className="w-14 h-14 bg-[#D4AF37] text-[#0F172A] rounded-2xl shadow-xl hover:bg-white hover:text-[#0F172A] border-2 border-transparent hover:border-[#0F172A] transition-all duration-500 flex items-center justify-center group/btn"
                >
                  <Eye className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-48 text-center bg-slate-100 rounded-[3rem] border border-slate-200">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-6" />
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-2">No Records Found</h4>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Adjust your filters or sync to refresh</p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-md border border-white/20 relative overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 px-8 py-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl text-slate-900 font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Receipt <span className="text-[#D4AF37]">Details</span></h3>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">{selectedReceipt.id}</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-slate-900 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-[#0F172A] tracking-widest uppercase">{settings.hotelName}</h2>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-[0.2em]">{settings.address}</p>
                <p className="text-[10px] text-slate-500 font-bold">Tel: {settings.phone}</p>
                <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>{new Date(selectedReceipt.issuedAt).toLocaleDateString('en-GB')}</span>
                    <span className="text-[#D4AF37]">{new Date(selectedReceipt.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-3 h-3 text-[#D4AF37]" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Boutique Guest</p>
                </div>
                <p className="text-md font-black text-[#0F172A] uppercase tracking-wider">{selectedReceipt.customerName}</p>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ref: {selectedReceipt.orderNumber}</p>
                  <span className="px-2 py-0.5 bg-white text-[#D4AF37] text-[8px] font-black uppercase tracking-widest rounded-md border border-[#D4AF37]/20">{selectedReceipt.type}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Summary of Choice</p>
                </div>
                <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start group">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">{item.name}</span>
                        {item.portion && <span className="text-[8px] font-bold text-[#D4AF37] uppercase italic mt-0.5">{item.portion}</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-slate-900">{formatCurrency(item.quantity * item.price)}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="border-t-2 border-dashed border-slate-100 pt-5 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <span>Subtotal Sum</span>
                  <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                </div>
                {selectedReceipt.serviceCharge > 0 && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>Service Earnings (10%)</span>
                    <span>{formatCurrency(selectedReceipt.serviceCharge)}</span>
                  </div>
                )}
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                    <span>Loyalty Discount</span>
                    <span>-{formatCurrency(selectedReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t-2 border-dashed border-slate-100 pt-4 mt-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Net Total</span>
                  <span className="text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(selectedReceipt.total)}</span>
                </div>
              </div>

              {/* Modern Receipt Footer */}
              <div className="mt-8 text-center bg-slate-50 p-4 rounded-3xl">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em]">Boutique Experience by Janro</p>
                <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase italic tracking-widest">Professional Digital Artifact</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return toast.error('Pop-up blocked! Please allow pop-ups for printing.');

                  const itemsHtml = selectedReceipt.items.map(it => `
                    <tr>
                      <td style="padding: 6px 0; border-bottom: 1px solid #eee;">
                        <div style="font-weight: bold; text-transform: uppercase;">${it.name}</div>
                        ${it.portion ? `<div style="font-size: 8px; color: #D4AF37; text-transform: uppercase;">(${it.portion})</div>` : ''}
                      </td>
                      <td style="text-align: center; border-bottom: 1px solid #eee;">x${it.quantity}</td>
                      <td style="text-align: right; font-weight: bold; border-bottom: 1px solid #eee;">${formatCurrency(it.price * it.quantity)}</td>
                    </tr>
                  `).join('');

                  printWindow.document.write(`
                    <html>
                      <head>
                        <style>
                          @media print { 
                            @page { size: 80mm auto; margin: 0; } 
                            body { margin: 0; padding: 2mm; width: 75mm; } 
                          }
                          body { 
                            font-family: 'Courier New', Courier, monospace; 
                            font-size: 11px; 
                            line-height: 1.2; 
                            color: #000; 
                            width: 100%; 
                            max-width: 300px;
                            margin: 0 auto;
                          }
                          .header { text-align: center; margin-bottom: 15px; }
                          .divider { border-top: 1px dashed #000; margin: 8px 0; }
                          table { width: 100%; border-collapse: collapse; }
                          .total-row { font-weight: bold; font-size: 14px; }
                          .footer { text-align: center; margin-top: 20px; font-size: 9px; }
                          .badge { display: inline-block; padding: 2px 6px; border: 1.5px solid #000; font-weight: bold; text-transform: uppercase; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1 style="margin:0; font-size: 22px; letter-spacing: 2px;">HOTEL JANRO</h1>
                          <p style="margin:2px 0; font-weight: bold; text-transform: uppercase; font-size: 9px;">Luxury Boutique Experience</p>
                          <p style="margin:1px 0;">Malwana Road, Dompe</p>
                          <p style="margin:1px 0;">Tel: 011-1234567</p>
                        </div>
                        <div class="divider"></div>
                        <div style="display:flex; justify-content:space-between; font-weight: bold;">
                          <span>REF: ${selectedReceipt.id}</span>
                          <span>${new Date(selectedReceipt.issuedAt).toLocaleDateString()}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top: 4px;">
                           <span>TIME: ${new Date(selectedReceipt.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <span class="badge">${selectedReceipt.type}</span>
                        </div>
                        <div style="margin-top:5px; font-weight: bold; text-transform: uppercase;">GUEST: ${selectedReceipt.customerName}</div>
                        <div style="font-size: 9px; color: #666;">ORDER REF: ${selectedReceipt.orderNumber}</div>
                        
                        <div class="divider"></div>
                        <table>
                          <thead>
                            <tr style="border-bottom: 1.5px solid #000;">
                              <th style="text-align: left; padding: 5px 0;">DESCRIPTION</th>
                              <th style="width: 40px; text-align: center;">QTY</th>
                              <th style="text-align: right; width: 80px;">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>${itemsHtml}</tbody>
                        </table>
                        <div class="divider" style="margin-top: 15px;"></div>
                        
                        <div style="text-align: right; space-y: 4px;">
                          <div style="margin-bottom: 2px;">SUBTOTAL SUM: ${formatCurrency(selectedReceipt.subtotal)}</div>
                          ${selectedReceipt.serviceCharge > 0 ? `<div style="margin-bottom: 2px;">SERVICE (10%): ${formatCurrency(selectedReceipt.serviceCharge)}</div>` : ''}
                          ${selectedReceipt.deliveryFee > 0 ? `<div style="margin-bottom: 2px;">DELIVERY FEE: ${formatCurrency(selectedReceipt.deliveryFee)}</div>` : ''}
                          ${selectedReceipt.discount > 0 ? `<div style="margin-bottom: 2px;">BOUTIQUE DISC: -${formatCurrency(selectedReceipt.discount)}</div>` : ''}
                          <div class="divider"></div>
                          <div class="total-row" style="margin-top: 5px;">NET SETTLED: ${formatCurrency(selectedReceipt.total)}</div>
                        </div>

                        <div class="footer">
                          <p style="margin: 8px 0; font-weight: bold; letter-spacing: 1px;">*** THANK YOU! ***</p>
                          <p style="margin: 2px 0;">PLEASE RETAIN THIS ARTIFACT</p>
                          <p style="margin: 0; font-size: 8px; color: #444; border: 1px solid #eee; display: inline-block; padding: 2px 8px; margin-top: 5px;">BOUTIQUE EXPERIENCE BY JANRO</p>
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
                className="w-full flex items-center justify-center gap-4 py-5 bg-slate-50 text-[#D4AF37] rounded-[2rem] hover:bg-slate-100 transition-all text-xs font-black uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98]"
              >
                <Printer className="w-5 h-5" />
                Produce Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
