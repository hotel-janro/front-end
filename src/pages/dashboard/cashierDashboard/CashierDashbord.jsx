import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { AdminPOS } from "../adminDashboard/AdminPos.jsx";
import { apiFetch } from "../../../api.js";
import { 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Search, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  History
} from "lucide-react";
import { useSettings } from "../../../context/SettingsContext.jsx";
import "./CashierDashbord.css";


function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function RealTimeClock({ className = "" }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-lg shadow-black/5 ${className}`}>
      <div className="p-1.5 bg-white/20 rounded-lg">
        <Clock className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-center gap-2 text-white">
        <span className="font-medium tracking-wide text-xs sm:text-sm">{formatDate(currentTime)}</span>
        <span className="text-white/40 text-xs sm:text-sm">|</span>
        <span className="font-bold tracking-wider text-xs sm:text-sm">{formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

// --- Orders Tab --- //
function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      /* Silent error handling for data fetch */
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Order <span className="text-blue-400">Management</span>
            </h2>
            <p className="text-slate-400 mt-2">Monitor all active and past kitchen sync orders</p>
          </div>
          <div className="flex flex-col sm:flex-row md:items-center gap-4 self-start md:self-auto">
            <RealTimeClock />
            <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/10 shrink-0 w-full sm:w-auto">
              <p className="text-xs text-blue-300 font-bold uppercase tracking-widest">Active Tickets</p>
              <p className="text-3xl font-black">{activeOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Order History</h3>
        </div>
        <div className="p-10 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto" /></div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-8 pb-2">Order Info</th>
                  <th className="px-8 pb-2 text-center">Status</th>
                  <th className="px-8 pb-2 text-center">Items</th>
                  <th className="px-8 pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="bg-slate-50 hover:bg-slate-100/50 transition-colors">
                    <td className="px-8 py-6 rounded-l-[2rem]">
                      <p className="font-bold text-slate-900">{order.customerName || 'Guest'} - {order.orderType}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.orderStatus === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-700">
                      {order.items.length} Items
                    </td>
                    <td className="px-8 py-6 rounded-r-[2rem] text-right font-black text-slate-900 text-lg">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Payment tracking
function CashierPayments() {
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
    } catch (e) {
      /* Error handled */
    } finally {
      setLoading(false);
    }
  };

  const paidTotal = orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Payment <span className="text-emerald-400">Gateway</span>
            </h2>
            <p className="text-slate-400 mt-2">Track financial transactions and pending settlements</p>
          </div>
          <div className="flex flex-col sm:flex-row md:items-center gap-4 self-start md:self-auto">
            <RealTimeClock />
            <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/10 shrink-0 w-full sm:w-auto">
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest">Total Collected</p>
              <p className="text-3xl font-black text-emerald-400">{formatCurrency(paidTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Transaction Ledger</h3>
        </div>
        <div className="p-10 overflow-x-auto">
          {loading ? (
             <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto" /></div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-8 pb-2">Transaction ID</th>
                  <th className="px-8 pb-2 text-center">Status</th>
                  <th className="px-8 pb-2 text-center">Payment Method</th>
                  <th className="px-8 pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="bg-slate-50 hover:bg-slate-100/50 transition-colors">
                    <td className="px-8 py-6 rounded-l-[2rem]">
                      <p className="font-bold text-slate-900">#{order._id.slice(-8)}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-700">
                      {order.paymentMethod || 'Cash'}
                    </td>
                    <td className="px-8 py-6 rounded-r-[2rem] text-right">
                      <p className="font-black text-slate-900 text-lg">{formatCurrency(order.totalAmount)}</p>
                      {order.paymentStatus === 'Paid' && (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Paid in Full</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Revenue printing
function CashierReceipts() {
  const { settings } = useSettings();
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
      setOrders(Array.isArray(data) ? data.filter(o => o.paymentStatus === 'Paid') : []);
    } catch (e) {
      /* Error handled */
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (order) => {
    let relatedOrders = [order];
    if (order.tableNumber || order.roomNumber) {
      if (order.paymentStatus === 'Unpaid') {
        const existingUnpaid = (orders || []).filter(o =>
          o.paymentStatus === 'Unpaid' &&
          ((order.tableNumber && o.tableNumber === order.tableNumber) ||
            (order.roomNumber && o.roomNumber === order.roomNumber)) &&
          o._id !== order._id
        );
        relatedOrders = [...existingUnpaid, order];
      } else if (order.paymentStatus === 'Paid') {
        const orderTime = new Date(order.updatedAt || order.createdAt).getTime();
        const existingPaid = (orders || []).filter(o =>
          o.paymentStatus === 'Paid' &&
          ((order.tableNumber && o.tableNumber === order.tableNumber) ||
            (order.roomNumber && o.roomNumber === order.roomNumber)) &&
          Math.abs(new Date(o.updatedAt || o.createdAt).getTime() - orderTime) < 10000 &&
          o._id !== order._id
        );
        relatedOrders = [...existingPaid, order];
      }
    }

    const combinedItems = relatedOrders.flatMap(o => o.items || []);
    const combinedSubtotal = relatedOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const combinedServiceCharge = relatedOrders.reduce((s, o) => s + (o.serviceCharge || 0), 0);
    const combinedDeliveryFee = relatedOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0);
    const combinedDiscount = relatedOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const combinedTotalAmount = relatedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalQty = combinedItems.reduce((s, it) => s + (it?.quantity || 0), 0);

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

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

    const orderDate = new Date(order.createdAt).toLocaleDateString();
    const sameDayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === orderDate);
    const dailyNum = sameDayOrders.length - sameDayOrders.indexOf(order);
    const dailySeqStr = dailyNum.toString().padStart(3, '0');

    printWindow.document.write(`
      <html>
        <head>
          <title>${settings.hotelName} - Receipt #${order._id.slice(-8)}</title>
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
            ${combinedDeliveryFee > 0 ? `<div>Delivery Fee: Rs ${combinedDeliveryFee.toLocaleString()}</div>` : ''}
            ${combinedDiscount > 0 ? `<div>Discount: -Rs ${combinedDiscount.toLocaleString()}</div>` : ''}
            <div class="divider"></div>
            <div class="total-row">GROUP TOTAL: Rs ${(combinedTotalAmount || 0).toLocaleString()}</div>
            <div class="divider"></div>
            ${(order?.amountReceived || 0) > 0 ? `
              <div>Cash Paid: Rs ${(order?.amountReceived || 0).toLocaleString()}</div>
              <div style="font-weight:bold; font-size: 13px;">Balance: Rs ${(order?.balance || 0).toLocaleString()}</div>
            ` : `
              <div style="font-style: italic; font-size: 8px; color: #666;">Payment Pending / Group Settle</div>
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Digital <span className="text-[#D4AF37]">Receipts</span>
            </h2>
            <p className="text-slate-400 mt-2">Access and print official bills for completed payments</p>
          </div>
          <RealTimeClock className="self-start md:self-auto" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No settled bills found.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all group">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl flex items-center justify-center">
                   <Receipt className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{order._id.slice(-8)}</span>
               </div>
               <h3 className="text-xl font-bold text-slate-900">{formatCurrency(order.totalAmount)}</h3>
               <p className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
               
               <div className="mt-6 pt-6 border-t border-slate-100">
                 <button 
                   onClick={() => handlePrintReceipt(order)}
                   className="w-full py-3 bg-slate-50 hover:bg-[#0F172A] hover:text-white text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                 >
                   Print Bill
                 </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- Main Router Component ---------------- //
export function CashierDashboard() {
  const location = useLocation();

  if (location.pathname === "/cashier/orders") {
    return <CashierOrders />;
  }
  
  if (location.pathname === "/cashier/payments") {
    return <CashierPayments />;
  }

  if (location.pathname === "/cashier/receipts") {
    return <CashierReceipts />;
  }

  // Default to POS Dashboard
  return <AdminPOS />;
}
