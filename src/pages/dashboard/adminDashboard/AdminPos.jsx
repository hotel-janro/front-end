import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  DollarSign, 
  Plus,
  Trash2,
  CheckCircle,
  CreditCard,
  Receipt,
  Utensils,
  History,
  Zap,
  ChevronRight,
  User,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminPOS() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [posForm, setPosForm] = useState({
    orderType: 'Dine-in',
    tableNumber: '',
    roomNumber: '',
    deliveryAddress: '',
    contactNumber: '',
    discount: '0',
    coordinates: null
  });
  const [cart, setCart] = useState([]);
  const [selectedPosMenuItemId, setSelectedPosMenuItemId] = useState('');
  const [selectedPosQuantity, setSelectedPosQuantity] = useState('1');
  const [savingPosOrder, setSavingPosOrder] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Payment processing state
  const [amountReceived, setAmountReceived] = useState('');
  const [balance, setBalance] = useState(0);

  // Existing order payment state
  const [settlingOrderId, setSettlingOrderId] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountValue = Number(posForm.discount || 0);
  const taxValue = subtotal * 0.1;
  const grandTotal = Math.max(subtotal + taxValue - discountValue, 0);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosForm({
          ...posForm, 
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        });
        setIsGettingLocation(false);
        toast.success('Location captured successfully!');
      },
      (err) => {
        toast.error('Could not get location. Please enter address manually.');
        setIsGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    const received = Number(amountReceived || 0);
    if (received > 0) {
      setBalance(Math.max(received - grandTotal, 0));
    } else {
      setBalance(0);
    }
  }, [amountReceived, grandTotal]);

  useEffect(() => {
    refreshData();
    // Auto-poll for new orders every 30 seconds
    const interval = setInterval(() => {
      loadOrders(true); // pass true to indicate it's a silent background poll
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await Promise.allSettled([loadMenu(), loadOrders()]);
    setLoading(false);
  };

  const loadMenu = async () => {
    const data = await apiFetch('/menu?populate=inventoryItem');
    setMenuItems(Array.isArray(data) ? data : []);
  };

  const loadOrders = async (isPoll = false) => {
    try {
      const data = await apiFetch('/orders');
      const newOrders = Array.isArray(data) ? data : [];
      
      // If polling, check if there are new orders that weren't in the previous list
      if (isPoll && newOrders.length > orders.length) {
        const latestOrder = newOrders[0]; // Assuming backend returns newest first
        if (latestOrder.orderStatus === 'Pending') {
          toast.success(`New order from ${latestOrder.customerName || 'Guest'}!`, {
            description: `${latestOrder.orderType} order worth Rs ${latestOrder.totalAmount.toLocaleString()}`,
            duration: 10000,
          });
        }
      }
      
      setOrders(newOrders);
    } catch (e) {
      console.error("Order poll failed", e);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const addPosItem = () => {
    const menuItem = menuItems.find((item) => item._id === selectedPosMenuItemId);
    const quantity = Number(selectedPosQuantity || 1);
    if (!menuItem || quantity < 1) return;

    if (menuItem.inventoryItem && menuItem.inventoryItem.quantity < quantity) {
      if (!window.confirm(`Low stock: Only ${menuItem.inventoryItem.quantity} left. Continue?`)) return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map((i) => i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity }];
    });
    setSelectedPosMenuItemId('');
    setSelectedPosQuantity('1');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const payload = {
      orderType: posForm.orderType,
      items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      discount: discountValue,
      ...(posForm.orderType === 'Dine-in' && { tableNumber: posForm.tableNumber }),
      ...(posForm.orderType === 'Room' && { roomNumber: posForm.roomNumber }),
      ...(posForm.orderType === 'Delivery' && { 
        deliveryAddress: posForm.deliveryAddress, 
        contactNumber: posForm.contactNumber,
        coordinates: posForm.coordinates
      }),
    };

    try {
      setSavingPosOrder(true);
      // If amount received is enough, set as Paid automatically
      const receivedNum = Number(amountReceived || 0);
      const isPaid = receivedNum >= grandTotal && receivedNum > 0;
      const finalPayload = { 
        ...payload, 
        paymentStatus: isPaid ? 'Paid' : 'Unpaid',
        amountReceived: receivedNum,
        balance: balance
      };

      const response = await apiFetch('/orders', { method: 'POST', body: JSON.stringify(finalPayload) });
      toast.success('Order processed successfully!');
      
      if (response && response._id) {
        handlePrintReceipt(response);
      }

      setCart([]);
      setPosForm({ ...posForm, discount: '0', tableNumber: '', roomNumber: '', deliveryAddress: '', contactNumber: '', coordinates: null });
      setAmountReceived('');
      await refreshData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingPosOrder(false);
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=700');
    const itemsHtml = order.items.map(item => `
      <div class="item-row">
        <span>${item.quantity} x ${item.name}</span>
        <span>Rs ${item.price.toLocaleString()}</span>
      </div>
    `).join('');

    let qrHtml = '';
    if (order.orderType === 'Delivery' && order.coordinates) {
      const mapsUrl = `https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mapsUrl)}`;
      qrHtml = `
        <div style="text-align: center; margin-top: 25px; padding-top: 25px; border-top: 2px dashed #CBD5E1;">
          <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0F172A; margin-bottom: 12px;">Delivery Location</div>
          <img src="${qrUrl}" alt="Location QR Code" style="width: 120px; height: 120px; border-radius: 8px; border: 2px solid #0F172A; padding: 4px;" />
          <div style="font-size: 10px; font-weight: 700; color: #64748B; margin-top: 8px;">Scan for Google Maps Navigation</div>
        </div>
      `;
    }

    const hotelLogo = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
      </svg>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hotel Janro - Receipt #${order._id.slice(-8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #0F172A; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0F172A; padding-bottom: 20px; }
            .logo { margin-bottom: 10px; display: flex; justify-content: center; }
            .hotel-name { font-family: 'DM Serif Display', serif; font-size: 28px; font-weight: normal; letter-spacing: 1px; color: #0F172A; }
            .hotel-details { font-size: 10px; color: #64748B; margin-top: 5px; line-height: 1.4; font-weight: 600; }
            .receipt-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #0F172A; margin-top: 15px; padding: 5px 0; border-top: 1px dashed #CBD5E1; border-bottom: 1px dashed #CBD5E1; }
            .info { margin-bottom: 25px; font-size: 11px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-weight: 500; }
            .info strong { color: #0F172A; font-weight: 900; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; display: block; margin-bottom: 2px; }
            .items { margin-bottom: 25px; }
            .item-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; font-weight: 600; color: #1E293B; }
            .item-row span:last-child { font-weight: 900; color: #0F172A; }
            .totals { border-top: 2px solid #0F172A; padding-top: 15px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
            .grand-total { font-size: 18px; font-weight: 900; color: #0F172A; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #CBD5E1; letter-spacing: 0; }
            .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #64748B; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${hotelLogo}</div>
            <div class="hotel-name">HOTEL JANRO</div>
            <div class="hotel-details">
              123 Luxury Avenue, Colombo 03, Sri Lanka<br>
              Tel: +94 11 234 5678 | Web: www.hoteljanro.com<br>
              VAT Reg No: 123456789-0000
            </div>
            <div class="receipt-title">Official Receipt</div>
          </div>
          <div class="info">
            <div><strong>Order ID</strong>#${order._id.slice(-8)}</div>
            <div style="text-align: right;"><strong>Date</strong>${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            <div><strong>Type</strong>${order.orderType}</div>
            <div style="text-align: right;"><strong>Customer</strong>${order.customerName || 'Guest'}</div>
            ${order.tableNumber ? `<div><strong>Table</strong>${order.tableNumber}</div>` : ''}
            ${order.roomNumber ? `<div><strong>Room</strong>${order.roomNumber}</div>` : ''}
            ${order.contactNumber ? `<div style="grid-column: 1 / -1;"><strong>Contact Number</strong>${order.contactNumber}</div>` : ''}
            ${order.deliveryAddress ? `<div style="grid-column: 1 / -1;"><strong>Delivery Address</strong>${order.deliveryAddress}</div>` : ''}
          </div>
          <div class="items">
            ${itemsHtml}
          </div>
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>Rs ${order.items.reduce((s,i) => s + (i.price*i.quantity), 0).toLocaleString()}</span></div>
            <div class="total-row"><span>Discount</span><span>-Rs ${(order.discount || 0).toLocaleString()}</span></div>
            <div class="total-row grand-total"><span>Grand Total</span><span>Rs ${order.totalAmount.toLocaleString()}</span></div>
            ${order.amountReceived > 0 ? `
              <div class="total-row" style="margin-top: 15px;"><span>Amount Received</span><span style="color: #10B981;">Rs ${order.amountReceived.toLocaleString()}</span></div>
              <div class="total-row"><span>Change Given</span><span>Rs ${(order.balance || 0).toLocaleString()}</span></div>
            ` : ''}
          </div>
          ${qrHtml}
          <div class="footer">
            Thank you for choosing Hotel Janro<br>Visit again for a premium experience
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ orderStatus }) });
    await loadOrders();
  };

  const updatePaymentStatus = async (orderId, updates) => {
    try {
      await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify(updates) });
      toast.success(`Payment updated successfully`);
      setSettlingOrderId(null);
      setSettleAmount('');
      await loadOrders();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const activeOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Today\'s Orders', value: orders.length, icon: ShoppingCart, color: 'blue' },
          { label: 'Active Kitchen', value: activeOrdersCount, icon: Clock, color: 'amber' },
          { label: 'Net Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'emerald' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[480px_minmax(0,1fr)]">
        {/* Luxury POS Panel */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Digital <span className="text-[#D4AF37]">Checkout</span></h3>
                <Receipt className="w-6 h-6 text-[#D4AF37]" />
              </div>

              <div className="space-y-6">
                {/* Order Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select 
                      value={posForm.orderType} 
                      onChange={e => setPosForm({...posForm, orderType: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#D4AF37]/50 outline-none transition-all"
                    >
                      <option className="text-slate-900" value="Dine-in">Dine-in</option>
                      <option className="text-slate-900" value="Room">Room Service</option>
                      <option className="text-slate-900" value="Delivery">Delivery</option>
                      <option className="text-slate-900" value="Take-away">Take-away</option>
                    </select>
                  </div>
                  {posForm.orderType === 'Dine-in' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Table</label>
                      <input 
                        type="text" 
                        placeholder="T-01" 
                        value={posForm.tableNumber} 
                        onChange={e => setPosForm({...posForm, tableNumber: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  )}
                  {posForm.orderType === 'Room' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Room</label>
                      <input 
                        type="text" 
                        placeholder="302" 
                        value={posForm.roomNumber} 
                        onChange={e => setPosForm({...posForm, roomNumber: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#D4AF37] transition-all"
                      />
                    </div>
                  )}
                </div>

                {posForm.orderType === 'Delivery' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                      <textarea 
                        placeholder="Enter full address..." 
                        value={posForm.deliveryAddress} 
                        onChange={e => setPosForm({...posForm, deliveryAddress: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-all resize-none h-20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="07x xxxxxxx" 
                          value={posForm.contactNumber} 
                          onChange={e => setPosForm({...posForm, contactNumber: e.target.value})} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">GPS Location</label>
                        <button 
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                          className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            posForm.coordinates ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          {isGettingLocation ? 'Locating...' : posForm.coordinates ? 'Location Set' : 'Get Location'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Item Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Cuisine</label>
                  <div className="flex gap-3">
                    <select 
                      value={selectedPosMenuItemId} 
                      onChange={e => setSelectedPosMenuItemId(e.target.value)} 
                      className="flex-1 bg-white border-none rounded-2xl px-5 py-4 text-sm text-slate-900 font-bold focus:ring-4 focus:ring-[#D4AF37]/30 outline-none shadow-xl"
                    >
                      <option value="">Select a dish...</option>
                      {menuItems.map(item => (
                        <option key={item._id} value={item._id} disabled={!item.isAvailable}>
                          {item.name} ({formatCurrency(item.price)})
                        </option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      value={selectedPosQuantity} 
                      onChange={e => setSelectedPosQuantity(e.target.value)} 
                      className="w-20 bg-white/10 border border-white/10 rounded-2xl px-4 py-3.5 text-center text-sm outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button 
                    onClick={addPosItem} 
                    className="w-full bg-[#D4AF37] text-[#0F172A] py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10"
                  >
                    Add to Bill
                  </button>
                </div>
              </div>

              {/* Cart Preview - Glassmorphism */}
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Current Items</span>
                  <span className="text-[10px] font-bold">{cart.length} distinct</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                      <Utensils className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Awaiting selection...</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div>
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-[10px] text-[#D4AF37] font-bold">{item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <button onClick={() => setCart(c => c.filter(i => i.menuItemId !== item.menuItemId))} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-8 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-slate-400"><span>Service Charge (10%)</span><span className="font-medium">{formatCurrency(taxValue)}</span></div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Grand Total</span>
                  <span className="text-3xl font-black text-[#D4AF37] tracking-tighter">{formatCurrency(grandTotal)}</span>
                </div>
                {/* Payment & Balance Section */}
                <div className="pt-8 border-t border-white/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Amount Received</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0.00" 
                          value={amountReceived} 
                          onChange={e => setAmountReceived(e.target.value)} 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#D4AF37] transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Change / Balance</label>
                      <div className="py-4 pr-1">
                        <span className={`text-2xl font-black tracking-tighter ${balance > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {formatCurrency(balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder} 
                  disabled={cart.length === 0 || savingPosOrder} 
                  className="w-full bg-white text-[#0F172A] py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] mt-6 shadow-2xl hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center justify-center gap-3"
                >
                  {savingPosOrder ? <div className="w-5 h-5 border-2 border-[#0F172A]/20 border-t-[#0F172A] rounded-full animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  {savingPosOrder ? 'Authenticating...' : 'Confirm Order & Print'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Orders Monitoring - Modern Card */}
        <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Kitchen <span className="text-blue-600">Sync</span></h3>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Real-time order monitoring</p>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input type="text" placeholder="Filter orders..." className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/5 min-w-[240px]" />
            </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto max-h-[800px] custom-scrollbar space-y-6">
            {loading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto" /></div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <History className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-bold">No orders recorded</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order._id} className="group p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all duration-500 bg-white hover:shadow-2xl hover:shadow-blue-500/5">
                  <div className="flex flex-col lg:flex-row justify-between gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.orderStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          order.orderStatus === 'Preparing' ? 'bg-blue-50 text-blue-600' :
                          order.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {order.orderStatus}
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {order.paymentStatus}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Ref: #{order._id.slice(-8)}</span>
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {order.orderType === 'Dine-in' ? `Table ${order.tableNumber}` : 
                           order.orderType === 'Room' ? `Room ${order.roomNumber}` : 
                           order.orderType === 'Take-away' ? 'Take-away Order' : 'Delivery Service'}
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </h4>
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                          
                          {/* Customer Details Section */}
                          <div className="mt-3 flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                Placed By: <span className="text-blue-600 ml-1">{order.customerName || 'Guest'}</span>
                              </span>
                            </div>
                            {(order.contactNumber || order.orderType === 'Delivery') && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                                  Contact: <span className="text-emerald-600 ml-1">{order.contactNumber || 'N/A'}</span>
                                </span>
                              </div>
                            )}
                          </div>

                          {order.orderType === 'Delivery' && (
                            <div className="flex flex-col gap-1 mt-3">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Address: {order.deliveryAddress}</p>
                              {order.coordinates && (
                                <a 
                                  href={`https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1 mt-1"
                                >
                                  View GPS Location on Google Maps
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <span className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-[10px] font-black text-slate-900 border border-slate-200">{i.quantity}</span>
                            <span className="text-xs font-bold text-slate-700">{i.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between min-w-[180px]">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-6">
                        {order.paymentStatus === 'Unpaid' && (
                          <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            {settlingOrderId === order._id ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Process Payment</span>
                                  <button onClick={() => setSettlingOrderId(null)} className="text-[10px] text-rose-500 font-bold hover:underline">Cancel</button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Received</label>
                                    <input 
                                      type="number" 
                                      placeholder="0.00"
                                      value={settleAmount}
                                      onChange={(e) => setSettleAmount(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#D4AF37]"
                                    />
                                  </div>
                                  <div className="space-y-1 text-right">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Balance</label>
                                    <div className="py-2 text-sm font-black text-emerald-600">
                                      {formatCurrency(Math.max(Number(settleAmount || 0) - order.totalAmount, 0))}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => updatePaymentStatus(order._id, { 
                                    paymentStatus: 'Paid', 
                                    amountReceived: Number(settleAmount), 
                                    balance: Math.max(Number(settleAmount || 0) - order.totalAmount, 0)
                                  })}
                                  disabled={Number(settleAmount || 0) < order.totalAmount}
                                  className="w-full py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-30"
                                >
                                  Complete Payment
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setSettlingOrderId(order._id)}
                                className="w-full py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                              >
                                Settle Payment
                              </button>
                            )}
                          </div>
                        )}
                        
                        {order.paymentStatus === 'Paid' && order.amountReceived > 0 && (
                          <div className="flex flex-col gap-1 p-3 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                             <div className="flex justify-between text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                               <span>Received</span>
                               <span>{formatCurrency(order.amountReceived)}</span>
                             </div>
                             <div className="flex justify-between text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                               <span>Change</span>
                               <span>{formatCurrency(order.balance)}</span>
                             </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handlePrintReceipt(order)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border border-slate-100"
                            title="Print Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <select 
                            value={order.orderStatus} 
                            onChange={e => updateOrderStatus(order._id, e.target.value)} 
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer flex-1"
                          >
                            {['Pending', 'Preparing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {order.orderStatus === 'Completed' ? (
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5" /></div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center animate-pulse shrink-0"><Clock className="w-5 h-5" /></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
