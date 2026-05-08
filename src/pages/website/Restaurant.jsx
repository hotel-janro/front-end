// Restaurant.jsx - Supreme Luxury Customer Menu & Ordering
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import { ShoppingCart, X, Truck, Building2, Loader2, MapPin, Phone, History, UtensilsCrossed, Package, Star, Info } from "lucide-react";
import { apiFetch, API_HOST, getImageUrl } from "../../api.js";
import { toast } from "sonner";
import { useSettings } from "../../context/SettingsContext.jsx";

export function Restaurant({ onOrder, user }) {
  const navigate = useNavigate();
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

  const categories = useMemo(() => {
    const rawCategories = ["All", ...new Set(menuItems.map(i => i.category).filter(Boolean))];
    return rawCategories
      .filter(cat => !["Breakfast", "Appetizers", "Chef's Specialty"].includes(cat)) 
      .map(cat => (cat === "Snack" || cat === "Snacks") ? "Bites" : cat); 
  }, [menuItems]);

  const filteredItems = useMemo(() => 
    activeCategory === "All" ? menuItems : menuItems.filter(i => i.category === activeCategory)
  , [menuItems, activeCategory]);

  const addToCart = (item) => {
    console.log("Restaurant: Adding to cart:", item);
    setCart((prev) => {
      const cartItemId = `${item._id}-${item.portion || 'single'}`;
      const existing = prev.find((c) => c.cartItemId === cartItemId);
      if (existing) {
        return prev.map((c) => c.cartItemId === cartItemId ? { ...c, quantity: c.quantity + (item.quantity || 1) } : c);
      }
      return [...prev, { ...item, cartItemId, quantity: item.quantity || 1, price: Number(item.price) || 0 }];
    });
    toast.success(`${item.name} ${item.portion ? `(${item.portion})` : ''} added`);
  };

  const removeFromCart = (cartItemId) => setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));

  // --- ADVANCED PRICING LOGIC ---
  const HOTEL_COORDS = { lat: 6.0833, lng: 80.5667 }; // Kamburupitiya, Matara

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

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  
  let serviceCharge = 0;
  let deliveryFee = 0;
  let distance = 0;

  if (orderType === "Dine-in" || orderType === "Room") {
    serviceCharge = subtotal * 0.1; 
  } else if (orderType === "Delivery" && coordinates) {
    distance = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, coordinates.lat, coordinates.lng);
    if (distance > 1 && distance <= 15) {
      // 10% of subtotal for each km after the first free km
      deliveryFee = subtotal * 0.1 * Math.floor(distance); 
    }
  }

  const grandTotal = subtotal + serviceCharge + deliveryFee;
  const isDistanceTooFar = orderType === "Delivery" && distance > 15;

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
    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }
    console.log("Restaurant: Initiating Order Validation...", { orderType, roomNumber, contactNumber, cart });

    if (cart.length === 0) {
      alert("Please select items before placing an order.");
      toast.error("Your cart is empty. Please select your gourmet choices.");
      return;
    }
    
    // --- STRENGTHENED VALIDATION WITH ALERTS ---

    // 1. Contact Number Validation
    if (contactNumber || orderType === "Delivery") {
      const cleanPhone = (contactNumber || "").replace(/[\s-]/g, '');
      if (cleanPhone.length !== 10 || isNaN(Number(cleanPhone))) {
        alert("CRITICAL ERROR: Phone number must be exactly 10 digits!");
        toast.error("Invalid Phone: Must be exactly 10 digits (e.g., 0712345678)");
        return;
      }
    }

    // 2. Room Number Validation
    if (roomNumber || orderType === "Room") {
      const rNum = Number(roomNumber);
      if (!roomNumber || isNaN(rNum) || rNum < 1 || rNum > 10) {
        alert("CRITICAL ERROR: Invalid Room Number! Only rooms 1 to 10 are permitted.");
        toast.error("Invalid Room: Please select a room between 1 and 10.");
        return;
      }
    }

    // 3. Table Number Validation
    if (orderType === "Dine-in" && !tableNumber) {
      alert("Error: Please provide your table number.");
      toast.error("Please specify your table number.");
      return;
    }

    // 4. Delivery Address Validation
    if (orderType === "Delivery" && !deliveryAddress) {
      alert("Error: Delivery address is required.");
      toast.error("Delivery address is required.");
      return;
    }

    try {
      console.log("Restaurant: Validation Passed. Sending to Backend...");
      setIsPlacingOrder(true);
      const orderData = {
        orderType,
        items: cart.map(item => ({ 
          menuItemId: item._id, 
          quantity: item.quantity,
          portion: item.portion || "" 
        })),
        deliveryAddress: orderType === "Delivery" ? deliveryAddress : "",
        contactNumber: contactNumber || "",
        tableNumber: orderType === "Dine-in" ? tableNumber : "",
        roomNumber: orderType === "Room" ? roomNumber : "",
        coordinates,
        customerName: user.name,
        customerUser: user._id,
        subtotal,
        serviceCharge,
        deliveryFee,
        totalAmount: grandTotal
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
          {user && (
            <p className="text-[#D4AF37] tracking-[0.2em] uppercase text-[8px] font-black mb-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
              Welcome back, {user.name}
            </p>
          )}
          <p className="text-white/40 tracking-[0.3em] uppercase text-[10px] font-bold mb-3">Culinary Excellence</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
              onClick={() => {
                console.log("Restaurant: Opening cart...");
                setShowCart(true);
              }}
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
            <div className="relative bg-white w-full max-w-md h-full shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in slide-in-from-right duration-700 ease-in-out">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your <span className="italic text-[#D4AF37]">Selection</span></h2>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Refined Gastronomy</p>
                </div>
                <button onClick={() => setShowCart(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <History className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase tracking-widest text-[10px] text-center">Your order is currently empty</p>
                  </div>
                ) : (
                   cart.map((item) => (
                    <div key={item.cartItemId} className="group flex items-center gap-4 p-4 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-50">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-slate-100">
                        <ImageWithFallback 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">{item.name} {item.portion ? `(${item.portion})` : ''}</h4>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                          {item.quantity} x {settings?.currency?.symbol || "Rs."}{Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-sm font-black text-slate-900">{settings?.currency?.symbol || "Rs."}{Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.cartItemId)} className="p-1.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Section */}
              <div className="p-6 bg-slate-50 rounded-t-[2.5rem] border-t border-slate-100 space-y-6">
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
                          <input 
                            type="tel" 
                            maxLength="10" 
                            value={contactNumber} 
                            onChange={e => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                            placeholder="07x xxxxxxx" 
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" 
                          />
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
                      <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={roomNumber} 
                        onChange={e => setRoomNumber(e.target.value)} 
                        placeholder="1-10" 
                        className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" 
                      />
                    </div>
                  )}
                </div>

                {/* Total & Action */}
                <div className="pt-8 border-t border-slate-200 space-y-4">
                  {/* Dynamic Breakdown */}
                  {cart.length > 0 && (
                    <div className="space-y-3 px-6 py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>{settings?.currency?.symbol || "Rs."}{Number(subtotal || 0).toLocaleString()}</span>
                      </div>
                      
                      {serviceCharge > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                          <span className="flex items-center gap-2 italic">Service Charge (10%) <Info className="w-3 h-3" /></span>
                          <span>+{settings?.currency?.symbol || "Rs."}{Number(serviceCharge || 0).toLocaleString()}</span>
                        </div>
                      )}

                      {deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-black text-blue-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2 italic">Delivery Fee (over 1km) <Truck className="w-3 h-3" /></span>
                          <span>+{settings?.currency?.symbol || "Rs."}{Number(deliveryFee || 0).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {orderType === "Delivery" && distance > 15 && (
                        <div className="flex justify-between items-center text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 p-3 rounded-xl border border-rose-100">
                          <span className="flex items-center gap-2 italic">Out of Range ({Number(distance || 0).toFixed(1)}km) <X className="w-3 h-3" /></span>
                          <span>Delivery Only up to 15km</span>
                        </div>
                      )}
                      
                      {orderType === "Delivery" && distance > 0 && distance <= 1 && (
                        <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2 italic">Delivery Distance ({Number(distance || 0).toFixed(1)}km)</span>
                          <span>FREE</span>
                        </div>
                      )}

                      {orderType === "Delivery" && distance > 1 && distance <= 15 && (
                         <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2 italic">Distance</span>
                          <span>{Number(distance || 0).toFixed(1)}km</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Grand Total</p>
                      <p className="text-4xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {settings?.currency?.symbol || "Rs."}{Number(grandTotal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isPlacingOrder || cart.length === 0 || isDistanceTooFar}
                    onClick={handlePlaceOrder}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                      isDistanceTooFar 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-[#0F172A] text-white hover:bg-[#D4AF37] hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {isPlacingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : isDistanceTooFar ? <X className="w-4 h-4" /> : <Star className="w-4 h-4 fill-current" />}
                    {isPlacingOrder ? "Processing..." : isDistanceTooFar ? "Location Too Far" : "Confirm Order"}
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
