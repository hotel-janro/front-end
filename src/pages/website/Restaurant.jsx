// Restaurant.jsx - Supreme Luxury Customer Menu & Ordering
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import { ShoppingCart, X, Truck, Building2, Loader2, MapPin, Phone, History, UtensilsCrossed, Package, Star, Info, CheckCircle } from "lucide-react";
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
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [tableNumber, setTableNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
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

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setContactNumber(user.phone || "");
    }
  }, [user]);

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

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // --- ADVANCED PRICING LOGIC ---
  const HOTEL_COORDS = { lat: 6.9458, lng: 80.1250 }; // Malwana Road, Dompe

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

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

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
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setIsLocating(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("Restaurant: Location Captured:", { latitude, longitude });
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Reverse Geocoding - Fetch readable address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setDeliveryAddress(data.display_name);
            toast.success("Address auto-filled from your location!");
          }
        } catch (e) {
          console.error("Restaurant: Reverse geocoding failed:", e);
        }

        setIsLocating(false);
      },
      (err) => {
        console.error("Restaurant: Geolocation Error:", err);
        setIsLocating(false);
        
        switch(err.code) {
          case err.PERMISSION_DENIED:
            toast.error("Please allow location access in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
        }
      },
      options
    );
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }

    const errors = {};
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please select your gourmet choices.");
      return;
    }

    if (!customerName || customerName.trim().length < 2) {
      errors.customerName = "Name is required (at least 2 characters)";
    }

    const cleanPhone = (contactNumber || "").replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errors.contactNumber = "Phone number is required";
    } else if (cleanPhone.length !== 10 || isNaN(Number(cleanPhone))) {
      errors.contactNumber = "Must be exactly 10 digits";
    }

    if (orderType === "Room") {
      const rNum = Number(roomNumber);
      if (!roomNumber || isNaN(rNum) || rNum < 101 || rNum > 110) {
        errors.roomNumber = "Select a valid room (101-110)";
      }
    }

    if (orderType === "Dine-in" && !tableNumber) {
      errors.tableNumber = "Table number is required";
    }

    if (orderType === "Delivery" && !deliveryAddress) {
      errors.deliveryAddress = "Address is required for delivery";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please correct the highlighted fields");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const orderData = {
        items: cart.map(item => ({ 
          menuItemId: item._id, 
          quantity: item.quantity,
          portion: item.portion || "" 
        })),
        orderType,
        deliveryAddress: orderType === "Delivery" ? deliveryAddress : "",
        contactNumber,
        tableNumber: orderType === "Dine-in" ? tableNumber : "",
        roomNumber: orderType === "Room" ? roomNumber : "",
        coordinates,
        customerName,
        customerUser: user._id,
        subtotal,
        serviceCharge,
        deliveryFee,
        specialNotes,
        totalAmount: grandTotal,
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
      <div className="bg-[#0F172A] py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Luxury Dining" />
        </div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl text-[#D4AF37] mb-4 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>
            The <span className="italic text-white">Menu</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-xs font-bold uppercase tracking-[0.3em]">
            A Symphony of Flavors Awaits
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-[#0F172A] text-[#D4AF37] shadow-lg shadow-[#0F172A]/20"
                    : "text-gray-400 hover:text-[#0F172A] hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>

        {/* Menu Grid - Matched Gap and Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Curating the finest dishes...</p>
          </div>
        ) : (
          filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <UtensilsCrossed className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <h3 className="text-xl text-gray-300 font-light italic">No culinary treasures found in this category.</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-2">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowCart(false)} />
            
            <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/10">
              
              {/* Left Side: Scrollable Order Summary */}
              <div className="w-full md:w-[35%] bg-[#0F172A] flex flex-col border-r border-white/5">
                <div className="px-6 py-6 border-b border-white/5">
                  <h2 className="text-xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your <span className="text-[#D4AF37]">Selection</span></h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar-dark px-6 py-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                      <Package className="w-12 h-12 text-white mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-white">Empty</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartItemId} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <div className="flex gap-3 items-center">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-xs font-normal truncate" style={{ fontFamily: "DM Serif Display, serif" }}>{item.name}</h4>
                            <p className="text-[8px] text-[#D4AF37] font-bold mt-0.5">{item.quantity}x • {formatCurrency(item.price)}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.cartItemId)} className="text-rose-400/30 hover:text-rose-400">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-black/20 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest font-black">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {serviceCharge > 0 && (
                    <div className="flex justify-between text-[9px] text-emerald-400 uppercase tracking-widest font-black">
                      <span>Service Charge (10%)</span>
                      <span>{formatCurrency(serviceCharge)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-[9px] text-sky-400 uppercase tracking-widest font-black">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Total Payable</p>
                      <h3 className="text-3xl text-white font-normal leading-none" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {formatCurrency(grandTotal)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Non-Scrolling Form */}
              <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Checkout <span className="text-[#D4AF37]">Details</span></h2>
                  </div>
                  <button onClick={() => setShowCart(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#0F172A] transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 px-8 py-6 space-y-5 overflow-hidden bg-slate-50/10">
                  {/* Step 1: Mode */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">01. Select Dining Mode</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: "Dine-in", icon: UtensilsCrossed, label: "Dine-In", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
                        { id: "Room", icon: Building2, label: "Room", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
                        { id: "Delivery", icon: Truck, label: "Delivery", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
                        { id: "Take-away", icon: Package, label: "Take-Away", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => { setOrderType(type.id); setValidationErrors({}); }}
                          className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden border-2 ${
                            orderType === type.id 
                            ? "bg-[#0F172A] border-[#0F172A] scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)]" 
                            : `${type.bg} ${type.border} hover:border-[#D4AF37]/30 hover:shadow-lg hover:-translate-y-1`
                          }`}
                        >
                          {/* Active Background Glow */}
                          {orderType === type.id && (
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#D4AF37] to-transparent animate-pulse" />
                          )}
                          
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            orderType === type.id 
                            ? "bg-[#D4AF37] text-[#0F172A] shadow-[0_0_20px_rgba(212,175,55,0.4)] rotate-[360deg]" 
                            : `bg-white ${type.text} shadow-sm group-hover:scale-110`
                          }`}>
                            <type.icon className="w-5 h-5" />
                          </div>

                          <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors duration-500 ${
                            orderType === type.id ? "text-[#D4AF37]" : "text-slate-600"
                          }`}>
                            {type.label}
                          </span>

                          {/* Selection Indicator */}
                          {orderType === type.id && (
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D4AF37] shadow-[0_0_100px_#D4AF37]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">02. Guest Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input 
                            value={customerName} 
                            onChange={e => { setCustomerName(e.target.value); clearError('customerName'); }}
                            className={`w-full bg-white border-2 ${validationErrors.customerName ? 'border-rose-400' : 'border-slate-100'} rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#D4AF37] pl-10 text-slate-900 shadow-sm`}
                            placeholder="Your Full Name"
                          />
                          <Star className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" />
                        </div>
                        {validationErrors.customerName && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.customerName}</p>}
                      </div>

                      {/* Phone Field */}
                      <div className="space-y-1">
                        <div className="relative">
                          <input 
                            value={contactNumber} 
                            onChange={e => { setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError('contactNumber'); }}
                            className={`w-full bg-white border-2 ${validationErrors.contactNumber ? 'border-rose-400' : 'border-slate-100'} rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#D4AF37] pl-10 text-slate-900 shadow-sm`}
                            placeholder="Phone Number"
                          />
                          <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" />
                        </div>
                        {validationErrors.contactNumber && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.contactNumber}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Location Dropdowns */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">03. Location Details</h3>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      {orderType === "Dine-in" && (
                        <>
                          <div className="relative">
                            <select value={tableNumber} onChange={e => { setTableNumber(e.target.value); clearError('tableNumber'); }} className={`w-full bg-slate-50/50 border-2 ${validationErrors.tableNumber ? 'border-rose-300' : 'border-slate-100'} rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none cursor-pointer text-slate-700`}>
                              <option value="">Select Table Number</option>
                              {["T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-07", "T-08", "T-09", "T-10"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <UtensilsCrossed className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" />
                          </div>
                          {validationErrors.tableNumber && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.tableNumber}</p>}
                        </>
                      )}
                      {orderType === "Room" && (
                        <>
                          <div className="relative">
                            <select value={roomNumber} onChange={e => { setRoomNumber(e.target.value); clearError('roomNumber'); }} className={`w-full bg-slate-50/50 border-2 ${validationErrors.roomNumber ? 'border-rose-300' : 'border-slate-100'} rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none cursor-pointer text-slate-700`}>
                              <option value="">Select Room Number</option>
                              {["101", "102", "103", "104", "105", "106", "107", "108", "109", "110"].map(r => <option key={r} value={r}>Room {r}</option>)}
                            </select>
                            <Building2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" />
                          </div>
                          {validationErrors.roomNumber && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.roomNumber}</p>}
                        </>
                      )}
                      {orderType === "Delivery" && (
                        <>
                          <div className="flex gap-3">
                            <textarea value={deliveryAddress} onChange={e => { setDeliveryAddress(e.target.value); clearError('deliveryAddress'); }} className="flex-1 bg-slate-50/50 border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none h-16 resize-none text-slate-700" placeholder="Type delivery address here..." />
                            <button 
                              onClick={handleGetLocation} 
                              className={`w-20 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-500 shadow-lg group ${
                                coordinates 
                                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                                : 'bg-[#0F172A] text-[#D4AF37] hover:bg-slate-800'
                              }`}
                            >
                              {isLocating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                coordinates ? <CheckCircle className="w-5 h-5" /> : <MapPin className="w-5 h-5 group-hover:animate-bounce" />
                              )}
                              <span className="text-[7px] font-black uppercase tracking-widest mt-1">
                                {isLocating ? "Loading" : (coordinates ? "Pinned" : "Pin Location")}
                              </span>
                            </button>
                          </div>
                          {validationErrors.deliveryAddress && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.deliveryAddress}</p>}
                        </>
                      )}
                      {orderType === "Take-away" && <p className="text-[9px] font-black text-[#D4AF37] uppercase text-center py-2 tracking-widest">Self-Pickup at Restaurant</p>}
                    </div>
                  </div>

                  {/* Step 4: Notes */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">04. Special Notes (Optional)</h3>
                    </div>
                    <input value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-[#D4AF37] text-slate-700 shadow-sm" placeholder="Any special requests or allergies?" />
                  </div>
                </div>

                <div className="px-8 py-6 bg-white border-t border-slate-50 mt-auto">
                  <button
                    disabled={isPlacingOrder || cart.length === 0}
                    onClick={handlePlaceOrder}
                    className="w-full py-5 rounded-2xl bg-[#0F172A] text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isPlacingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {isPlacingOrder ? "Wait..." : "Confirm Order"}
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
