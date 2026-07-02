// MyOrders.jsx - Premium Customer Orders & Billing Dashboard
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  History,
  ArrowUpRight,
  Wallet,
  Receipt,
  CreditCard,
  UtensilsCrossed,
  Edit,
  Minus,
  Plus,
  Save,
  X,
  CalendarDays,
  Download,
  Banknote
} from "lucide-react";
import { apiFetch } from "../../../api.js";
import { useSettings } from "../../../context/SettingsContext.jsx";
<<<<<<< HEAD
import { useSocket } from "../../../context/SocketContext.jsx";
import { toast } from "sonner";
=======
import { generateInvoicePDF } from "../../../utils/invoiceGenerator.js";
>>>>>>> edb44e2740fcb3c9675d4c44778a683fa754eeb4
import "./CustomerDashboard.css";

export function MyOrders() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState("orders"); // orders, payments, receipts
  const [editingOrder, setEditingOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [ordersDateFilter, setOrdersDateFilter] = useState("All");
  const [receiptsDateFilter, setReceiptsDateFilter] = useState("All");
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    loadMenu();
    return () => clearInterval(timer);
  }, []);

  const loadMenu = async () => {
    try {
      const data = await apiFetch('/menu?isAvailable=true');
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load menu for editing:", e);
    }
  };

  useEffect(() => {
    loadMyOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("orderCreated", (newOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) => {
        const match = prev.find((o) => o._id === updatedOrder._id);
        if (match) {
          if (match.orderStatus !== updatedOrder.orderStatus) {
            let desc = "";
            if (updatedOrder.orderStatus === "Preparing") {
              desc = "Our chef has started preparing your gourmet selection! 👨‍🍳";
            } else if (updatedOrder.orderStatus === "Ready" || updatedOrder.orderStatus === "Ready for Delivery") {
              desc = "Your selection is prepared and ready! 🍽️";
            } else if (updatedOrder.orderStatus === "Completed") {
              desc = "Your order has been completed. Enjoy your dining! ✨";
            } else if (updatedOrder.orderStatus === "Cancelled") {
              desc = "Your order was cancelled.";
            }

            if (desc) {
              toast.success(`Order Status Updated!`, {
                description: desc,
                duration: 7000,
              });
            }
          }
          return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
        }
        return prev;
      });
    });

    socket.on("orderDeleted", ({ id }) => {
      setOrders((prev) => prev.filter((o) => o._id !== id));
    });

    return () => {
      socket.off("orderCreated");
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, [socket]);

  const handlePayNow = async (order) => {
    try {
      setPayingOrderId(order._id);
      
      const hashRes = await apiFetch("/api/payments/payhere-hash", {
        method: "POST",
        body: JSON.stringify({
          orderId: order._id,
          amount: order.totalAmount
        })
      });

      if (!hashRes || !hashRes.success) {
        throw new Error(hashRes?.message || "Failed to generate payment signature hash");
      }

      const { merchantId, currency, hash, amount } = hashRes.data;
      const user = JSON.parse(localStorage.getItem("janro_user") || "{}");

      const payment = {
        sandbox: true,
        merchant_id: merchantId,
        return_url: `${window.location.origin}/my-orders`,
        cancel_url: `${window.location.origin}/my-orders`,
        notify_url: "https://sandbox.payhere.lk/pay/checkout",
        order_id: order._id,
        items: `Hotel Food Order #${order.orderNumber || order._id.slice(-6)}`,
        amount: amount,
        currency: currency,
        first_name: user?.name?.split(" ")[0] || "Valued",
        last_name: user?.name?.split(" ")[1] || "Guest",
        email: user?.email || "guest@hoteljanro.com",
        phone: user?.phone || "0771234567",
        address: user?.address || "123 Luxury Avenue",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hash,
        custom_1: "order"
      };

      window.payhere.onCompleted = async function onCompleted(orderId) {
        try {
          await apiFetch(`/api/orders/${order._id}`, {
            method: "PUT",
            body: JSON.stringify({ paymentStatus: "Paid", orderStatus: "Completed" })
          });
          toast.success("Payment completed successfully!");
          loadMyOrders();
        } catch (err) {
          console.error("Local status update failed:", err);
          toast.error("Failed to update payment status locally.");
        } finally {
          setPayingOrderId(null);
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        setPayingOrderId(null);
        toast.error("Payment dismissed");
      };

      window.payhere.onError = function onError(error) {
        setPayingOrderId(null);
        toast.error(`Payment failed: ${error}`);
      };

      window.payhere.startPayment(payment);

    } catch (err) {
      setPayingOrderId(null);
      toast.error(err.message || "An error occurred during payment");
    }
  };

  const loadMyOrders = async () => {
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatMoney(value) {
    return `${settings.currency.symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRemainingTime(createdAt) {
    const diff = 5 * 60 * 1000 - (now.getTime() - new Date(createdAt).getTime());
    if (diff <= 0) return null;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
      loadMyOrders();
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  }

  function updateItemQuantity(idx, delta) {
    const newItems = [...editingOrder.items];
    newItems[idx].quantity = Math.max(1, newItems[idx].quantity + delta);
    setEditingOrder({ ...editingOrder, items: newItems });
  }

  function removeItem(idx) {
    if (editingOrder.items.length <= 1) {
      alert("Order must have at least one item. Cancel the order instead if needed.");
      return;
    }
    const newItems = editingOrder.items.filter((_, i) => i !== idx);
    setEditingOrder({ ...editingOrder, items: newItems });
  }

  function addNewItem(menuItem, portion = "") {
    // Check if already in order
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
    setSearchTerm("");
    setShowMenuDropdown(false);
  }

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !editingOrder?.items.some(oi => oi.menuItemId === item._id && !item.hasPortions)
  );

  function applyDateFilter(list, dateKey, filter) {
    if (filter === "All") return list;
    const now = new Date();
    return list.filter(o => {
      const d = new Date(o[dateKey]);
      if (filter === "Today") return d.toDateString() === now.toDateString();
      if (filter === "Week") return Math.ceil(Math.abs(now - d) / (1000 * 60 * 60 * 24)) <= 7;
      if (filter === "Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (filter === "Year") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }

  const completedOrders = orders.filter(o => o.orderStatus === "Completed");
  const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Preparing");
  const paidOrders = orders.filter(o => o.paymentStatus === "Paid");
  const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);

  const filteredOrders = applyDateFilter(orders, "createdAt", ordersDateFilter);
  const filteredPaidOrders = applyDateFilter(paidOrders, "createdAt", receiptsDateFilter);

  const stats = [
    {
      label: "Total Investment",
      value: formatMoney(totalSpent),
      note: "Total Spent",
      Icon: Banknote,
      card: "bg-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700",
    },
    {
      label: "My Selection",
      value: String(orders.length),
      note: `${pendingOrders.length} active`,
      Icon: ShoppingBag,
      card: "bg-blue-50 border-blue-200",
      icon: "bg-blue-100 text-blue-600",
      text: "text-blue-700",
    },
    {
      label: "Receipts Generated",
      value: String(paidOrders.length),
      note: "Fully Paid",
      Icon: Receipt,
      card: "bg-violet-50 border-violet-200",
      icon: "bg-violet-100 text-violet-600",
      text: "text-violet-700",
    },
    {
      label: "Active Orders",
      value: String(pendingOrders.length),
      note: "Preparing now",
      Icon: Clock,
      card: "bg-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-700",
    },
  ];

  function getStatusPill(status) {
    if (status === "Completed") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === "Pending") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (status === "Preparing") return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#D4AF37]/30 pb-20">
      {/* Compact Luxury Header */}
      <div className="relative bg-[#0F172A] overflow-hidden border-b border-white/5 py-8 px-4">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury Dining" />
        </div>
        <div className="absolute inset-0 bg-[#0F172A]/85" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-full blur-[80px] -mr-20" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-700">
          <div>
            <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-[9px] font-black mb-2 opacity-80 flex items-center gap-3">
              <span className="w-6 h-px bg-[#D4AF37]/30" />
              Elite Guest Dashboard
            </p>
            <h1 className="text-2xl md:text-3xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Your <span className="italic text-[#D4AF37]">Culinary</span> History
            </h1>
            <p className="text-slate-400 text-xs font-light mt-1 tracking-wide">
              Track orders, payments and receipts.
            </p>
          </div>
          {/* Stats row inside header */}
          <div className="flex gap-4 flex-wrap justify-center sm:justify-end">
            {stats.map(s => {
              const Icon = s.Icon;
              return (
                <div key={s.label} className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-sm font-black text-white" style={{ fontFamily: 'DM Serif Display, serif' }}>{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">

        {/* Tab Navigation */}
        <div className="flex justify-center my-6 overflow-x-auto no-scrollbar">
          <div className="inline-flex bg-white/90 backdrop-blur-xl p-1.5 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white">
            {[
              { id: "orders", label: "My Orders", icon: Package },
              { id: "payments", label: "Payments", icon: CreditCard },
              { id: "receipts", label: "Receipts", icon: Receipt }
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap cursor-pointer ${active
                      ? "bg-[#0F172A] text-[#D4AF37] shadow-xl scale-105"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area based on Tabs */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <article className="xl:col-span-2 space-y-8">
            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <header className="px-10 py-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-[#D4AF37] flex items-center justify-center shadow-inner">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Recent Orders</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Your Culinary Journey</p>
                    </div>
                  </div>
                  {/* Date Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {["All", "Today", "Week", "Month", "Year"].map(f => (
                      <button
                        key={f}
                        onClick={() => setOrdersDateFilter(f)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${
                          ordersDateFilter === f
                            ? "bg-[#D4AF37] text-[#0F172A] border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {f === "All" && <CalendarDays className="w-3 h-3" />}
                        {f}
                      </button>
                    ))}
                  </div>
                </header>

                <div className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                      <UtensilsCrossed className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-light italic text-lg">
                        {ordersDateFilter === "All" ? "No orders found in your history" : `No orders found for this ${ordersDateFilter.toLowerCase()}`}
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;
                      return (
                      <div key={order._id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                        {/* Compact row */}
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-sm font-black text-slate-900 tracking-wider">REF: #{order.orderNumber || order._id.slice(-8)}</p>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusPill(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-[#0f172a]">
                                <UtensilsCrossed className="w-3.5 h-3.5" /> {order.orderType}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatMoney(order.totalAmount)}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                className={`flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-[#D4AF37] border border-transparent rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg active:scale-95 cursor-pointer`}
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {order.orderStatus === "Pending" && getRemainingTime(order.createdAt) && (
                                <button 
                                  onClick={() => setEditingOrder(JSON.parse(JSON.stringify(order)))}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0F172A] border-2 border-[#0F172A] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit ({getRemainingTime(order.createdAt)})
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/60">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Order Items</p>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm border-b border-slate-100/40 last:border-0 pb-2 last:pb-0">
                                    <span className="font-bold text-slate-700 flex items-center gap-2 flex-wrap">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                      {item.name} 
                                      {item.portion && (
                                        <span className="text-[8px] font-black uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-0.5 rounded border border-[#D4AF37]/10">
                                          {item.portion}
                                        </span>
                                      )}
                                      <span className="text-slate-400 font-medium ml-1">x{item.quantity}</span>
                                    </span>
                                    <span className="text-slate-600 font-black">{formatMoney(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Order Totals */}
                              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
                                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  <span>Subtotal</span>
                                  <span>{formatMoney(order.subtotal || order.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                                </div>
                                {order.serviceCharge > 0 && (
                                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Service Charge</span>
                                    <span>{formatMoney(order.serviceCharge)}</span>
                                  </div>
                                )}
                                {order.deliveryFee > 0 && (
                                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Delivery Fee</span>
                                    <span>{formatMoney(order.deliveryFee)}</span>
                                  </div>
                                )}
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                                    <span>Discount</span>
                                    <span>-{formatMoney(order.discount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-sm font-black text-[#0F172A] pt-2 border-t border-slate-200">
                                  <span>Total</span>
                                  <span>{formatMoney(order.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );})
                  )}
                </div>
              </div>
            )}

            {activeTab === "payments" && (() => {
              const unpaidOrders = orders.filter(o => o.paymentStatus !== "Paid");
              return (
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                  <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Pending Payments</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Unsettled Transactions</p>
                      </div>
                    </div>
                  </header>

                  <div className="divide-y divide-slate-100">
                    {unpaidOrders.length === 0 ? (
                      <div className="p-20 text-center flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                        <p className="text-slate-500 font-normal text-lg mb-2">No Pending Payments</p>
                        <p className="text-slate-400 text-sm max-w-sm">All your orders have been settled in full. Thank you for choosing Hotel Janro!</p>
                      </div>
                    ) : (
                      unpaidOrders.map((order) => (
                        <div key={order._id} className="p-8 hover:bg-slate-50 transition-colors group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap mb-3">
                                <p className="text-sm font-black text-slate-900 tracking-wider">REF: #{order.orderNumber || order._id.slice(-8)}</p>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-rose-50 text-rose-600 border-rose-200`}>
                                  Unpaid
                                </span>
                              </div>

                              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mt-4 group-hover:bg-white transition-colors">
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="font-semibold text-slate-700">
                                        {item.name} <span className="text-slate-400 font-medium">x{item.quantity}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                  <Clock className="w-3 h-3" /> {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col items-start md:items-end justify-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                              <p className="text-3xl font-black text-[#0F172A]">{formatMoney(order.totalAmount)}</p>
                              <button
                                onClick={() => handlePayNow(order)}
                                disabled={payingOrderId === order._id}
                                className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-[#D4AF37] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg hover:shadow-[#D4AF37]/20 disabled:opacity-50"
                              >
                                {payingOrderId === order._id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Pay Now
                                    <ChevronRight className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}

            {/* RECEIPTS TAB */}
            {activeTab === "receipts" && (
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <header className="px-10 py-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 text-[#D4AF37] flex items-center justify-center shadow-inner">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your Receipts</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Proof of Purchase</p>
                    </div>
                  </div>
                  {/* Date Filter */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {["All", "Today", "Week", "Month", "Year"].map(f => (
                      <button
                        key={f}
                        onClick={() => setReceiptsDateFilter(f)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${
                          receiptsDateFilter === f
                            ? "bg-[#D4AF37] text-[#0F172A] border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {f === "All" && <CalendarDays className="w-3 h-3" />}
                        {f}
                      </button>
                    ))}
                  </div>
                </header>

                <div className="divide-y divide-slate-100">
                  {filteredPaidOrders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                      <Receipt className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-light italic text-lg">
                        {receiptsDateFilter === "All" ? "No paid receipts available yet." : `No receipts found for this ${receiptsDateFilter.toLowerCase()}`}
                      </p>
                    </div>
                  ) : (
                    filteredPaidOrders.map((order) => (
                      <div key={`receipt-${order._id}`} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-150 text-[#D4AF37] shrink-0 shadow-sm">
                            <Receipt className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-wider">RECEIPT #{order.orderNumber || order._id.slice(-8)}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                              Paid in Full
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
<<<<<<< HEAD
                          <p className="text-2xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>{formatMoney(order.totalAmount)}</p>
                          <button
                            onClick={() => {
                              const w = window.open('', '_blank');
                              if (!w) return alert('Pop-up blocked! Please allow pop-ups.');
                              const itemsHtml = order.items.map(it => `
                                <tr>
                                  <td style="padding:6px 0;border-bottom:1px solid #eee;">
                                    <div style="font-weight:bold;text-transform:uppercase;">${it.name}</div>
                                    ${it.portion ? `<div style="font-size:8px;color:#D4AF37;text-transform:uppercase;">(${it.portion})</div>` : ''}
                                  </td>
                                  <td style="text-align:center;border-bottom:1px solid #eee;">x${it.quantity}</td>
                                  <td style="text-align:right;font-weight:bold;border-bottom:1px solid #eee;">${formatMoney(it.price * it.quantity)}</td>
                                </tr>
                              `).join('');
                              w.document.write(`<html><head><style>
                                @media print{@page{margin:0}body{margin:0.2cm}}
                                body{font-family:'Courier New',monospace;font-size:11px;line-height:1.2;color:#000;max-width:300px;margin:0 auto}
                                .header{text-align:center;margin-bottom:15px}
                                .divider{border-top:1px dashed #000;margin:8px 0}
                                table{width:100%;border-collapse:collapse}
                                .total-row{font-weight:bold;font-size:14px}
                                .footer{text-align:center;margin-top:20px;font-size:9px}
                              </style></head><body>
                                <div class="header">
                                  <h1 style="margin:0;font-size:22px;letter-spacing:2px">${settings.hotelName || 'HOTEL JANRO'}</h1>
                                  <p style="margin:2px 0;font-size:9px;font-weight:bold;text-transform:uppercase">${settings.address || ''}</p>
                                  <p style="margin:1px 0">Tel: ${settings.phone || ''}</p>
                                </div>
                                <div class="divider"></div>
                                <div style="display:flex;justify-content:space-between;font-weight:bold">
                                  <span>REF: #${order.orderNumber || order._id.slice(-8)}</span>
                                  <span>${new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style="margin-top:4px;display:flex;justify-content:space-between">
                                  <span>TIME: ${new Date(order.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                  <span style="border:1.5px solid #000;padding:2px 6px;font-weight:bold;text-transform:uppercase">${order.orderType}</span>
                                </div>
                                <div style="margin-top:5px;font-weight:bold;text-transform:uppercase">GUEST: ${order.customerName || 'Guest'}</div>
                                <div class="divider"></div>
                                <table><thead><tr style="border-bottom:1.5px solid #000"><th style="text-align:left;padding:5px 0">ITEM</th><th style="width:40px;text-align:center">QTY</th><th style="text-align:right;width:80px">AMT</th></tr></thead><tbody>${itemsHtml}</tbody></table>
                                <div class="divider" style="margin-top:15px"></div>
                                <div style="text-align:right">
                                  <div style="margin-bottom:2px">SUBTOTAL: ${formatMoney(order.subtotal || order.items.reduce((s,i)=>s+i.price*i.quantity,0))}</div>
                                  ${order.serviceCharge>0?`<div style="margin-bottom:2px">SERVICE (10%): ${formatMoney(order.serviceCharge)}</div>`:''}
                                  ${order.deliveryFee>0?`<div style="margin-bottom:2px">DELIVERY: ${formatMoney(order.deliveryFee)}</div>`:''}
                                  ${order.discount>0?`<div style="margin-bottom:2px">DISCOUNT: -${formatMoney(order.discount)}</div>`:''}
                                  <div class="divider"></div>
                                  <div class="total-row" style="margin-top:5px">TOTAL: ${formatMoney(order.totalAmount)}</div>
                                </div>
                                <div class="footer">
                                  <p style="margin:8px 0;font-weight:bold;letter-spacing:1px">*** THANK YOU! ***</p>
                                  <p style="margin:0;font-size:8px;color:#444">BOUTIQUE EXPERIENCE BY JANRO</p>
                                </div>
                                <script>setTimeout(function(){window.print();window.onafterprint=function(){window.close()};setTimeout(function(){window.close()},2000)},500)<\/script>
                              </body></html>`);
                              w.document.close();
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/5 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-sm hover:shadow-lg cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Receipt
=======
                          <p className="text-2xl font-black text-[#0F172A]">{formatMoney(order.totalAmount)}</p>
                          <button 
                            onClick={() => generateInvoicePDF(order, settings)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all"
                          >
                            Download PDF
>>>>>>> edb44e2740fcb3c9675d4c44778a683fa754eeb4
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </article>

          {/* Right Sidebar Widget */}
          <div className="space-y-8">
            <article className="rounded-[2.5rem] bg-[#0F172A] p-10 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#D4AF37]/40 transition-all duration-700" />
              <h4 className="text-2xl font-normal text-[#D4AF37] mb-3" style={{ fontFamily: "DM Serif Display, serif" }}>Premium Rewards</h4>
              <p className="text-sm text-slate-300 font-light leading-relaxed mb-8 opacity-90">
                Earn points on every exquisite dish. Unlock exclusive dining experiences and complimentary upgrades.
              </p>
              <div className="flex items-end justify-between border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Available Points</p>
                  <p className="text-3xl font-bold text-white">1,250 <span className="text-sm text-[#D4AF37] font-medium tracking-normal">pts</span></p>
                </div>
                <button className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all cursor-pointer backdrop-blur-sm border border-white/10 group-hover:border-[#D4AF37]/50">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </article>

            <article className="rounded-[2.5rem] bg-white border border-slate-100 p-10 text-center shadow-xl shadow-slate-200/40">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-xl text-slate-900 font-normal mb-3" style={{ fontFamily: "DM Serif Display, serif" }}>Need Assistance?</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-6">
                Our dedicated guest services team is available 24/7 to ensure your experience is flawless.
              </p>
              <button className="text-[#0F172A] font-black uppercase tracking-[0.2em] text-[10px] hover:text-[#D4AF37] transition-colors border-b-2 border-transparent hover:border-[#D4AF37] pb-1">
                Contact Concierge
              </button>
            </article>
          </div>

        </section>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setEditingOrder(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
            <header className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-[#0F172A] text-white">
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
                    placeholder="Search menu for new items..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowMenuDropdown(true);
                    }}
                    onFocus={() => setShowMenuDropdown(true)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15 transition-all text-slate-900 shadow-sm"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showMenuDropdown && searchTerm.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto overflow-x-hidden">
                    {filteredMenu.length > 0 ? filteredMenu.map(item => (
                      <div key={item._id} className="p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
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
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-150 rounded-2xl shadow-sm">
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{item.name}</h4>
                      <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">
                        {item.portion || "Standard"} • {formatMoney(item.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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

            <footer className="p-8 border-t border-slate-150 bg-slate-50/70 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3 border-b border-slate-200 pb-3">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</div>
                  <div className="text-right text-xs font-black text-slate-700">
                    {formatMoney(editingOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0))}
                  </div>
                  
                  {editingOrder.serviceCharge > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Charge (10%)</div>
                      <div className="text-right text-xs font-black text-slate-700">{formatMoney(editingOrder.serviceCharge)}</div>
                    </>
                  )}
                  
                  {editingOrder.deliveryFee > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Fee</div>
                      <div className="text-right text-xs font-black text-slate-700">{formatMoney(editingOrder.deliveryFee)}</div>
                    </>
                  )}
                  
                  {editingOrder.discount > 0 && (
                    <>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Discount</div>
                      <div className="text-right text-xs font-black text-rose-500">-{formatMoney(editingOrder.discount)}</div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-0.5">New Grand Total</p>
                    <p className="text-3xl font-black text-[#0F172A]" style={{ fontFamily: 'DM Serif Display, serif' }}>
                      {formatMoney(editingOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0) + (editingOrder.serviceCharge || 0) + (editingOrder.deliveryFee || 0) - (editingOrder.discount || 0))}
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

