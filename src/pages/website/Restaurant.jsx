// Restaurant.jsx - Supreme Luxury Customer Menu & Ordering
import React, { useState, useEffect, useMemo } from "react";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { ShoppingCart, X, Truck, Building2, Loader2, MapPin, Phone, History, UtensilsCrossed, Package, Star } from "lucide-react";
import { apiFetch, API_HOST, getImageUrl } from "../../api.js";
import { toast } from "sonner";
import { useSettings } from "../../context/SettingsContext.jsx";

export function Restaurant({ onOrder, user }) {
  const { settings } = useSettings();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // Advanced Order State
  const [orderType, setOrderType] = useState("Dine-in");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await apiFetch("/menu?limit=100&populate=inventoryItem");
        // Handle both paginated and non-paginated responses
        const items = Array.isArray(data) ? data : (data?.items || []);
        setMenuItems(items);
      } catch (err) {
        toast.error("Failed to load our menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = useMemo(() => ["All", ...new Set(menuItems.map(i => i.category).filter(Boolean))], [menuItems]);

  const filteredItems = useMemo(() => 
    activeCategory === "All" ? menuItems : menuItems.filter(i => i.category === activeCategory)
  , [menuItems, activeCategory]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + (item.quantity || 1) } : c);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    toast.success(`${item.name} added to your selection`);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c._id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const handleGetLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation is not supported");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast.success("Delivery location captured!");
      },
      () => {
        setIsLocating(false);
        toast.error("Could not capture location");
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error("Your cart is empty");
    
    // Validation
    if (orderType === "Delivery" && (!deliveryAddress || !contactNumber)) {
      return toast.error("Please provide delivery details");
    }
    if (orderType === "Dine-in" && !tableNumber) return toast.error("Please provide your table number");
    if (orderType === "Room" && !roomNumber) return toast.error("Please provide your room number");

    try {
      setIsPlacingOrder(true);
      const orderData = {
        orderType,
        items: cart.map(item => ({ menuItemId: item._id, quantity: item.quantity })),
        deliveryAddress,
        contactNumber,
        tableNumber,
        roomNumber,
        coordinates,
        customerName: user?.name || "Guest Customer",
        customerUser: user?._id || null
      };

      const result = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      toast.success("Exceptional choice! Your order is being prepared.");
      setCart([]);
      setShowCart(false);
      if (onOrder) onOrder(result);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section - Perfectly Matched with Events Page */}
      <div className="bg-[#0F172A] py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury Dining" />
        </div>
        <div className="relative z-10">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-[10px] font-bold mb-3">Culinary Excellence</p>
          <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            The Grand Menu
          </h1>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Experience unparalleled luxury and dedicated service in our collection of exquisite dishes, designed to host life's most delicious moments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-32">
        {/* Tab Switcher - Matching Events Page Style */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl shadow-[#0F172A]/10 border border-gray-100 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2.5 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20"
                    : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid - Matched Gap and Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Curating your experience...</p>
          </div>
        ) : (
          filteredItems.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <UtensilsCrossed className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl text-gray-300 font-light italic">No culinary treasures found in this category.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <FoodCard key={item._id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          )
        )}

        {/* Elite Floating Cart Trigger */}
        {cart.length > 0 && (
          <div className="fixed bottom-10 right-10 z-40 group">
            <button
              onClick={() => setShowCart(true)}
              className="bg-[#0F172A] text-white w-24 h-24 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)] flex flex-col items-center justify-center gap-1 hover:scale-110 hover:bg-[#D4AF37] transition-all duration-500 cursor-pointer group-active:scale-90"
            >
              <ShoppingCart className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase tracking-widest">Order</span>
              <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-[#0F172A] w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs border-4 border-white shadow-xl">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </button>
          </div>
        )}

        {/* Supreme Sliding Cart Panel */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowCart(false)} />
            <div className="relative bg-white w-full max-w-lg h-full shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in slide-in-from-right duration-700 ease-in-out">
              
              {/* Header */}
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your <span className="italic text-[#D4AF37]">Selection</span></h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Refined Gastronomy</p>
                </div>
                <button onClick={() => setShowCart(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <History className="w-20 h-20 mb-6" />
                    <p className="font-black uppercase tracking-widest text-xs text-center">Your order is currently empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="group flex items-center gap-6 p-5 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-50">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-slate-100">
                        <ImageWithFallback 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h4>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">
                          {item.quantity} x {settings.currency.symbol}{item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                        <p className="text-lg font-black text-slate-900">{settings.currency.symbol}{(item.price * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item._id)} className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Section */}
              <div className="p-10 bg-slate-50 rounded-t-[3rem] border-t border-slate-100 space-y-8">
                {/* Order Type Tabs */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "Dine-in", icon: UtensilsCrossed, label: "Dine" },
                    { id: "Room", icon: Building2, label: "Room" },
                    { id: "Delivery", icon: Truck, label: "Ship" },
                    { id: "Take-away", icon: Package, label: "To-Go" }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setOrderType(type.id)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all cursor-pointer ${
                        orderType === type.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-200 text-slate-400 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Conditional Fields */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {orderType === "Delivery" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                        <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Suite, Street, City..." className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] resize-none h-24" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact</label>
                          <input type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="+94..." className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pin Location</label>
                          <button onClick={handleGetLocation} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${coordinates ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                            {coordinates ? "Captured" : "Get GPS"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {orderType === "Dine-in" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Table Number</label>
                      <input value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="T-12" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" />
                    </div>
                  )}
                  {orderType === "Room" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                      <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="302-A" className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" />
                    </div>
                  )}
                </div>

                {/* Total & Action */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Grand Total</p>
                      <p className="text-5xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {settings.currency.symbol}{grandTotal.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 text-right italic leading-tight">
                      Incl. 10% Luxury Tax<br />& Service Charge
                    </p>
                  </div>
                  <button
                    disabled={isPlacingOrder || cart.length === 0}
                    onClick={handlePlaceOrder}
                    className="w-full bg-[#0F172A] text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-[#D4AF37] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(15,23,42,0.2)] flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer"
                  >
                    {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5 fill-current" />}
                    {isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
