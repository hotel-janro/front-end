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

// ---------------- Orders Tab ---------------- //
function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
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

// ---------------- Payments Tab ---------------- //
function CashierPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
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

// ---------------- Receipts Tab ---------------- //
function CashierReceipts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      // Only show paid orders for receipts
      setOrders(Array.isArray(data) ? data.filter(o => o.paymentStatus === 'Paid') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
