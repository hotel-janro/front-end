// Handles orders, billing, and thermal receipts
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
  Banknote,
  TrendingUp,
  Filter,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast, Toaster } from 'sonner';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { useSocket } from '../../../context/SocketContext.jsx';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// Memoized component for faster rendering of menu items
const PosMenuItem = React.memo(({ item, handleAddVisualItem }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-400 flex flex-row items-center p-2.5 gap-3 hover:border-slate-300 transition-colors shadow-sm ${!item.isAvailable ? 'opacity-50 grayscale' : 'cursor-pointer'
        }`}
      onClick={() => {
        if (!item.hasPortions && item.isAvailable) {
          handleAddVisualItem(item, 'Full');
        }
      }}
    >
      <div className="relative w-[70px] h-[70px] bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <Utensils className="w-6 h-6" />
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest bg-rose-500 px-1 rounded-sm">Out</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-2">{item.name}</h4>
          {!item.hasPortions && (
            <div className="text-xs font-black text-emerald-400 flex-shrink-0">{formatCurrency(item.price)}</div>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
          {item.hasPortions ? (
            item.portions.map(p => (
              <button
                key={p.portionType}
                disabled={!item.isAvailable}
                onClick={() => handleAddVisualItem(item, p.portionType)}
                className="px-2 py-1 bg-slate-100 hover:bg-[#D4AF37] hover:text-[#0F172A] border border-slate-400 text-slate-600 rounded-md text-[9px] font-black uppercase transition-colors"
              >
                {p.portionType[0]}: {formatCurrency(p.price).replace('Rs ', '').split('.')[0]}
              </button>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.item._id === next.item._id && prev.item.isAvailable === next.item.isAvailable);

export function AdminPOS() {
  const { settings } = useSettings();
  const socket = useSocket();
const [menuItems, setMenuItems] = useState([]);
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [validationErrors, setValidationErrors] = useState({});

// Luxury Tabbed POS States
const [activeTab, setActiveTab] = useState('terminal'); // 'terminal', 'kitchen', 'analytics'
const [selectedCategory, setSelectedCategory] = useState('All');
const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
const [menuSearch, setMenuSearch] = useState('');
const [portionModalItem, setPortionModalItem] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 8;

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
  deliveryFee: 0,
  paymentMethod: 'Cash'
});
const [cart, setCart] = useState([]);
const [selectedPosMenuItemId, setSelectedPosMenuItemId] = useState('');
const [selectedPosQuantity, setSelectedPosQuantity] = useState('1');
const [selectedPortion, setSelectedPortion] = useState('Full');
const [savingPosOrder, setSavingPosOrder] = useState(false);
const [isGettingLocation, setIsGettingLocation] = useState(false);

const [amountReceived, setAmountReceived] = useState('');
const [balance, setBalance] = useState(0);
const [isPaidToggle, setIsPaidToggle] = useState(false);

const [settleModalOrder, setSettleModalOrder] = useState(null);
const [settleTab, setSettleTab] = useState('full'); // 'full', 'equal', 'custom', 'item'
const [splitWays, setSplitWays] = useState(2);
const [customAmount, setCustomAmount] = useState('');
const [paymentMethod, setPaymentMethod] = useState('Cash');
const [itemSplitChecked, setItemSplitChecked] = useState({});
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

// Logic for totals and delivery fees
const subtotal = useMemo(() => {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [cart]);

const serviceCharge = useMemo(() => {
  return (posForm.orderType === "Dine-in" || posForm.orderType === "Room") ? subtotal * 0.1 : 0;
}, [subtotal, posForm.orderType]);

const deliveryFee = posForm.orderType === "Delivery" ? Number(posForm.deliveryFee || 0) : 0;

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
  } catch (e) { /* Ignore format errors */ }
};

// Auto-fill guest details for existing rooms/tables
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

// Load menu and orders on mount
useEffect(() => {
  refreshData();
  const interval = setInterval(() => loadOrders(true), 30000);
  return () => clearInterval(interval);
}, []);

// Real-time socket event listeners
useEffect(() => {
  if (!socket) return;

  socket.on("orderCreated", (newOrder) => {
    setOrders((prev) => {
      if (prev.some((o) => o._id === newOrder._id)) return prev;
      toast.info(`New Order #${newOrder._id.slice(-6).toUpperCase()} placed!`, {
        description: `By: ${newOrder.customerName || "Guest"} (${newOrder.orderType})`,
        duration: 6000,
      });
      return [newOrder, ...prev];
    });
  });

  socket.on("orderUpdated", (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
    toast.success(`Order #${updatedOrder._id.slice(-6).toUpperCase()} updated!`, {
      description: `Status: ${updatedOrder.orderStatus} | Payment: ${updatedOrder.paymentStatus}`,
      duration: 5000,
    });
  });

  socket.on("orderDeleted", ({ id }) => {
    setOrders((prev) => prev.filter((o) => o._id !== id));
    toast.warning("An order was deleted.", { duration: 4000 });
  });

  return () => {
    socket.off("orderCreated");
    socket.off("orderUpdated");
    socket.off("orderDeleted");
  };
}, [socket]);

const refreshData = async () => {
  setLoading(true);
  await Promise.allSettled([loadMenu(), loadOrders()]);
  setLoading(false);
};

const loadMenu = async () => {
  try {
    const data = await apiFetch('/menu?populate=inventoryItem');
    setMenuItems(Array.isArray(data) ? data : []);
  } catch (e) {
    console.error("POS: Failed to load menu:", e);
    toast.error('Menu Loading Failed', {
      description: "Something went wrong while fetching the culinary collection.",
      duration: 5000,
    });
  }
};

const loadOrders = async (isPoll = false) => {
  try {
    const data = await apiFetch('/orders');
    setOrders(Array.isArray(data) ? data : []);
    setLastPollTime(new Date());
  } catch (e) { /* error logged */ }
};


// Add item to active cart
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

// Validate and submit order to backend
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

  // 2. Room Number Validation
  if (posForm.roomNumber || posForm.orderType === 'Room') {
    const rNum = Number(posForm.roomNumber);
    if (!posForm.roomNumber || isNaN(rNum) || rNum < 1 || rNum > 10) {
      toast.error(`Access Denied: Only Room 1 to Room 10 are available in ${settings.hotelName}.`);
      return;
    }
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
    const receivedNum = posForm.paymentMethod === 'Card' ? grandTotal : Number(amountReceived || 0);
    const isPaid = isPaidToggle || (receivedNum >= grandTotal && grandTotal > 0) || (grandTotal === 0);

    const newItems = cart.map(i => ({
      menuItemId: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      portion: i.portion || "",
      price: i.price
    }));

    // Check for existing unpaid order for this table/room
    let existingOrder = null;
    if (posForm.orderType === 'Dine-in' && posForm.tableNumber) {
      existingOrder = orders.find(o => o.tableNumber === posForm.tableNumber && o.paymentStatus === 'Unpaid' && o.orderStatus !== 'Cancelled');
    } else if (posForm.orderType === 'Room' && posForm.roomNumber) {
      existingOrder = orders.find(o => o.roomNumber === posForm.roomNumber && o.paymentStatus === 'Unpaid' && o.orderStatus !== 'Cancelled');
    }

    if (existingOrder) {
      // Merge items and recalculate
      const mergedItems = [...(existingOrder.items || []), ...newItems];
      const mergedSubtotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const mergedServiceCharge = (mergedSubtotal * 10) / 100;
      const mergedTotal = mergedSubtotal + mergedServiceCharge + (existingOrder.deliveryFee || 0) - (existingOrder.discount || discountValue);

      const payload = {
        items: mergedItems,
        subtotal: mergedSubtotal,
        serviceCharge: mergedServiceCharge,
        totalAmount: mergedTotal,
        paymentStatus: isPaid ? 'Paid' : 'Unpaid',
        paymentMethod: isPaid ? posForm.paymentMethod : 'Cash',
        amountReceived: isPaid ? mergedTotal : (existingOrder.amountReceived || 0)
      };

      const response = await apiFetch(`/orders/${existingOrder._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response?._id) throw new Error("Failed to update existing order");

      toast.success(`Order #${response._id.slice(-6).toUpperCase()} updated with new items!`);
      handlePrintReceipt(response);

    } else {
      // Create new order
      const payload = {
        orderType: posForm.orderType,
        items: newItems,
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
        paymentMethod: isPaid ? posForm.paymentMethod : 'Cash',
        amountReceived: receivedNum,
        balance: posForm.paymentMethod === 'Card' ? 0 : balance
      };

      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response?._id) throw new Error("Failed to create order");

      toast.success(`Order #${response._id.slice(-6).toUpperCase()} placed!`);
      handlePrintReceipt(response);
    }

    setCart([]);
    setAmountReceived('');
    setIsPaidToggle(false);
    setPosForm(prev => ({
      ...prev,
      discount: '0',
      paymentMethod: 'Cash'
    }));
    await loadOrders();
  } catch (e) {
    toast.error('Order Placement Failed', {
      description: e.message || "Something went wrong while connecting to the server.",
      duration: 5000,
    });
  }
  finally { setSavingPosOrder(false); }
};

// Generate thermal receipt layout and print
const handlePrintReceipt = (order) => {
  // Basic safety check
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
  if (!printWindow) return toast.error('Pop-up blocked!');

  const itemsHtml = combinedItems.map(it => `
      <tr>
        <td style="padding: 2px 0;">${it.name}${it.portion ? ` (${it.portion})` : ''}</td>
        <td style="text-align: center;">${it.quantity}</td>
        <td style="text-align: right;">${((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

  let qrHtml = '';
  if (order.orderType === 'Delivery' && order.coordinates) {
    const mapsUrl = `https://www.google.com/maps?q=${order.coordinates.lat},${order.coordinates.lng}`;
    qrHtml = `
        <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #000;">
          <div style="font-size: 8px; margin-bottom: 2px;">DELIVERY LOCATION</div>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(mapsUrl)}" style="width:100px; height:100px; margin: 0 auto;" />
          <div style="font-size: 7px; margin-top: 2px;">SCAN FOR GOOGLE MAPS</div>
        </div>
      `;
  }

  // Calculate daily sequence number
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
  const dailyNum = sameDayOrders.length - sameDayOrders.indexOf(order);
  const dailySeqStr = dailyNum.toString().padStart(3, '0');

  printWindow.document.write(`
      <html>
        <head>
          <title>${settings.hotelName} - Receipt #${order._id.slice(-8)}</title>
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
            <div class="logo">${settings.hotelLogo || ''}</div>
            <div class="hotel-name">${settings.hotelName.toUpperCase()}</div>
            <div class="hotel-details">
              ${settings.address}<br>
              Tel: ${settings.phone} | Web: ${settings.website}<br>
              VAT Reg No: 123456789-0000
            </div>
            <div class="receipt-title">Official Receipt</div>
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
          <div>Guest: ${order.customerName.toUpperCase()}</div>
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
            ${(function() {
              if (combinedDeliveryFee > 0) {
                let distanceLabel = "";
                if (combinedDeliveryFee === 150) distanceLabel = "1-3 km";
                else if (combinedDeliveryFee === 250) distanceLabel = "3-6 km";
                else if (combinedDeliveryFee === 350) distanceLabel = "6-9 km";
                else if (combinedDeliveryFee === 450) distanceLabel = "9-12 km";
                else if (combinedDeliveryFee === 550) distanceLabel = "12-15 km";
                else distanceLabel = "Distance-based";
                
                return `
                  <div class="divider"></div>
                  <div style="text-align: right;">
                    <div style="font-weight:bold;">Delivery Distance: ${distanceLabel}</div>
                    <div>Delivery Fee: Rs ${combinedDeliveryFee.toLocaleString()}</div>
                  </div>
                `;
              }
              return '';
            })()}
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

          ${qrHtml}

          <div class="footer">
            Thank you for choosing ${settings.hotelName}<br>Visit again for a premium experience
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

// Update order and payment status
const updateOrderStatus = async (orderId, orderStatus) => {
  await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ orderStatus }) });
  await loadOrders();
};

const updatePaymentStatus = async (orderId, splitPaymentDetails = null) => {
  try {
    const payload = splitPaymentDetails ? { splitPayment: splitPaymentDetails } : { paymentStatus: 'Paid' };
    await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify(payload) });
    
    setSettleModalOrder(null);
    setCustomAmount('');
    setItemSplitChecked({});
    setSettleTab('full');
    toast.success(`Payment processed successfully!`);
    await loadOrders();
  } catch (e) {
    toast.error("Failed to process payment");
  }
};

const popularityData = useMemo(() => {
  const counts = {};
  orders.forEach(order => {
    if (order.orderStatus === 'Cancelled') return;
    (order.items || []).forEach(item => {
      const name = item.name;
      counts[name] = (counts[name] || 0) + (item.quantity || 0);
    });
  });

  return Object.entries(counts)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
}, [orders]);

const categories = useMemo(() => {
  const predefinedOrder = [
    'Rice', 'Koththu', 'Noodles', 'Chicken', 'Fish', 'Prawns', 'Cuttle Fish', 
    'Mutton', 'Pork', 'Omelet', 'Vegetables & Sides', 'Salad', 'Soup', 
    'Starters', 'Outdoor Party', 'Beverages'
  ];
  
  const cats = new Set(menuItems.map(item => item.category).filter(Boolean));
  const sortedCats = Array.from(cats).sort((a, b) => {
    const indexA = predefinedOrder.indexOf(a);
    const indexB = predefinedOrder.indexOf(b);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA === -1 && indexB !== -1) return 1;
    if (indexA !== -1 && indexB === -1) return -1;
    return a.localeCompare(b);
  });
  
  return ['All', ...sortedCats];
}, [menuItems]);

const filteredMenuItems = useMemo(() => {
  return menuItems.filter(item => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchCategory && matchSearch;
  });
}, [menuItems, selectedCategory, menuSearch]);

useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, menuSearch]);

const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);

const paginatedMenuItems = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredMenuItems.slice(start, start + itemsPerPage);
}, [filteredMenuItems, currentPage, itemsPerPage]);

const handleAddVisualItem = (menuItem, portion = 'Full', quantity = 1) => {
  if (!menuItem.isAvailable) {
    toast.warning(`${menuItem.name} is currently unavailable!`);
    return;
  }
  const price = menuItem.hasPortions
    ? menuItem.portions.find(p => p.portionType === portion)?.price
    : menuItem.price;

  setCart((prev) => {
    const cartItemId = `${menuItem._id}-${menuItem.hasPortions ? portion : 'single'}`;
    const existing = prev.find((i) => i.cartItemId === cartItemId);
    if (existing) {
      return prev.map((i) => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i);
    }
    return [...prev, {
      cartItemId, menuItemId: menuItem._id, name: menuItem.name,
      portion: menuItem.hasPortions ? portion : '', price: price, quantity
    }];
  });
  toast.success(`Added ${menuItem.name} (${portion}) to cart!`);
};

const today = new Date().toLocaleDateString();
const todayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === today);
const activeOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + (o.totalAmount || 0), 0);

// Helper sub-render functions for clean tabs layout
const renderHeader = () => (
  <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-5 py-6 shadow-2xl overflow-hidden border border-slate-400">
    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D4AF37]/5 rounded-full blur-[60px] -mr-16 -mt-16" />

    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-2">
          <Zap className="w-3 h-3 animate-pulse" /> Luxury POS System
        </div>
        <h2 className="text-2xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
          Culinary <span className="text-[#D4AF37]">POS Hub</span>
        </h2>
      </div>

      <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
        {[
          { id: 'terminal', label: 'Cashier Terminal', icon: ShoppingCart },
          { id: 'kitchen', label: 'Kitchen Sync', icon: Clock },
          { id: 'analytics', label: 'Sales Trends', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === tab.id
              ? 'bg-[#D4AF37] text-[#0F172A] shadow-md shadow-[#D4AF37]/20'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const renderStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {[
      { label: 'Today Orders', value: todayOrders.length, icon: ShoppingCart, color: 'blue' },
      { label: 'Active Kitchen', value: activeOrdersCount, icon: Clock, color: 'amber' },
      { label: 'Today Net Revenue', value: formatCurrency(todayRevenue), icon: Gem, color: 'emerald' }
    ].map((stat, i) => (
      <div key={i} className="bg-slate-50 p-3 rounded-xl shadow-sm border border-slate-400 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-[#D4AF37] border border-slate-400">
          <stat.icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
          <h3 className="text-sm font-black text-slate-900 mt-1">{stat.value}</h3>
        </div>
      </div>
    ))}
  </div>
);

const renderTerminal = () => (
  <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 items-start relative w-full">
    {/* Left Column: Culinary Grid */}
    <div className="flex-1 space-y-4 min-w-0 w-full">
      {/* Search & Categories (Sticky) */}
      <div className="sticky top-0 z-20 bg-slate-50 p-4 rounded-2xl border border-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-[#D4AF37]/30 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all hover:border-[#D4AF37]/60"
          />
        </div>
        <div className="relative w-full sm:w-auto min-w-[200px] z-20">
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex items-center justify-between pl-11 pr-4 py-3 bg-slate-50 border border-[#D4AF37]/30 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/50 transition-all hover:border-[#D4AF37]/60 cursor-pointer"
          >
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
            <span className="truncate">{selectedCategory}</span>
            <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCategoryDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setIsCategoryDropdownOpen(false)}
              />
              
              {/* Options List */}
              <div className="absolute right-0 left-0 mt-2 bg-slate-50 border border-[#D4AF37]/30 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar divide-y divide-[#D4AF37]/10 animate-in fade-in slide-in-from-top-2 duration-150">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-[#D4AF37] text-[#0F172A]' 
                        : 'text-slate-900 hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Grid of Dishes */}
      {filteredMenuItems.length === 0 ? (
        <div className="bg-slate-50 py-20 text-center rounded-[2rem] border border-slate-400">
          <Utensils className="w-12 h-12 mx-auto text-slate-500 mb-3 animate-pulse" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Dishes Found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {paginatedMenuItems.map(item => (
              <PosMenuItem key={item._id} item={item} handleAddVisualItem={handleAddVisualItem} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-400 w-fit mx-auto animate-in fade-in duration-300">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  currentPage === 1 
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-transparent" 
                    : "bg-slate-100 text-slate-600 hover:bg-[#D4AF37] hover:text-[#0F172A] active:scale-95 border border-slate-400"
                }`}
              >
                Prev
              </button>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  currentPage === totalPages 
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed border border-transparent" 
                    : "bg-slate-100 text-slate-600 hover:bg-[#D4AF37] hover:text-[#0F172A] active:scale-95 border border-slate-400"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>

    {/* Right Column: Checkout Cart */}
    <div className="w-full lg:w-[400px] xl:w-[480px] shrink-0 bg-slate-50 p-4 rounded-2xl shadow-lg border border-slate-400 text-slate-900 flex flex-col sticky top-6 max-h-[calc(100vh-120px)] h-fit z-10">
      <div className="flex flex-col max-h-[calc(100vh-160px)] space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-400 pb-2 shrink-0">
          <h3 className="text-md font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>Order <span className="text-[#D4AF37]">Checkout</span></h3>
          <Receipt className="w-4 h-4 text-[#D4AF37]" />
        </div>

        {/* Checkout Form */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
            <select value={posForm.orderType} onChange={e => setPosForm({ ...posForm, orderType: e.target.value })} className="w-full bg-white/5 border border-slate-400 rounded-xl px-2 py-1.5 text-[11px] outline-none">
              {['Dine-in', 'Room', 'Delivery', 'Take-away'].map(t => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Guest Name</label>
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
              className={`w-full bg-white/5 border ${validationErrors.customerName ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
            />
            {validationErrors.customerName && <p className="text-[9px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.customerName}</p>}
          </div>

          {posForm.orderType === 'Dine-in' && (
            <>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Assign Table</label>
                <select
                  value={posForm.tableNumber}
                  onChange={e => { setPosForm({ ...posForm, tableNumber: e.target.value }); clearError('tableNumber'); }}
                  className={`w-full bg-white/5 border ${validationErrors.tableNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] text-slate-900 outline-none`}
                >
                  <option value="" className="bg-slate-100 text-slate-900">Select Table</option>
                  {[...Array(15)].map((_, i) => <option key={i} value={`T-${i + 1}`} className="bg-slate-100 text-slate-900">Table {i + 1}</option>)}
                </select>
                {validationErrors.tableNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.tableNumber}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Contact Phone</label>
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
                  className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
                />
                {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
              </div>
            </>
          )}

          {posForm.orderType === 'Room' && (
            <>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Assign Room</label>
                <select
                  value={posForm.roomNumber}
                  onChange={e => { setPosForm({ ...posForm, roomNumber: e.target.value }); clearError('roomNumber'); }}
                  className={`w-full bg-white/5 border ${validationErrors.roomNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] text-slate-900 outline-none`}
                >
                  <option value="" className="bg-slate-100 text-slate-900">Select Room</option>
                  {[...Array(10)].map((_, i) => <option key={i} value={`${i + 1}`} className="bg-slate-100 text-slate-900">Room {i + 1}</option>)}
                </select>
                {validationErrors.roomNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.roomNumber}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Contact Phone</label>
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
                  className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
                />
                {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
              </div>
            </>
          )}

          {posForm.orderType === 'Delivery' && (
            <>
              <div className="space-y-1 col-span-2">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Delivery Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street, Dompe"
                  value={posForm.deliveryAddress}
                  onChange={e => { setPosForm({ ...posForm, deliveryAddress: e.target.value }); clearError('deliveryAddress'); }}
                  onBlur={(e) => autoGeocode(e.target.value)}
                  className={`w-full bg-white/5 border ${validationErrors.deliveryAddress ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
                />
                {validationErrors.deliveryAddress && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.deliveryAddress}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Delivery Fee (Rs)</label>
                <select
                  value={posForm.deliveryFee}
                  onChange={e => setPosForm({ ...posForm, deliveryFee: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-slate-400 rounded-xl px-2 py-1.5 text-[11px] outline-none text-[#D4AF37] font-black"
                >
                  <option value="0" className="text-black">0 - 1 km (Free)</option>
                  <option value="150" className="text-black">1 - 3 km (Rs 150)</option>
                  <option value="250" className="text-black">3 - 6 km (Rs 250)</option>
                  <option value="350" className="text-black">6 - 9 km (Rs 350)</option>
                  <option value="450" className="text-black">9 - 12 km (Rs 450)</option>
                  <option value="550" className="text-black">12 - 15 km (Rs 550)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Contact Phone</label>
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
                  className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
                />
                {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
              </div>
            </>
          )}

          {posForm.orderType === 'Take-away' && (
            <div className="space-y-1 col-span-2">
              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Contact Number</label>
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
                className={`w-full bg-white/5 border ${validationErrors.contactNumber ? 'border-rose-500' : 'border-slate-400'} rounded-xl px-2 py-1.5 text-[11px] outline-none`}
              />
              {validationErrors.contactNumber && <p className="text-[10px] text-rose-500 font-black uppercase mt-1 ml-1">{validationErrors.contactNumber}</p>}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              Cart is empty. Click a dish to add.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-slate-400 text-[10px] shrink-0">
                <div><span className="font-bold">{item.name}</span> {item.portion && <span className="text-[#D4AF37] text-[8px] ml-1">({item.portion})</span>}</div>
                <div className="flex items-center gap-3">
                  <span>{item.quantity}x {formatCurrency(item.price)}</span>
                  <button onClick={() => setCart(c => c.filter(i => i.cartItemId !== item.cartItemId))} className="text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Settlement */}
        <div className="pt-3 border-t border-slate-400 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500">
            {serviceCharge > 0 && <div className="flex justify-between col-span-2"><span>Service Charge (10%)</span><span className="text-[#D4AF37] font-bold">+{formatCurrency(serviceCharge)}</span></div>}
            {deliveryFee > 0 && <div className="flex justify-between col-span-2"><span>Delivery Fee</span><span className="text-blue-400 font-bold">+{formatCurrency(deliveryFee)}</span></div>}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Bill</span>
            <span className="text-xl font-black text-[#D4AF37]">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1 col-span-2">
              <label className="text-[7px] text-slate-500 uppercase tracking-widest">Payment Method</label>
              <div className="flex gap-1 h-[26px]">
                <button type="button" onClick={() => { setPosForm({...posForm, paymentMethod: 'Cash'}); setAmountReceived(''); setIsPaidToggle(false); }} className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all ${posForm.paymentMethod === 'Cash' ? 'bg-[#D4AF37] text-slate-900' : 'bg-white/5 text-slate-500 border border-slate-400 hover:bg-white/10'}`}>Cash</button>
                <button type="button" onClick={() => { setPosForm({...posForm, paymentMethod: 'Card'}); setAmountReceived(grandTotal); setIsPaidToggle(true); }} className={`flex-1 rounded-md text-[9px] font-black uppercase transition-all ${posForm.paymentMethod === 'Card' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 border border-slate-400 hover:bg-white/10'}`}>Card</button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[7px] text-slate-500 uppercase tracking-widest">Discount</label>
              <input type="number" placeholder="0" value={posForm.discount === 0 || posForm.discount === "0" ? '' : posForm.discount} onChange={e => setPosForm({ ...posForm, discount: e.target.value })} className="w-full h-[26px] bg-white/5 border border-slate-400 rounded-lg px-2 text-[10px] outline-none text-slate-900 font-bold" />
            </div>
            <div className="flex flex-col justify-center items-center gap-1">
              <label className="text-[7px] text-slate-500 uppercase tracking-widest">Paid</label>
              <input type="checkbox" checked={isPaidToggle} onChange={e => setIsPaidToggle(e.target.checked)} className="w-4 h-4 accent-[#D4AF37] cursor-pointer mt-1" />
            </div>
          </div>
          
          {posForm.paymentMethod === 'Cash' ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-[7px] text-slate-500 uppercase tracking-widest">Received (Rs)</label>
                <input type="number" placeholder="0" value={amountReceived === 0 || amountReceived === "0" ? '' : amountReceived} onChange={e => setAmountReceived(e.target.value)} className="w-full bg-white/5 border border-slate-400 rounded-lg px-2 py-1.5 text-[10px] outline-none text-slate-900 font-bold" />
              </div>
              <div className="text-right flex flex-col justify-center">
                <label className="text-[7px] text-slate-500 uppercase tracking-widest">Balance</label>
                <p className="text-sm font-black text-emerald-400">{formatCurrency(balance)}</p>
              </div>
            </div>
          ) : (
            <div className="text-right flex flex-col justify-center mt-2 p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <label className="text-[7px] text-blue-400 uppercase tracking-widest">Charge Amount</label>
                <p className="text-sm font-black text-blue-500">{formatCurrency(grandTotal)}</p>
            </div>
          )}

          <button onClick={handlePlaceOrder} disabled={savingPosOrder} className="w-full bg-[#D4AF37] text-[#0F172A] py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg active:scale-95">
            {savingPosOrder ? 'Saving Order...' : 'Confirm & Print'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const renderKitchen = () => (
  <div className="bg-white rounded-[2rem] border border-slate-400 flex flex-col overflow-hidden shadow-sm p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-400 pb-4 mb-6 gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
        <h3 className="text-md font-bold text-slate-900 shrink-0" style={{ fontFamily: "DM Serif Display, serif" }}>Kitchen <span className="text-[#D4AF37]">Sync Monitor</span></h3>
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /><span className="text-amber-600">Pending</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /><span className="text-blue-600">Preparing</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><span className="text-emerald-600">Completed</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /><span className="text-rose-600">Cancelled</span></div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live {lastPollTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>

    {orders.length === 0 ? (
      <div className="py-24 text-center text-slate-500 uppercase tracking-widest font-bold text-xs opacity-80">No Incoming Orders</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, idx) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString();
          const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
          const dailySequenceNum = sameDayOrders.length - sameDayOrders.indexOf(order);

          const statusStyles =
            order.orderStatus === 'Completed' ? { border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/60', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500', borderLight: 'border-emerald-500/20' } :
              order.orderStatus === 'Preparing' ? { border: 'border-blue-500/20', hover: 'hover:border-blue-500/60', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500', borderLight: 'border-blue-500/20' } :
                order.orderStatus === 'Cancelled' ? { border: 'border-rose-500/20', hover: 'hover:border-rose-500/60', bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-500', borderLight: 'border-rose-500/20' } :
                  { border: 'border-amber-500/20', hover: 'hover:border-amber-500/60', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500', borderLight: 'border-amber-500/20' };

          return (
            <div key={order._id} className={`relative group p-5 rounded-[2rem] border bg-slate-100 hover:bg-slate-50 transition-all duration-500 shadow-md ${statusStyles.border} ${statusStyles.hover}`}>
              <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full ${statusStyles.dot} shadow-[0_0_15px_${statusStyles.dot}]`} />

              <div className="pl-3 space-y-4">
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${statusStyles.bg} ${statusStyles.text} px-3 py-1 rounded-full border ${statusStyles.borderLight} uppercase tracking-widest text-[8px]`}>
                      Order {dailySequenceNum.toString().padStart(3, '0')}
                    </span>
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">#{order._id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                    <p className="text-[9px] text-slate-600 font-black tracking-widest">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                    <span className={`text-[7px] font-black uppercase px-2.5 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {order.paymentStatus}
                    </span>
                    <p className="text-lg font-black text-[#D4AF37] mt-2 leading-none" style={{ fontFamily: 'DM Serif Display, serif' }}>
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-400">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50/20 px-3 py-1.5 rounded-xl border border-slate-400 text-[9px] font-black text-slate-600">
                      <span className="text-[#D4AF37] font-black text-[10px]">{it.quantity}x</span>
                      <span className="uppercase tracking-wider">{it.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-400">
                  <select value={order.orderStatus} onChange={e => updateOrderStatus(order._id, e.target.value)} className="flex-1 bg-slate-50/40 border border-slate-400 text-slate-600 rounded-lg px-2 py-1 text-[9px] font-black uppercase outline-none cursor-pointer">
                    {['Pending', 'Preparing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s} className="bg-slate-100 text-slate-900">{s}</option>)}
                  </select>
                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="px-2.5 py-1.5 bg-slate-50/40 text-slate-500 hover:text-[#D4AF37] rounded-lg border border-slate-400 flex items-center gap-1.5 transition-all"
                    title="Print Bill"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bill</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const renderAnalyticsTab = () => (
  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-400 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-md font-bold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>
          Dish <span className="text-[#D4AF37]">Popularity Trends</span>
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Top Selling Items in Restaurant & POS</p>
      </div>
      <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
    </div>

    {popularityData.length === 0 ? (
      <div className="py-12 text-center opacity-30">
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-500" />
        <p className="text-xs font-bold uppercase tracking-wider">No Sales Data Available</p>
      </div>
    ) : (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={popularityData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }}
              cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
            />
            <Bar dataKey="sales" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const renderGroupSettleModal = () => {
  if (!settleModalOrder) return null;
  const total = settleModalOrder.totalAmount || 0;

  const handlePay = () => {
    const cashValue = Number(customAmount) || 0;
    if (paymentMethod === 'Cash' && cashValue < total) return toast.error("Cash received must be greater than or equal to total amount.");
    
    updatePaymentStatus(settleModalOrder._id, {
      amount: total,
      method: paymentMethod,
      note: 'Normal Settlement'
    });
  };

  const cashValue = Number(customAmount) || 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm" onClick={() => setSettleModalOrder(null)} />
      <div className="relative w-full max-w-lg bg-slate-50 rounded-[2rem] border border-slate-400 shadow-2xl overflow-hidden flex flex-col">
        
        <div className="bg-slate-50/40 px-8 py-6 flex items-center justify-between border-b border-slate-400">
          <div>
            <h2 className="text-xl text-slate-900 font-normal" style={{ fontFamily: 'DM Serif Display, serif' }}>Order <span className="text-[#D4AF37]">Settlement</span></h2>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
              #{settleModalOrder._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <button onClick={() => setSettleModalOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-900 hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-400 pb-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount Due</p>
              <h3 className="text-4xl font-black text-slate-900" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatCurrency(total)}</h3>
            </div>
            <div className="text-right">
                <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em]">{settleModalOrder.orderType}</p>
                <p className="text-xs font-black text-slate-900">{settleModalOrder.tableNumber ? `Table ${settleModalOrder.tableNumber}` : settleModalOrder.roomNumber ? `Room ${settleModalOrder.roomNumber}` : settleModalOrder.customerName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cash Received (Rs)</label>
              <div className="relative">
                <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                <input 
                  autoFocus
                  type="number"
                  min="0"
                  value={customAmount} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                      setCustomAmount(val);
                    }
                  }}
                  placeholder="Enter amount..."
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-400 rounded-2xl focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 text-xl font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex justify-between items-center">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Balance to Return</span>
              <span className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'DM Serif Display, serif' }}>
                {formatCurrency(Math.max(cashValue - total, 0))}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-400 space-y-4">
            <div className="flex gap-2">
              {['Cash', 'Card'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${paymentMethod === method ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent text-slate-500 border-slate-400 hover:border-white/30'}`}
                >
                  {method}
                </button>
              ))}
            </div>
            <button 
              disabled={paymentMethod === 'Cash' && cashValue < total}
              onClick={handlePay}
              className="w-full py-5 rounded-2xl bg-[#D4AF37] text-[#0F172A] font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-[#0F172A] active:scale-95 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Settlement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Interface Render
return (
  <div className="space-y-6 animate-in fade-in duration-500">
    {renderHeader()}
    {renderStats()}
    {activeTab === 'terminal' && renderTerminal()}
    {activeTab === 'kitchen' && renderKitchen()}
    {activeTab === 'analytics' && renderAnalyticsTab()}
    {renderGroupSettleModal()}
  </div>
);
}
