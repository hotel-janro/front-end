// MyOrders.jsx - Premium Customer Orders & Billing Dashboard
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  History,
  ArrowUpRight,
  Wallet,
  Receipt,
  CreditCard,
  UtensilsCrossed
} from "lucide-react";
import { apiFetch } from "../../../api.js";
import { useSettings } from "../../../context/SettingsContext.jsx";
import { generateInvoicePDF } from "../../../utils/invoiceGenerator.js";
import { toast } from "sonner";
import "./CustomerDashboard.css";

export function MyOrders() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const [activeTab, setActiveTab] = useState("orders"); // orders, payments, receipts
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    loadMyOrders();
  }, []);

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

  const completedOrders = orders.filter(o => o.orderStatus === "Completed");
  const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Preparing");
  const paidOrders = orders.filter(o => o.paymentStatus === "Paid");
  const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);

  const stats = [
    {
      label: "Total Investment",
      value: formatMoney(totalSpent),
      note: "Total Spent",
      Icon: DollarSign,
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
    if (status === "Completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Pending" || status === "Preparing") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-rose-100 text-rose-700 border-rose-200";
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
      {/* Immersive Luxury Header */}
      <div className="relative h-[50vh] bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury Dining" />
        </div>
        <div className="absolute inset-0 bg-[#0F172A]/80" />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="absolute left-0 bottom-0 h-1/2 w-1/2 bg-[#D4AF37]/5 rounded-full blur-[120px] -ml-20 -mb-20" />

        <div className="relative z-10 text-center px-4 max-w-4xl animate-in fade-in zoom-in duration-1000 mt-10">
          <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-[10px] font-black mb-6 opacity-80 flex items-center justify-center gap-4">
            <span className="w-8 h-px bg-[#D4AF37]/30" />
            Elite Guest Dashboard
            <span className="w-8 h-px bg-[#D4AF37]/30" />
          </p>
          <h1 className="text-5xl md:text-7xl text-white font-normal mb-6 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
            Your <span className="italic text-[#D4AF37]">Culinary</span> History
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Track your exquisite selections, manage your payments, and view your receipts with unparalleled elegance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">

        {/* Luxury Tab Navigation */}
        <div className="flex justify-center mb-12 overflow-x-auto no-scrollbar py-2">
          <div className="inline-flex bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white">
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
                  className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap cursor-pointer ${active
                      ? "bg-[#0F172A] text-[#D4AF37] shadow-2xl scale-105"
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

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <article key={stat.label} className="rounded-[2.5rem] bg-white border border-slate-100 p-8 transition-all hover:-translate-y-2 hover:shadow-2xl duration-500 shadow-xl shadow-slate-200/20">
                <div className="flex flex-col items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#0F172A] text-[#D4AF37] flex items-center justify-center shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-[#0F172A]">{stat.value}</h3>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Main Content Area based on Tabs */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <article className="xl:col-span-2 space-y-8">
            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Recent Orders</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Your Culinary Journey</p>
                    </div>
                  </div>
                </header>

                <div className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                      <UtensilsCrossed className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-light italic text-lg">No orders found in your history</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order._id} className="p-8 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-3">
                              <p className="text-sm font-black text-slate-900 tracking-wider">REF: #{order.orderNumber || order._id.slice(-8)}</p>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusPill(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                {order.paymentStatus}
                              </span>
                            </div>

                            {/* Order Items Detailed View */}
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mt-4 group-hover:bg-white transition-colors">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Order Items</p>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                      {item.name} <span className="text-slate-400 font-medium">x{item.quantity}</span>
                                    </span>
                                    <span className="text-slate-500 font-medium">{formatMoney(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <UtensilsCrossed className="w-3 h-3" /> {order.orderType}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <Clock className="w-3 h-3" /> {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 flex flex-col items-start md:items-end justify-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-black text-[#0F172A]">{formatMoney(order.totalAmount)}</p>
                            <button className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-[#D4AF37] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all shadow-lg hover:shadow-[#D4AF37]/20">
                              Order Details
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
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
                <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your Receipts</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Proof of Purchase</p>
                    </div>
                  </div>
                </header>

                <div className="divide-y divide-slate-100">
                  {paidOrders.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                      <Receipt className="w-16 h-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-light italic text-lg">No paid receipts available yet.</p>
                    </div>
                  ) : (
                    paidOrders.map((order) => (
                      <div key={`receipt-${order._id}`} className="p-6 md:p-8 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0">
                            <DollarSign className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-wider">RECEIPT #{order.orderNumber || order._id.slice(-8)}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                            <span className="inline-block mt-2 px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-200">
                              Paid in Full
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                          <p className="text-2xl font-black text-[#0F172A]">{formatMoney(order.totalAmount)}</p>
                          <button 
                            onClick={() => generateInvoicePDF(order, settings)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all"
                          >
                            Download PDF
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
    </div>
  );
}

