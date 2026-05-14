/**
 * AdminPOS.jsx
 * Premium Point of Sale Dashboard for Hotel Janro.
 * Handles order creation, multi-order settlement, and thermal receipt printing.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST, getImageUrl } from '../../../api.js';
import {
  ShoppingCart,
  Search,
  Clock,
  Gem,
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
  Phone,
  MapPin,
  X,
  Truck,
  Printer,
  Banknote
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export function AdminPOS() {
  // --- 1. STATE MANAGEMENT ---
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  const clearError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const [posForm, setPosForm] = useState({
    orderType: 'Dine-in',
    tableNumber: '',
    roomNumber: '',
    deliveryAddress: '',
    contactNumber: '',
    customerName: '',
    discount: '0',
    coordinates: null,
    deliveryFee: 0
  });
  const [cart, setCart] = useState([]);
  const [selectedPosMenuItemId, setSelectedPosMenuItemId] = useState('');
  const [selectedPosQuantity, setSelectedPosQuantity] = useState('1');
  const [selectedPortion, setSelectedPortion] = useState('Full');
  const [savingPosOrder, setSavingPosOrder] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [amountReceived, setAmountReceived] = useState('');
  const [balance, setBalance] = useState(0);

  const [settlingOrderId, setSettlingOrderId] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [isPaidToggle, setIsPaidToggle] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(new Date());

  const HOTEL_COORDS = { lat: 6.9458, lng: 80.1250 };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // --- 2. CALCULATIONS & DERIVED DATA ---
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const serviceCharge = useMemo(() => {
    return (posForm.orderType === "Dine-in" || posForm.orderType === "Room") ? subtotal * 0.1 : 0;
  }, [subtotal, posForm.orderType]);

  const { deliveryFee, distance } = useMemo(() => {
    if (posForm.orderType === "Delivery") {
      // Prioritize manual input if available
      if (posForm.deliveryFee > 0) {
        return { deliveryFee: posForm.deliveryFee, distance: 0 };
      }
      if (posForm.coordinates) {
        const straightDist = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, posForm.coordinates.lat, posForm.coordinates.lng);
        // Apply a 1.2x winding factor to estimate actual road distance
        const dist = straightDist * 1.2;
        const fee = (dist > 1 && dist <= 15) ? subtotal * 0.1 * Math.floor(dist) : 0;
        return { deliveryFee: fee, distance: dist };
      }
    }
    return { deliveryFee: 0, distance: 0 };
  }, [subtotal, posForm.orderType, posForm.coordinates, posForm.deliveryFee]);

  const discountValue = Number(posForm.discount || 0);
  const grandTotal = Math.max(subtotal + serviceCharge + deliveryFee - discountValue, 0);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosForm(prev => ({
          ...prev,
          coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
        setIsGettingLocation(false);
        toast.success('GPS Pinned!');
      },
      () => {
        toast.error('Location failed');
        setIsGettingLocation(false);
      }
    );
  };

  const autoGeocode = async (address) => {
    if (!address || address.length < 5) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosForm(prev => ({
          ...prev,
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) }
        }));
      }
    } catch (e) { console.error(e); }
  };

  // Auto-fill Logic for Table/Room
  useEffect(() => {
    if (orders.length > 0) {
      let existingOrder = null;
      if (posForm.orderType === 'Dine-in' && posForm.tableNumber) {
        existingOrder = orders.find(o => o.tableNumber === posForm.tableNumber && o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled');
      } else if (posForm.orderType === 'Room' && posForm.roomNumber) {
        existingOrder = orders.find(o => o.roomNumber === posForm.roomNumber && o.orderStatus !== 'Completed' && o.orderStatus !== 'Cancelled');
      }

      if (existingOrder) {
        setPosForm(prev => ({
          ...prev,
          customerName: existingOrder.customerName || prev.customerName,
          contactNumber: existingOrder.contactNumber || prev.contactNumber
        }));
      }
    }
  }, [posForm.tableNumber, posForm.roomNumber, posForm.orderType, orders]);


  useEffect(() => {
    const received = Number(amountReceived || 0);
    if (isPaidToggle && received < grandTotal) {
      setBalance(0);
    } else {
      setBalance(received > 0 ? Math.max(received - grandTotal, 0) : 0);
    }
  }, [amountReceived, grandTotal, isPaidToggle]);

  // --- 3. DATA FETCHING ---
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => loadOrders(true), 30000);
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
      setOrders(Array.isArray(data) ? data : []);
      setLastPollTime(new Date());
    } catch (e) { console.error(e); }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // --- 4. CART OPERATIONS ---
  const addPosItem = () => {
    const menuItem = menuItems.find((item) => item._id === selectedPosMenuItemId);
    if (!menuItem) {
      toast.warning("Please select a dish first!");
      return;
    }
    const quantity = Number(selectedPosQuantity || 1);
    const price = menuItem.hasPortions
      ? menuItem.portions.find(p => p.portionType === selectedPortion)?.price
      : menuItem.price;

    setCart((prev) => {
      const cartItemId = `${menuItem._id}-${menuItem.hasPortions ? selectedPortion : 'single'}`;
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        cartItemId, menuItemId: menuItem._id, name: menuItem.name,
        portion: menuItem.hasPortions ? selectedPortion : '', price: price, quantity
      }];
    });
    setSelectedPosMenuItemId('');
    setSelectedPosQuantity('1');
    setSelectedPortion('Full');
  };

  // --- 5. ORDER PLACEMENT & SETTLEMENT ---
  const handlePlaceOrder = async () => {
    // Comprehensive Validation
    const errors = {};

    // General Empty Check
    const isCartEmpty = cart.length === 0;
    
    if (isCartEmpty) {
      toast.error("Your cart is empty. Please add at least one item.");
      return;
    }

    // Name Validation
    if (!posForm.customerName || posForm.customerName.trim().length < 2) {
      errors.customerName = "Guest Name is required (at least 2 characters).";
    } else if (!/^[a-zA-Z\s.]+$/.test(posForm.customerName)) {
      errors.customerName = "Invalid Guest Name: Only letters allowed.";
    }

    // Phone Validation
    if (posForm.orderType !== 'Take-away') {
      if (!posForm.contactNumber || posForm.contactNumber.trim().length === 0) {
        errors.contactNumber = "Contact number is required.";
      }
    }

    if (posForm.contactNumber && !/^\d{10}$/.test(posForm.contactNumber)) {
      errors.contactNumber = "Invalid Phone Number: Must be 10 digits.";
    }

    // Contextual Validation
    if (posForm.orderType === 'Dine-in') {
      if (!posForm.tableNumber) errors.tableNumber = "Table is required.";
    } else if (posForm.orderType === 'Room') {
      if (!posForm.roomNumber) errors.roomNumber = "Room is required.";
    } else if (posForm.orderType === 'Delivery') {
      if (!posForm.deliveryAddress) errors.deliveryAddress = "Address is missing.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Required fields are missing or invalid");
      return;
    }


    setSavingPosOrder(true);
    try {
      const receivedNum = Number(amountReceived || 0);
      const isPaid = isPaidToggle || (receivedNum >= grandTotal && grandTotal > 0) || (grandTotal === 0);

      const payload = {
        orderType: posForm.orderType,
        items: cart.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          portion: i.portion || "",
          price: i.price
        })),
        discount: discountValue,
        customerName: posForm.customerName || "Walk-in Guest",
        tableNumber: posForm.tableNumber,
        roomNumber: posForm.roomNumber,
        deliveryAddress: posForm.deliveryAddress,
        contactNumber: posForm.contactNumber,
        coordinates: posForm.coordinates,
        serviceCharge,
        deliveryFee,
        subtotal,
        totalAmount: grandTotal,
        paymentStatus: isPaid ? 'Paid' : 'Unpaid',
        amountReceived: receivedNum,
        balance: balance
      };

      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response?._id) throw new Error("Failed to create order");

      toast.success(`Order #${response._id.slice(-6).toUpperCase()} placed!`);
      handlePrintReceipt(response);

      setCart([]);
      setAmountReceived('');
      setIsPaidToggle(false);
      setPosForm(prev => ({
        ...prev,
        discount: '0'
      }));
      await loadOrders();
    } catch (e) {
      console.error(e);
      toast.error('Order Placement Failed', {
        description: e.message || "Something went wrong while connecting to the server.",
        duration: 5000,
      });
    }
    finally { setSavingPosOrder(false); }
  };

  const handlePrintReceipt = (order) => {
    // Basic safety check
    if (!order) return toast.error("No order data provided");

    // Find related unpaid orders to combine into a single bill if it's a table/room order
    let relatedOrders = [order];
    if (order.paymentStatus === 'Unpaid' && (order.tableNumber || order.roomNumber)) {
      relatedOrders = (orders || []).filter(o => 
        o.paymentStatus === 'Unpaid' && 
        ((order.tableNumber && o.tableNumber === order.tableNumber) || 
         (order.roomNumber && o.roomNumber === order.roomNumber))
      );
    }

    const combinedItems = relatedOrders.flatMap(o => o.items);
    const combinedSubtotal = relatedOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const combinedServiceCharge = relatedOrders.reduce((s, o) => s + (o.serviceCharge || 0), 0);
    const combinedDeliveryFee = relatedOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0);
    const combinedDiscount = relatedOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const combinedTotalAmount = relatedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalQty = combinedItems.reduce((s, it) => s + it.quantity, 0);

    // Calculate daily sequence number
    const orderDate = new Date(order.createdAt).toLocaleDateString();
    const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
    const dailyNum = sameDayOrders.length - sameDayOrders.indexOf(order);
    const dailySeqStr = dailyNum.toString().padStart(3, '0');

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return toast.error('Pop-up blocked!');

    const itemsHtml = combinedItems.map(it => `
      <tr>
        <td style="padding: 2px 0;">${it.name}${it.portion ? ` (${it.portion})` : ''}</td>
        <td style="text-align: center;">${it.quantity}</td>
        <td style="text-align: right;">${((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

    const qrHtml = `
      <div style="text-align: center; margin-top: 10px;">
        <div style="font-size: 8px; margin-bottom: 2px;">SCAN TO FEEDBACK</div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=JANRO-ORD-${order._id}" style="width:60px; height:60px; margin: 0 auto;" />
      </div>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hotel Janro - Bill #${order._id.slice(-6).toUpperCase()}</title>
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
          ${order?.tableNumber ? `<div>Table: ${order.tableNumber}</div>` : ''}
          ${order?.roomNumber ? `<div>Room: ${order.roomNumber}</div>` : ''}
          ${order?.customerName ? `<div>Guest: ${order.customerName}</div>` : ''}
          ${order?.contactNumber ? `<div>Phone: ${order.contactNumber}</div>` : ''}
          ${order?.deliveryAddress ? `<div>Address: ${order.deliveryAddress}</div>` : ''}
          
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
            <div class="total-row">NET TOTAL: Rs ${(combinedTotalAmount || 0).toLocaleString()}</div>
            <div class="divider"></div>
            ${(order?.amountReceived || 0) > 0 ? `
              <div>Cash Paid: Rs ${(order?.amountReceived || 0).toLocaleString()}</div>
              <div style="font-weight:bold;">Balance: Rs ${(order?.balance || 0).toLocaleString()}</div>
            ` : ''}
          </div>

          ${qrHtml}

          <div class="footer">
            <p style="margin: 5px 0;">*** Thank You! ***</p>
            <p style="margin: 0;">Please retain this bill.</p>
            <p style="margin: 0; font-size: 7px; color: #666;">Generated by Antigravity OS</p>
          </div>
          
          <script>
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
              // Fallback for browsers that don't support onafterprint well
              setTimeout(function() { window.close(); }, 2000);
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- 7. STATUS & PAYMENT UPDATES ---
  const updateOrderStatus = async (orderId, orderStatus) => {
    await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ orderStatus }) });
    await loadOrders();
  };

  const updatePaymentStatus = async (orderIdOrIds, updates) => {
    const ids = Array.isArray(orderIdOrIds) ? orderIdOrIds : [orderIdOrIds];
    try {
      await Promise.all(ids.map(id => 
        apiFetch(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
      ));
      setSettlingOrderId(null);
      setSettleAmount('');
      toast.success(`${ids.length > 1 ? 'Orders' : 'Order'} settled successfully!`);
      await loadOrders();
    } catch (e) {
      toast.error("Failed to settle order(s)");
      console.error(e);
    }
  };

  const today = new Date().toLocaleDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === today);
  const activeOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
  const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + (o.totalAmount || 0), 0);

  // --- 8. MAIN RENDER ---
  return (
    <div className="space-y-4">
      {/* Small Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Today Orders', value: todayOrders.length, icon: ShoppingCart, color: 'blue' },
          { label: 'Active Kitchen', value: activeOrdersCount, icon: Clock, color: 'amber' },
          { label: 'Net Revenue', value: formatCurrency(todayRevenue), icon: Gem, color: 'emerald' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
              <h3 className="text-sm font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[550px_1fr] 2xl:grid-cols-[650px_1fr]">
        {/* Digital Checkout */}
        <div className="bg-[#0F172A] p-4 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-md font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>Order <span className="text-[#D4AF37]">Billing</span></h3>
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                <select value={posForm.orderType} onChange={e => setPosForm({ ...posForm, orderType: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] outline-none">
                  {['Dine-in', 'Room', 'Delivery', 'Take-away'].map(t => <option key={t} value={t} className="text-black">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Guest Name</label>
                <input 
                  type="text" 
                  placeholder="Kasun Tharaka" 
                  value={posForm.customerName} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || /^[a-zA-Z\s.]+$/.test(val)) {
                      setPosForm({ ...posForm, customerName: val });
                      clearError('customerName');
                    }
                  }} 
                  className={`w-full bg-white/5 border ${validationErrors.customerName ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`} 
                />
                {validationErrors.customerName && <p className="text-[9px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.customerName}</p>}
              </div>

              {posForm.orderType === 'Dine-in' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assign Table</label>
                    <select 
                      value={posForm.tableNumber} 
                      onChange={e => { setPosForm({ ...posForm, tableNumber: e.target.value }); clearError('tableNumber'); }} 
                      className={`w-full bg-white/5 border ${validationErrors.tableNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] text-white outline-none`}
                    >
                      <option value="" className="bg-slate-900 text-white">Select Table</option>
                      {[...Array(15)].map((_, i) => <option key={i} value={`T-${i + 1}`} className="bg-slate-900 text-white">Table {i + 1}</option>)}
                    </select>
                    {validationErrors.tableNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.tableNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</label>
                    <input 
                      type="tel" 
                      placeholder="07XXXXXXXX" 
                      value={posForm.contactNumber} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || /^\d{0,10}$/.test(val)) {
                          setPosForm({ ...posForm, contactNumber: val });
                          clearError('contactNumber');
                        }
                      }} 
                      className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`} 
                    />
                    {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
                  </div>
                </>
              )}

              {posForm.orderType === 'Room' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assign Room</label>
                    <select 
                      value={posForm.roomNumber} 
                      onChange={e => { setPosForm({ ...posForm, roomNumber: e.target.value }); clearError('roomNumber'); }} 
                      className={`w-full bg-white/5 border ${validationErrors.roomNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] text-white outline-none`}
                    >
                      <option value="" className="bg-slate-900 text-white">Select Room</option>
                      {[...Array(10)].map((_, i) => <option key={i} value={`${101 + i}`} className="bg-slate-900 text-white">Room {101 + i}</option>)}
                    </select>
                    {validationErrors.roomNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.roomNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</label>
                    <input 
                      type="tel" 
                      placeholder="07XXXXXXXX" 
                      value={posForm.contactNumber} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || /^\d{0,10}$/.test(val)) {
                          setPosForm({ ...posForm, contactNumber: val });
                          clearError('contactNumber');
                        }
                      }} 
                      className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`} 
                    />
                    {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
                  </div>
                </>
              )}

              {posForm.orderType === 'Delivery' && (
                <>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="123 Main Street, Dompe"
                      value={posForm.deliveryAddress}
                      onChange={e => { setPosForm({ ...posForm, deliveryAddress: e.target.value }); clearError('deliveryAddress'); }}
                      onBlur={(e) => autoGeocode(e.target.value)}
                      className={`w-full bg-white/5 border ${validationErrors.deliveryAddress ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
                    />
                    {validationErrors.deliveryAddress && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.deliveryAddress}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Delivery Fee (Rs)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={posForm.deliveryFee} 
                      onChange={e => setPosForm({ ...posForm, deliveryFee: Number(e.target.value) })} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] outline-none text-[#D4AF37] font-black" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</label>
                    <input 
                      type="tel" 
                      placeholder="07XXXXXXXX" 
                      value={posForm.contactNumber} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || /^\d{0,10}$/.test(val)) {
                          setPosForm({ ...posForm, contactNumber: val });
                          clearError('contactNumber');
                        }
                      }} 
                      className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`} 
                    />
                    {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
                  </div>
                </>
              )}

              {posForm.orderType === 'Take-away' && (
                <div className="space-y-1 col-span-2">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Contact Number</label>
                  <input 
                    type="tel" 
                    placeholder="0771234567" 
                    value={posForm.contactNumber} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "" || /^\d{0,10}$/.test(val)) {
                        setPosForm({ ...posForm, contactNumber: val });
                        clearError('contactNumber');
                      }
                    }} 
                    className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-white/10'} rounded-xl px-2 py-1.5 text-[11px] outline-none`} 
                  />
                  {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
                </div>
              )}
            </div>

            {/* Menu Selection */}
            <div className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex gap-2">
                <select value={selectedPosMenuItemId} onChange={e => setSelectedPosMenuItemId(e.target.value)} className="flex-1 bg-white text-black rounded-lg px-2 py-1.5 text-[11px] font-bold outline-none">
                  <option value="">Select dish...</option>
                  {menuItems.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
                </select>
                <input type="number" min="1" value={selectedPosQuantity} onChange={e => setSelectedPosQuantity(e.target.value)} className="w-10 bg-white/10 border border-white/10 rounded-xl text-center text-xs outline-none" />
                <button onClick={addPosItem} className="bg-[#D4AF37] text-[#0F172A] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Add</button>
              </div>
              {selectedPosMenuItemId && menuItems.find(i => i._id === selectedPosMenuItemId)?.hasPortions && (
                <div className="flex gap-2">
                  {['Full', 'Half'].map(p => (
                    <button key={p} onClick={() => setSelectedPortion(p)} className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase border transition-all ${selectedPortion === p ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A]' : 'bg-white/5 border-white/10 text-white'}`}>
                      {p} Portion
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Preview */}
            <div className="max-h-[120px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {cart.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-center bg-white/5 p-1.5 rounded-xl border border-white/5 text-[10px]">
                  <div><span className="font-bold">{item.name}</span> {item.portion && <span className="text-[#D4AF37] text-[8px] ml-1">({item.portion})</span>}</div>
                  <div className="flex items-center gap-3">
                    <span>{item.quantity}x {formatCurrency(item.price)}</span>
                    <button onClick={() => setCart(c => c.filter(i => i.cartItemId !== item.cartItemId))} className="text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fees & Totals Section */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400">
                {serviceCharge > 0 && <div className="flex justify-between col-span-2"><span>Service Charge (10%)</span><span className="text-[#D4AF37] font-bold">+{formatCurrency(serviceCharge)}</span></div>}
                {deliveryFee > 0 && <div className="flex justify-between col-span-2"><span>Delivery Fee (Dist: {distance.toFixed(1)}km)</span><span className="text-blue-400 font-bold">+{formatCurrency(deliveryFee)}</span></div>}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Bill</span>
                <span className="text-xl font-black text-[#D4AF37]">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[7px] text-slate-500 uppercase tracking-widest">Discount</label>
                  <input type="number" placeholder="0" value={posForm.discount} onChange={e => setPosForm({ ...posForm, discount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] text-slate-500 uppercase tracking-widest">Received</label>
                  <input type="number" placeholder="0" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none text-white" />
                </div>
                <div className="flex flex-col justify-center items-center gap-1">
                  <label className="text-[7px] text-slate-500 uppercase tracking-widest">Paid</label>
                  <input type="checkbox" checked={isPaidToggle} onChange={e => setIsPaidToggle(e.target.checked)} className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
                </div>
                <div className="text-right">
                  <label className="text-[7px] text-slate-500 uppercase tracking-widest">Balance</label>
                  <p className="text-sm font-black text-emerald-400">{formatCurrency(balance)}</p>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={savingPosOrder} className="w-full bg-[#D4AF37] text-[#0F172A] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg">
                {savingPosOrder ? 'Saving Order...' : 'Confirm & Print'}
              </button>
            </div>
          </div>
        </div>

        {/* Kitchen Sync Monitor */}
        <div className="bg-white rounded-[2rem] border border-slate-100 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-md font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>Kitchen <span className="text-blue-600">Sync</span></h3>
            <div className="flex items-center gap-4">
              {/* Status Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[7px] font-black uppercase tracking-widest border-r border-slate-100 pr-4">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> 
                  Pending
                </div>
                <div className="flex items-center gap-1.5 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> 
                  Preparing
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> 
                  Done
                </div>
                <div className="flex items-center gap-1.5 text-rose-600">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> 
                  Cancel
                </div>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                Live {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-4">
            {orders.map((order, idx) => {
              // Calculate daily sequence number
              const orderDate = new Date(order.createdAt).toLocaleDateString();
              const today = new Date().toLocaleDateString();

              // Filter orders from the same day as this order, then find its relative index
              const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
              // Since orders are newest first, we count from the end of the sameDayOrders list
              const dailySequenceNum = sameDayOrders.length - sameDayOrders.indexOf(order);

              const statusStyles =
                order.orderStatus === 'Completed' ? { border: 'border-emerald-500/30', hover: 'hover:border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', borderLight: 'border-emerald-100' } :
                  order.orderStatus === 'Preparing' ? { border: 'border-blue-500/30', hover: 'hover:border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', borderLight: 'border-blue-100' } :
                    order.orderStatus === 'Cancelled' ? { border: 'border-rose-500/30', hover: 'hover:border-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', borderLight: 'border-rose-100' } :
                      { border: 'border-amber-500/30', hover: 'hover:border-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', borderLight: 'border-amber-100' };

              return (
                <div key={order._id} className={`relative group p-5 rounded-[2rem] border-2 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.1)] transition-all duration-500 ${statusStyles.border} ${statusStyles.hover}`}>
                  <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full ${statusStyles.dot} shadow-[0_0_15px_${statusStyles.dot}]`} />

                  <div className="pl-3 space-y-4">
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${statusStyles.bg} ${statusStyles.text} px-3 py-1 rounded-full border ${statusStyles.borderLight} uppercase tracking-widest text-[8px]`}>
                          Order {dailySequenceNum.toString().padStart(3, '0')}
                        </span>
                        <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">#{order._id.slice(-4).toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                        <p className="text-[9px] text-slate-900 font-black tracking-widest">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          {order.orderType === 'Dine-in' ? `Table ${order.tableNumber}` :
                           order.orderType === 'Room' ? `Room ${order.roomNumber}` : order.orderType}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-[#D4AF37]" />
                          {order.customerName || 'Boutique Guest'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[7px] font-black uppercase px-2.5 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {order.paymentStatus}
                        </span>
                        <p className="text-xl font-black text-[#0F172A] mt-2 leading-none" style={{ fontFamily: 'DM Serif Display, serif' }}>
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-100 text-[9px] font-black text-slate-700">
                          <span className="text-[#D4AF37] font-black text-[10px]">{it.quantity}x</span> 
                          <span className="uppercase tracking-wider">{it.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                      <select value={order.orderStatus} onChange={e => updateOrderStatus(order._id, e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[9px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/5 cursor-pointer">
                        {['Pending', 'Preparing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="px-2.5 py-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-100 flex items-center gap-1.5 transition-all"
                        title="Print Bill"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Bill</span>
                      </button>
                      {order.paymentStatus === 'Unpaid' && (
                        <button 
                          onClick={() => { 
                            const related = orders.filter(o => 
                              o.paymentStatus === 'Unpaid' && 
                              ((order.tableNumber && o.tableNumber === order.tableNumber) || 
                               (order.roomNumber && o.roomNumber === order.roomNumber))
                            );
                            const total = related.reduce((s, o) => s + o.totalAmount, 0);
                            setSettlingOrderId(order._id); 
                            setSettleAmount(total); 
                          }} 
                          className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-lg"
                        >
                          Settle
                        </button>
                      )}
                    </div>

                    {settlingOrderId === order._id && (() => {
                      const relatedOrders = orders.filter(o => 
                        o.paymentStatus === 'Unpaid' && 
                        ((order.tableNumber && o.tableNumber === order.tableNumber) || 
                         (order.roomNumber && o.roomNumber === order.roomNumber))
                      );
                      const combinedTotal = relatedOrders.reduce((s, o) => s + o.totalAmount, 0);
                      const isMultiple = relatedOrders.length > 1;

                      return (
                        <div className="mt-2 p-4 bg-slate-900 rounded-[1.5rem] space-y-3 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                              <Banknote className="w-3 h-3" /> {isMultiple ? `Settle All (${relatedOrders.length} Orders)` : 'Process Payment'}
                            </span>
                            <button onClick={() => { setSettlingOrderId(null); setValidationErrors({}); }} className="hover:rotate-90 transition-transform">
                              <X className="w-4 h-4 text-rose-400" />
                            </button>
                          </div>

                          {isMultiple && (
                            <div className="bg-white/5 rounded-xl p-2 border border-[#D4AF37]/20">
                              <p className="text-[7px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Items for {order.tableNumber ? `Table ${order.tableNumber}` : `Room ${order.roomNumber}`}</p>
                              <div className="flex flex-wrap gap-1">
                                {relatedOrders.flatMap(o => o.items).map((it, idx) => (
                                  <span key={idx} className="text-[8px] text-white/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{it.quantity}x {it.name}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cash Received</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  autoFocus
                                  value={settleAmount} 
                                  onChange={e => { setSettleAmount(e.target.value); clearError('settleAmount'); }} 
                                  className={`flex-1 bg-white/5 border ${validationErrors.settleAmount ? 'border-rose-500' : 'border-white/10'} rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4AF37] font-black`} 
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2 text-right border border-white/5">
                              <label className="block text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-1">Change / Balance</label>
                              <div className="text-sm font-black text-emerald-400">
                                {formatCurrency(Math.max(Number(settleAmount || 0) - combinedTotal, 0))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 px-2 py-2 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex justify-between text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                              <span>Subtotal Sum</span>
                              <span>{formatCurrency(relatedOrders.reduce((s, o) => s + (o.subtotal || 0), 0))}</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-[#D4AF37] uppercase tracking-widest font-bold">
                              <span>Total Service Charge (10%)</span>
                              <span>{formatCurrency(relatedOrders.reduce((s, o) => s + (o.serviceCharge || 0), 0))}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
                              <input type="checkbox" id="forcePaid" checked={isPaidToggle} onChange={e => setIsPaidToggle(e.target.checked)} className="accent-[#D4AF37]" />
                              <label htmlFor="forcePaid" className="text-[7px] text-slate-400 uppercase tracking-widest cursor-pointer">Exact Payment / Paid via Card</label>
                            </div>
                            {relatedOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0) > 0 && (
                              <div className="flex justify-between text-[9px] text-blue-400 uppercase tracking-widest font-bold">
                                <span>Total Delivery Fee</span>
                                <span>{formatCurrency(relatedOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0))}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Net Total: <span className="text-[#D4AF37] ml-2">{formatCurrency(combinedTotal)}</span></p>
                            {validationErrors.settleAmount && (
                              <p className="text-[8px] text-rose-500 font-bold uppercase animate-pulse">
                                {validationErrors.settleAmount}
                              </p>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              const amount = Number(settleAmount);
                              if (!isPaidToggle) {
                                if (!settleAmount || amount <= 0) {
                                  setValidationErrors({ settleAmount: "Please enter cash amount" });
                                  return;
                                }
                                if (amount < combinedTotal) {
                                  setValidationErrors({ settleAmount: `Insufficient: Need Rs ${combinedTotal.toLocaleString()}` });
                                  return;
                                }
                              }
                              
                              updatePaymentStatus(relatedOrders.map(o => o._id), { 
                                paymentStatus: 'Paid', 
                                amountReceived: isPaidToggle && amount === 0 ? combinedTotal : amount, 
                                balance: isPaidToggle && amount === 0 ? 0 : Math.max(amount - combinedTotal, 0),
                                orderStatus: 'Completed'
                              });
                            }} 
                            className="w-full py-3 bg-[#D4AF37] text-[#0F172A] text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-lg active:scale-95"
                          >
                            Complete Settlement
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Toaster position="top-right" expand={true} richColors />
    </div>
  );
}
