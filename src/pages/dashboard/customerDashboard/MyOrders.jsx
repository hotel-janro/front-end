// MyOrders.jsx - Clean website-style orders page
import React from "react";
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle } from "lucide-react";

export function MyOrders() {
  const orders = [
    { id: "ORD-7721", date: "2026-05-15", items: "Truffle Risotto, Signature Cocktails", total: 46.75, status: "Delivered" },
    { id: "ORD-6542", date: "2026-05-10", items: "Wagyu Beef Burger", total: 32.00, status: "Processing" },
    { id: "ORD-5410", date: "2026-04-28", items: "Seafood Platter, White Wine", total: 115.50, status: "Cancelled" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "Processing": return <Clock className="w-4 h-4 text-[#D4AF37]" />;
      case "Cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Processing": return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-12 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
              My Orders
            </h1>
            <p className="text-gray-500 text-sm">Track and manage your restaurant and room service orders.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0F172A] rounded-xl border border-[#D4AF37]/20 shadow-lg shadow-[#0F172A]/10 self-start">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#D4AF37]">{orders.length} Active Orders</span>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2rem] shadow-xl shadow-[#0F172A]/5 border border-gray-100 overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-500 group">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F172A]/5 flex items-center justify-center shrink-0 border border-[#0F172A]/10 group-hover:bg-[#0F172A] transition-colors duration-500">
                      <Package className="w-7 h-7 text-[#0F172A] group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-bold text-[#0F172A] tracking-wider">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-3">{order.items}</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Ordered on {order.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Grand Total</p>
                      <p className="text-3xl font-bold text-[#0F172A]">${order.total.toFixed(2)}</p>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-[#B8962D] transition-all cursor-pointer group uppercase tracking-widest">
                      View Details
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl shadow-[#0F172A]/5 border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-3xl font-bold text-[#0F172A] mb-3">No orders yet</h3>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto text-sm">
              Savor our culinary delights. Visit our restaurant or order directly to your suite.
            </p>
            <button className="bg-[#0F172A] text-[#D4AF37] px-12 py-4 rounded-2xl font-bold hover:bg-[#1E293B] transition-all shadow-xl shadow-[#0F172A]/20 cursor-pointer border border-[#D4AF37]/20">
              Explore Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
