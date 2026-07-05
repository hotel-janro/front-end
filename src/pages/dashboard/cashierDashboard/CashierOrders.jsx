import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, CheckCircle, XCircle, ChevronDown, 
  ChevronUp, Check, X, Coffee, MapPin, Printer, Zap,
  RefreshCcw, Gem, Banknote, Calendar, User, ShoppingCart, Package, Activity, CreditCard,
  Edit, Minus, Plus, Save, Loader2, Search as SearchIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../../api.js';

// CashierOrders.jsx - Live order management for Cashiers
// Handles tracking, settling, and printing orders
export function CashierOrders() {
  // Page and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // Load menu for editing
  const loadMenu = async () => {
    try {
      const data = await apiFetch('/menu');
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  function updateItemQuantity(idx, delta) {
    const newItems = [...editingOrder.items];
    newItems[idx].quantity = Math.max(1, newItems[idx].quantity + delta);
    setEditingOrder({ ...editingOrder, items: newItems });
  }

  function removeItem(idx) {
    if (editingOrder.items.length <= 1) {
      toast.error("Order must have at least one item. Cancel the order instead if needed.");
      return;
    }
    const newItems = editingOrder.items.filter((_, i) => i !== idx);
    setEditingOrder({ ...editingOrder, items: newItems });
  }

  function addNewItem(menuItem, portion = "") {
    const existingIdx = editingOrder.items.findIndex(i => i.menuItemId === menuItem._id && i.portion === portion);
    if (existingIdx !== -1) {
      updateItemQuantity(existingIdx, 1);
    } else {
      let price = menuItem.price;
      if (menuItem.hasPortions && portion) {
        const pDetails = menuItem.portions.find(p => p.portionType === portion);
        if (pDetails) price = pDetails.price;
      }
      const newItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        portion: portion,
        price: price,
        quantity: 1
      };
      setEditingOrder({ ...editingOrder, items: [...editingOrder.items, newItem] });
    }
    setMenuSearchTerm("");
    setShowMenuDropdown(false);
  }

  async function handleUpdateOrder() {
    if (!editingOrder) return;
    setIsUpdating(true);
    try {
      await apiFetch(`/orders/${editingOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify({ items: editingOrder.items })
      });
      setEditingOrder(null);
      loadOrders();
      toast.success("Order updated successfully!");
    } catch (error) {
      toast.error("Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  }

  // Payment settlement state
  const [settlingOrder, setSettlingOrder] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSettling, setIsSettling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(new Date());

  // Load orders and start polling
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
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // Filter orders based on search and dropdowns
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || order.orderType === filterType;
    const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
    
    const matchesDate = (() => {
      if (dateFilter === 'All') return true;
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'Week') {
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (dateFilter === 'Month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === 'Year') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    })();

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // UI helpers for status and icons
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-300';
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
      default: return 'bg-slate-50 text-slate-600 border-slate-300';
    }
  };

  // Mark order(s) as paid
  const handleSettleOrder = async () => {
    if (!settlingOrder) return;
    
    // Find all related unpaid orders for this table/room
    const relatedOrders = orders.filter(o => 
      o.paymentStatus === 'Unpaid' && 
      ((settlingOrder.tableNumber && o.tableNumber === settlingOrder.tableNumber) || 
       (settlingOrder.roomNumber && o.roomNumber === settlingOrder.roomNumber))
    );

    const combinedTotal = relatedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const received = paymentMethod === 'Card' ? combinedTotal : Number(cashReceived || 0);
    const balance = paymentMethod === 'Card' ? 0 : Math.max(received - combinedTotal, 0);

    if (received < combinedTotal) {
      toast.error("Insufficient amount received");
      return;
    }

    try {
      setIsSettling(true);
      
      // Update each related order (sequential updates as backend handles single ID)
      await Promise.all(relatedOrders.map(o => 
        apiFetch(`/orders/${o._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod,
            amountReceived: o._id === settlingOrder._id ? received : o.totalAmount,
            balance: o._id === settlingOrder._id ? balance : 0,
            orderStatus: 'Completed'
          })
        })
      ));

      toast.success(`${relatedOrders.length > 1 ? 'All group orders' : 'Order'} settled successfully!`);
      setSettlingOrder(null);
      setCashReceived('');
      setPaymentMethod('Cash');
      loadOrders();
    } catch (error) {
      toast.error("Failed to settle order(s)");
    } finally {
      setIsSettling(false);
    }
  };

  // Generate and print receipt
  const handlePrintReceipt = (order) => {
    if (!order) return toast.error("No order data provided");

    const relatedOrders = [order];
    const combinedItems = relatedOrders.flatMap(o => o.items || []);
    const combinedSubtotal = relatedOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const combinedServiceCharge = relatedOrders.reduce((s, o) => s + (o.serviceCharge || 0), 0);
    const combinedDeliveryFee = relatedOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0);
    const combinedDiscount = relatedOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const combinedTotalAmount = relatedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalQty = combinedItems.reduce((s, it) => s + (it?.quantity || 0), 0);

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return toast.error('Pop-up blocked! Please click the icon in your browser address bar to allow pop-ups.');

    const itemsHtml = combinedItems.map(it => `
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
            <span>ID: #${order._id.slice(-6).toUpperCase()}</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
             <span>Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
             <span class="badge">${order.orderType.toUpperCase()}</span>
          </div>
          ${order.tableNumber ? `<div>TABLE: ${order.tableNumber}</div>` : ''}
          ${order.roomNumber ? `<div>ROOM: ${order.roomNumber}</div>` : ''}
          <div>GUEST: ${order.customerName.toUpperCase()}</div>
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
            <div>Items Count: ${totalQty}</div>
            <div>Subtotal Sum: Rs ${(combinedSubtotal || 0).toLocaleString()}</div>
            ${combinedServiceCharge > 0 ? `<div>Service (10%): Rs ${combinedServiceCharge.toLocaleString()}</div>` : ''}
            ${combinedDeliveryFee > 0 ? `<div>Delivery Fee: Rs ${combinedDeliveryFee.toLocaleString()}</div>` : ''}
            ${combinedDiscount > 0 ? `<div>Discount: -Rs ${combinedDiscount.toLocaleString()}</div>` : ''}
            <div class="divider"></div>
            <div class="total-row">GROUP TOTAL: Rs ${(combinedTotalAmount || 0).toLocaleString()}</div>
            <div class="divider"></div>
            ${(order?.amountReceived || 0) > 0 ? `
              <div>Cash Paid: Rs ${(order?.amountReceived || 0).toLocaleString()}</div>
              <div style="font-weight:bold; font-size: 13px;">Balance: Rs ${(order?.balance || 0).toLocaleString()}</div>
            ` : `
              <div style="font-style: italic; font-size: 8px; color: #666;">Payment Pending</div>
            `}
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: newStatus })
      });
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };


  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 py-6 shadow-2xl overflow-hidden border border-slate-400 mb-8">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px] -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-2">
              <Gem className="w-3 h-3 animate-pulse" /> Real-time Boutique Operations
            </div>
            <h2 className="text-2xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Live <span className="text-[#D4AF37]">Orders</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button 
              onClick={loadOrders}
              className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-xl active:scale-95"
            >
              <RefreshCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
              Refresh Live Stream
            </button>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest pr-2 mt-2">
              Last Sync: {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Luxury Search & Filters */}
      <div className="bg-slate-50 rounded-[2.5rem] border border-slate-400 shadow-2xl p-2 text-slate-900">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder="Locate an order or guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="h-12 w-px bg-white/5 hidden lg:block" />
          <div className="flex gap-2 p-1">
            <div className="relative group/select">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-6 pr-10 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[140px] text-center"
              >
                <option value="All">All Types</option>
                <option value="Dine-in">Dine-in</option>
                <option value="Room">Room Service</option>
                <option value="Delivery">Delivery</option>
                <option value="Take-away">Take-away</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover/select:text-[#D4AF37] transition-colors" />
            </div>

            <div className="relative group/select">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-6 pr-10 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[140px] text-center"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none group-hover/select:text-[#D4AF37] transition-colors" />
            </div>

            <div className="relative group/select">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-6 pr-10 py-3 bg-slate-50 border border-slate-400 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none min-w-[140px] text-center"
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
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {loading && orders.length === 0 ? (
           <div className="py-32 text-center">
              <div className="w-16 h-16 border-4 border-slate-300 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6 shadow-inner" />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing with Kitchen...</p>
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
              className={`group bg-slate-50 rounded-[2.5rem] border transition-all duration-700 overflow-hidden relative ${isExpanded ? 'border-[#D4AF37]/30 shadow-[0_30px_70px_-20px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/10' : 'border-slate-400 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-20px_rgba(212,175,55,0.1)] hover:border-[#D4AF37]/20'}`}
            >
              <div className={`absolute left-0 top-0 w-1.5 h-full bg-[#D4AF37] transition-all duration-700 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

              {/* Order Header */}
              <div
                className={`px-8 py-6 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-slate-50/20' : 'bg-slate-50 hover:bg-slate-100/30'}`}
                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-100 text-[#D4AF37] rotate-[15deg] shadow-lg' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:shadow-sm group-hover:rotate-12'}`}>
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-slate-50 text-[#D4AF37] text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-400">
                          Order {dailySequenceNum.toString().padStart(3, '0')}
                        </span>
                        <p className="text-sm font-black text-slate-500 tracking-widest uppercase">#{order._id.slice(-8).toUpperCase()}</p>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border ${getTypeStyles(order.orderType)}`}>
                          {order.orderType}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border ${getStatusStyles(order.orderStatus)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.orderStatus}
                        </span>
                        {order.paymentStatus === 'Paid' ? (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full bg-emerald-500 text-slate-900 shadow-[0_5px_15px_-5px_rgba(16,185,129,0.5)]">Paid</span>
                        ) : (
                          <span className="px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">Unpaid</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-400">
                            <User className="w-2.5 h-2.5 text-slate-500" />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{order.customerName || 'Guest'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">|</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">|</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#D4AF37]" />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {(order.tableNumber || order.roomNumber) && (
                           <>
                             <span className="text-[10px] text-slate-500 font-bold">|</span>
                             <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${order.tableNumber ? 'text-orange-400' : 'text-purple-400'}`}>
                               {order.tableNumber ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}
                             </span>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{order.items?.length || 0} Items</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl border border-slate-400 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A] rotate-180' : 'bg-slate-50 text-slate-500 group-hover:border-slate-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Luxury Details */}
              {isExpanded && (
                <div className="px-8 pb-8 bg-slate-50/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-400">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Package className="w-3 h-3 text-[#D4AF37]" />
                        Boutique Selection
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-4 px-5 bg-slate-100 rounded-2xl border border-slate-400 shadow-sm hover:border-[#D4AF37]/30 transition-all group/item">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover/item:bg-[#D4AF37] transition-colors">
                                <span className="text-xs font-black text-[#D4AF37] group-hover/item:text-[#0F172A]">{item.quantity}x</span>
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-wider group-hover/item:text-[#D4AF37] transition-colors">{item.name}</p>
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
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Financial Summary</h4>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-400 shadow-sm space-y-4">
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-slate-900">{formatCurrency(order.subtotal)}</span>
                          </div>
                          {order.serviceCharge > 0 && (
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span>Service (10%)</span>
                              <span className="text-slate-900">{formatCurrency(order.serviceCharge)}</span>
                            </div>
                          )}
                          {order.deliveryFee > 0 && (
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span>Delivery</span>
                              <span className="text-slate-900">{formatCurrency(order.deliveryFee)}</span>
                            </div>
                          )}
                          {order.discount > 0 && (
                            <div className="flex justify-between text-xs font-bold text-rose-400 uppercase tracking-widest">
                              <span>Discount</span>
                              <span>-{formatCurrency(order.discount)}</span>
                            </div>
                          )}
                          <div className="pt-4 border-t border-dashed border-slate-400 flex justify-between items-center">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Net Total</span>
                            <span className="text-2xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Update Order Status
                        </h4>
                        <div className="flex gap-2">
                          {['Pending', 'Preparing', 'Completed'].map((status) => {
                            const isCurrent = order.orderStatus === status;
                            return (
                              <button
                                key={status}
                                onClick={() => handleUpdateOrderStatus(order._id, status)}
                                className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${
                                  isCurrent
                                    ? 'bg-[#D4AF37] text-[#0F172A] border-[#D4AF37] shadow-[0_5px_15px_rgba(212,175,55,0.15)] scale-[1.02]'
                                    : 'bg-slate-100 text-slate-500 border-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-3">
                         {order.paymentStatus === 'Unpaid' ? (
                           <button 
                             onClick={() => {
                               if (order.orderStatus !== 'Completed') {
                                 toast.error("Please mark the order as 'Completed' before settling the bill");
                               } else {
                                 setSettlingOrder(order);
                               }
                             }}
                             className="flex-1 py-4 bg-[#D4AF37] text-[#0F172A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white hover:text-[#0F172A] transition-all active:scale-95 flex items-center justify-center gap-2"
                           >
                             <Banknote className="w-4 h-4" />
                             Settle Bill
                           </button>
                         ) : (
                           <button 
                             onClick={() => handlePrintReceipt(order)}
                             className="flex-1 py-4 bg-slate-50 text-[#D4AF37] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                           >
                             <Printer className="w-4 h-4" />
                             Print Receipt
                           </button>
                         )}
                         {order.orderStatus === 'Pending' && (
                           <button 
                             onClick={() => setEditingOrder(JSON.parse(JSON.stringify(order)))}
                             className="px-6 py-4 border border-slate-400 bg-slate-100 text-slate-500 rounded-2xl hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all active:scale-95"
                           >
                             <Edit className="w-5 h-5" />
                           </button>
                         )}
                         <button 
                           onClick={() => handleCancelOrder(order._id)}
                           className="px-6 py-4 border border-slate-400 bg-slate-100 text-slate-500 rounded-2xl hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all active:scale-95"
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
          <div className="bg-slate-50 rounded-[3rem] border border-slate-400 shadow-2xl p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-400">
              <ShoppingCart className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active orders found</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Adjust filters or sync to refresh</p>
          </div>
        )}
      </div>

      {settlingOrder && (() => {
        const relatedOrders = [settlingOrder];
        const combinedTotal = settlingOrder.totalAmount || 0;
        const isMultiple = false;

        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSettlingOrder(null)} />
            <div className="relative bg-slate-50 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-400">
              {/* Modal Header */}
              <div className="bg-slate-50/40 px-8 py-6 flex items-center justify-between border-b border-slate-400">
                <div>
                  <h2 className="text-xl text-slate-900 font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Settle <span className="text-[#D4AF37]">Order</span></h2>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {isMultiple ? `${relatedOrders.length} Linked Orders` : `#${settlingOrder._id.slice(-8).toUpperCase()}`}
                  </p>
                </div>
                <button onClick={() => setSettlingOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-900 hover:bg-white/10 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-end border-b border-slate-400 pb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isMultiple ? 'Combined Total' : 'Total Amount Due'}</p>
                    <h3 className="text-4xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(combinedTotal)}</h3>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{settlingOrder.orderType}</p>
                     <p className="text-xs font-black text-slate-900">{settlingOrder.tableNumber ? `Table ${settlingOrder.tableNumber}` : settlingOrder.roomNumber ? `Room ${settlingOrder.roomNumber}` : settlingOrder.customerName}</p>
                  </div>
                </div>

                {isMultiple && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-400">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Order Group Summary</p>
                    <div className="space-y-3">
                      {relatedOrders.map(o => (
                        <div key={o._id} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-400 pb-1">
                            <span>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Order</span>
                            <span className="text-[#D4AF37]">{formatCurrency(o.totalAmount)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(o.items || []).map((it, idx) => (
                              <span key={idx} className="text-[7px] font-bold text-slate-500 bg-slate-100 border border-slate-400 px-1.5 py-0.5 rounded uppercase">{it.quantity}x {it.name}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Cash' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Banknote className="w-4 h-4" /> Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('Card');
                        setCashReceived('');
                      }}
                      className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Card' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <CreditCard className="w-4 h-4" /> Card
                    </button>
                  </div>

                  {paymentMethod === 'Cash' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cash Received (Rs)</label>
                        <div className="relative">
                          <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                          <input
                            autoFocus
                            type="number"
                            placeholder="Enter amount..."
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-400 rounded-2xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 text-xl font-black text-slate-900 outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Balance to Return</span>
                        <span className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'DM Serif Display, serif' }}>
                          {formatCurrency(Math.max((Number(cashReceived) || 0) - combinedTotal, 0))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-2">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Amount to Charge</p>
                      <p className="text-3xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>
                        {formatCurrency(combinedTotal)}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  disabled={isSettling || (paymentMethod === 'Cash' && (Number(cashReceived) || 0) < combinedTotal)}
                  onClick={handleSettleOrder}
                  className="w-full py-5 rounded-2xl bg-[#D4AF37] text-[#0F172A] font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-[#0F172A] active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSettling ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isMultiple ? `Confirm Group Settle` : `Confirm Settlement`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setEditingOrder(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
            <header className="px-10 py-7 border-b border-slate-300 flex items-center justify-between bg-[#0F172A] text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-[#D4AF37] flex items-center justify-center">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Modify <span className="text-[#D4AF37]">Order</span></h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Ref: #{editingOrder.orderNumber || editingOrder._id.slice(-8)}</p>
                </div>
              </div>
              <button onClick={() => setEditingOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/10">
              {/* Add New Item Search */}
              <div className="relative mb-8">
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mb-3">Add More Delicacies</p>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search menu..."
                    value={menuSearchTerm}
                    onChange={(e) => {
                      setMenuSearchTerm(e.target.value);
                      setShowMenuDropdown(true);
                    }}
                    onFocus={() => setShowMenuDropdown(true)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                  />
                  <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>

                {showMenuDropdown && menuSearchTerm && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-300 max-h-60 overflow-y-auto overflow-x-hidden">
                    {menuItems.filter(item => item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())).length > 0 ? menuItems.filter(item => item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())).map(item => (
                      <div key={item._id} className="p-4 hover:bg-slate-50 border-b border-slate-300 last:border-0 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {item.hasPortions ? (
                              item.portions.map(p => (
                                <button 
                                  key={p.portionType}
                                  onClick={() => addNewItem(item, p.portionType)}
                                  className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-[9px] font-black uppercase hover:bg-[#D4AF37] hover:text-white transition-all cursor-pointer border border-[#D4AF37]/20"
                                >
                                  + {p.portionType}
                                </button>
                              ))
                            ) : (
                              <button 
                                onClick={() => addNewItem(item)}
                                className="px-3 py-1.5 bg-[#0F172A] text-[#D4AF37] rounded-lg text-[9px] font-black uppercase hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all cursor-pointer"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-400 text-xs italic">No items found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Selection</p>
                {editingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-300 rounded-2xl shadow-sm">
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{item.name}</h4>
                      <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">
                        {item.portion || "Standard"} • {formatCurrency(item.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white border border-slate-400 rounded-xl overflow-hidden shadow-sm">
                        <button 
                          onClick={() => updateItemQuantity(idx, -1)}
                          className="p-2 hover:bg-[#0F172A] hover:text-[#D4AF37] text-slate-400 hover:border-transparent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateItemQuantity(idx, 1)}
                          className="p-2 hover:bg-[#0F172A] hover:text-[#D4AF37] text-slate-400 hover:border-transparent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(idx)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-8 border-t border-slate-300 bg-slate-50/70 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3 border-b border-slate-400 pb-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</div>
                  <div className="text-right text-xs font-black text-slate-700">
                    {formatCurrency(editingOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0))}
                  </div>
                  
                  {editingOrder.serviceCharge > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Charge</div>
                      <div className="text-right text-xs font-black text-slate-700">{formatCurrency(editingOrder.serviceCharge)}</div>
                    </>
                  )}
                  
                  {editingOrder.deliveryFee > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Fee</div>
                      <div className="text-right text-xs font-black text-slate-700">{formatCurrency(editingOrder.deliveryFee)}</div>
                    </>
                  )}
                  
                  {editingOrder.discount > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Discount</div>
                      <div className="text-right text-xs font-black text-rose-500">-{formatCurrency(editingOrder.discount)}</div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-0.5">New Grand Total</p>
                    <p className="text-3xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                      {formatCurrency(editingOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0) + (editingOrder.serviceCharge || 0) + (editingOrder.deliveryFee || 0) - (editingOrder.discount || 0))}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleUpdateOrder}
                disabled={isUpdating}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-[#0F172A] text-[#D4AF37] rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-[#0F172A] hover:shadow-[0_10px_25px_rgba(212,175,55,0.3)] transition-all shadow-2xl disabled:opacity-50 cursor-pointer border border-transparent"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Confirm Changes
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
