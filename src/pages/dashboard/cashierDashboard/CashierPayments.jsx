import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  Wifi,
  Gem,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  TrendingUp,
  RefreshCcw,
} from 'lucide-react';
import { apiFetch } from '../../../api.js';

export function CashierPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
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
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const paymentRecords = orders.map((order) => ({
    id: `PAY-${order._id.slice(-6).toUpperCase()}`,
    orderId: `#${order._id.slice(-8).toUpperCase()}`,
    customerName: order.customerName || 'Guest',
    amount: order.totalAmount,
    tax: order.serviceCharge || 0,
    method: order.paymentMethod || 'Cash',
    status: order.paymentStatus === 'Paid' ? 'Settled' : 'Pending',
    date: order.createdAt,
    type: order.orderType,
  }));

  const filtered = paymentRecords.filter((p) => {
    const matchSearch =
      (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'Room Charge': return Gem;
      default: return Gem;
    }
  };

  const getMethodStyles = (method) => {
    switch (method) {
      case 'Card': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cash': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Online': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'Room Charge': return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const stats = [
    {
      label: 'Settled Revenue',
      value: formatCurrency(totalSettled),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
    },
    {
      label: 'Floating Credit',
      value: formatCurrency(totalPending),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
    },
    {
      label: 'Boutique Service',
      value: formatCurrency(totalTax),
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/5',
      border: 'border-[#D4AF37]/10',
    },
    {
      label: 'Flow Count',
      value: paymentRecords.length,
      icon: CreditCard,
      color: 'text-slate-600',
      bg: 'bg-slate-50/50',
      border: 'border-slate-100',
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(15,23,42,0.4)]">
            <Gem className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-wider">Revenue Stream</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Financial Boutique Performance</p>
          </div>
        </div>
        <button 
          onClick={loadOrders}
          className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-[#0F172A] hover:text-[#D4AF37] hover:border-[#0F172A] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl active:scale-95"
        >
          <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          Sync Financials
        </button>
      </div>

      {/* Luxury Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`group relative p-6 rounded-[2rem] border transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] ${stat.bg} ${stat.border}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Method Distribution */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(methodCounts).map(([method, count]) => {
          const MIcon = getMethodIcon(method);
          return (
            <div key={method} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 p-3 px-5 flex items-center gap-3 shadow-sm hover:border-[#D4AF37]/30 transition-all">
              <div className={`p-2 rounded-xl ${getMethodStyles(method)}`}>
                <MIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{method}</p>
                <p className="text-sm font-black text-slate-800">{count} Trans.</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Luxury Table Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Locate payment record..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[150px] text-center"
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
              className="px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[150px] text-center"
            >
              <option value="All">All Status</option>
              <option value="Settled">Settled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Premium Table Layout */}
        <div className="overflow-x-auto">
          {loading && orders.length === 0 ? (
             <div className="py-32 text-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6 shadow-inner" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Financial History...</p>
             </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Boutique Guest</th>
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fulfillment</th>
                  <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((payment) => {
                  const MIcon = getMethodIcon(payment.method);
                  return (
                    <tr key={payment.id} className="group hover:bg-slate-50/50 transition-all duration-500 cursor-default">
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-[#0F172A] tracking-wider uppercase group-hover:text-[#D4AF37] transition-colors">{payment.id}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payment.orderId}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-400">{payment.customerName.charAt(0)}</span>
                          </div>
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{payment.customerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getMethodStyles(payment.method)}`}>
                          <MIcon className="w-3 h-3" />
                          {payment.method}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-[10px] font-black text-slate-800">{new Date(payment.date).toLocaleDateString('en-GB')}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          payment.status === 'Settled' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-100 text-amber-600 border border-amber-200'
                        }`}>
                          {payment.status === 'Settled' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="text-sm font-black text-[#0F172A] tracking-tighter" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(payment.amount)}</p>
                        <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mt-0.5">Charge: {formatCurrency(payment.tax)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No financial records detected</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">Adjust your luxury filters to search again</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}