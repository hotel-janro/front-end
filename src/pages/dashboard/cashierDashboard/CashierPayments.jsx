import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, CheckCircle, Clock, 
  TrendingUp, Download, ArrowUpRight, Check,
  CreditCard, Calendar, BarChart3, Filter,
  Activity, Wifi, RefreshCcw, Gem, Banknote, User, ChevronDown
} from 'lucide-react';
import { apiFetch } from '../../../api.js';

// CashierPayments.jsx - Financial tracking for the Cashier
// Handles revenue monitoring and payment records
export function CashierPayments() {
  // Page state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPollTime, setLastPollTime] = useState(new Date());

  // Fetch orders on mount
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch orders from API
  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
      setLastPollTime(new Date());
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // Map orders to payment records
  const paymentRecords = orders.map((order) => ({
    id: `PAY-${order._id.slice(-6).toUpperCase()}`,
    orderId: `#${order._id.slice(-8).toUpperCase()}`,
    customerName: order.customerName || 'Boutique Guest',
    amount: order.totalAmount,
    tax: order.serviceCharge || 0,
    method: order.paymentMethod || 'Cash',
    status: order.paymentStatus === 'Paid' ? 'Settled' : 'Pending',
    date: order.createdAt,
    type: order.orderType,
  }));

  // Apply filters
  const filtered = paymentRecords.filter((p) => {
    const matchSearch =
      (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchMethod = filterMethod === 'All' || p.method === filterMethod;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    
    const matchDate = (() => {
      if (dateFilter === 'All') return true;
      const recDate = new Date(p.date);
      const now = new Date();
      if (dateFilter === 'Today') {
        return recDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'Week') {
        const diffTime = Math.abs(now - recDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === 'Month') {
        return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'Year') {
        return recDate.getFullYear() === now.getFullYear();
      }
      return true;
    })();

    return matchSearch && matchMethod && matchStatus && matchDate;
  });

  // Calculate totals for stats based on filtered results
  const totalSettled = filtered
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filtered
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalService = filtered
    .filter((p) => p.status === 'Settled')
    .reduce((sum, p) => sum + p.tax, 0);

  const methodCounts = filtered.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {});

  // UI helpers for icons and styles
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
      case 'Card': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cash': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Online': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Room Charge': return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const stats = [
    {
      label: 'Settled Revenue',
      value: formatCurrency(totalSettled),
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-slate-200',
      trend: 'up'
    },
    {
      label: 'Floating Credit',
      value: formatCurrency(totalPending),
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-slate-200',
      trend: 'neutral'
    },
    {
      label: 'Service Earnings',
      value: formatCurrency(totalService),
      icon: TrendingUp,
      color: 'text-[#D4AF37]',
      bg: 'bg-[#D4AF37]/10',
      border: 'border-slate-200',
      trend: 'up'
    },
    {
      label: 'Total Payments',
      value: paymentRecords.length,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-slate-200',
      trend: 'neutral'
    },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 py-6 shadow-2xl overflow-hidden border border-slate-200 mb-8">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-2">
              <Gem className="w-3 h-3 animate-pulse" /> Financial Boutique Performance
            </div>
            <h2 className="text-2xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Revenue <span className="text-[#D4AF37]">Stream</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button 
              onClick={loadOrders}
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl active:scale-95"
            >
              <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
              Refresh Revenue Stream
            </button>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest pr-2 mt-2">
              Last Sync: {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Refined Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="group relative p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#D4AF37]/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase">
                    <ArrowUpRight className="w-2.5 h-2.5" /> Growth
                  </div>
                )}
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'DM Serif Display, serif' }}>{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Method Distribution */}
      <div className="flex flex-wrap gap-4 pt-2">
        {Object.entries(methodCounts).map(([method, count]) => {
          const MIcon = getMethodIcon(method);
          return (
            <div key={method} className="bg-slate-100 rounded-xl border border-slate-200 px-5 py-3 flex items-center gap-4 shadow-sm hover:border-[#D4AF37]/30 transition-all group text-slate-900">
              <div className={`p-2 rounded-lg transition-all group-hover:scale-110 ${getMethodStyles(method)}`}>
                <MIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{method}</p>
                <p className="text-sm font-black text-slate-900">{count} Transactions</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Table Section */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Locate payment record or guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/5 text-sm font-bold text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative group/select">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="pl-6 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/5 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[160px] text-center"
              >
                <option value="All">All Channels</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover/select:text-[#D4AF37] transition-colors" />
            </div>

            <div className="relative group/select">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-6 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/5 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[160px] text-center"
              >
                <option value="All">All Fulfillment</option>
                <option value="Settled">Settled</option>
                <option value="Pending">Pending</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover/select:text-[#D4AF37] transition-colors" />
            </div>

            <div className="relative group/select">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-6 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/5 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[160px] text-center"
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

        {/* Premium Table Layout */}
        <div className="overflow-x-auto custom-scrollbar">
          {loading && orders.length === 0 ? (
             <div className="py-40 text-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6" />
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Financial Boutique History...</p>
             </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Transaction</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Guest</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Channel</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Fulfillment</th>
                  <th className="px-6 py-4 text-right text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((payment) => {
                  const MIcon = getMethodIcon(payment.method);
                  return (
                    <tr key={payment.id} className="group hover:bg-slate-100/50 transition-all duration-300 cursor-default">
                      <td className="px-6 py-5">
                        <div>
                          <span className="text-xs font-black text-slate-900 tracking-widest uppercase group-hover:text-[#D4AF37] transition-colors">{payment.id}</span>
                          <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{payment.orderId}</p>
                        </div>
                        <span className="text-xs font-black text-slate-900 tracking-widest uppercase">{payment.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0F172A] transition-all duration-300">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{payment.customerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${getMethodStyles(payment.method)}`}>
                            <MIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{payment.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-black text-slate-900 tracking-widest uppercase">{new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{new Date(payment.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          payment.status === 'Settled' ? 'bg-emerald-500 text-slate-900' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {payment.status === 'Settled' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-base font-black text-emerald-500 tracking-wider" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(payment.amount)}</p>
                        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">Svc: {formatCurrency(payment.tax)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-48 text-center bg-slate-50/20">
              <div className="w-24 h-24 bg-slate-100 rounded-[3rem] border border-slate-200 flex items-center justify-center mx-auto mb-8 shadow-xl">
                <CreditCard className="w-10 h-10 text-slate-600" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">No Records Found</h4>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Adjust your boutique filters to search again</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}