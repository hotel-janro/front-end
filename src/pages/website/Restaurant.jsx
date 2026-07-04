// Restaurant - Customer Menu & Ordering
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { ImageWithFallback } from "../../components/common/ImageWithFallback.jsx";
import { MapPicker } from "../../components/common/MapPicker.jsx";
import { ShoppingCart, X, Truck, Building2, Loader2, MapPin, Phone, History, UtensilsCrossed, Package, Star, Info, CheckCircle, Search, Filter, ChevronDown } from "lucide-react";
import { apiFetch, API_HOST, getImageUrl } from "../../api.js";
import { toast } from "sonner";
import { useSettings } from "../../context/SettingsContext.jsx";

export function Restaurant({ onOrder, user }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 12 fits better in responsive grids (2, 3, or 4 columns)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Order state
  const [orderType, setOrderType] = useState("Dine-in");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState(user?.phone || "");
  const [tableNumber, setTableNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Card"); // Card or Cash
  const [validationErrors, setValidationErrors] = useState({});
  const [myRooms, setMyRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (user) {
        try {
          const res = await apiFetch("/bookings/my");
          if (res?.data) {
            const active = res.data.filter(b => b.status?.toLowerCase() === 'checked-in');
            setMyRooms(active);
          }
        } catch (e) {
          console.error("Failed to fetch my rooms", e);
        }
      } else {
        setMyRooms([]);
      }
    };
    if (showCart) fetchRooms();
  }, [user, showCart]);

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
        const data = await apiFetch("/menu?limit=100&populate=inventoryItem&isAvailable=true");
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

  const filteredItems = useMemo(() => {
    return menuItems.filter(i => {
      const matchCategory = activeCategory === "All" || i.category === activeCategory;
      const searchLower = debouncedSearch.toLowerCase();
      const matchSearch = !debouncedSearch || 
        i.name.toLowerCase().includes(searchLower) || 
        (i.category && i.category.toLowerCase().includes(searchLower));
      return matchCategory && matchSearch;
    });
  }, [menuItems, activeCategory, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearch]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const addToCart = (item) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
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

  // Pricing and distance logic
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
    const straightDist = calculateDistance(HOTEL_COORDS.lat, HOTEL_COORDS.lng, coordinates.lat, coordinates.lng);
    // Apply a 1.2x winding factor to estimate actual road distance
    distance = straightDist * 1.2;
    if (distance > 0 && distance <= 1) {
      deliveryFee = 0;
    } else if (distance > 1 && distance <= 3) {
      deliveryFee = 150;
    } else if (distance > 3 && distance <= 6) {
      deliveryFee = 250;
    } else if (distance > 6 && distance <= 9) {
      deliveryFee = 350;
    } else if (distance > 9 && distance <= 12) {
      deliveryFee = 450;
    } else if (distance > 12 && distance <= 15) {
      deliveryFee = 550;
    }
  }

  const grandTotal = subtotal + serviceCharge + deliveryFee;
  const isDistanceTooFar = orderType === "Delivery" && distance > 15;

  const autoGeocode = async (address) => {
    if (!address || address.trim().length < 5) {
      toast.error("Please enter a longer address to search.");
      return;
    }
    setIsSearchingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=LK`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        toast.success("Location found and pinned!");
      } else {
        toast.error("Address not found. Please drag the pin on the map to your exact location.");
      }
    } catch (e) {
      toast.error("Search failed. Please drag the pin manually.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleMapCoordinatesChange = async (coords) => {
    setCoordinates(coords);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setDeliveryAddress(data.display_name);
      }
    } catch (e) {
      console.error("Reverse geocoding failed on marker drag:", e);
    }
  };

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

        // Fill address from location
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

        switch (err.code) {
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
      if (!roomNumber || myRooms.length === 0) {
        errors.roomNumber = "Please select your booked room";
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

    if (isDistanceTooFar) {
      toast.error("Sorry, we cannot deliver to your location as it is outside our 15km delivery radius.");
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
        paymentMethod
      };

      const result = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      const order = result.data || result; // Fallback in case backend returns plain order

      const completeSuccess = () => {
        toast.success("Exceptional choice! Your order is being prepared.");
        setCart([]);
        setShowCart(false);
        if (onOrder) onOrder(result);
      };

      if (paymentMethod === "Card") {
        try {
          const hashRes = await apiFetch("/payments/payhere-hash", {
            method: "POST",
            body: JSON.stringify({
              orderId: order._id,
              amount: grandTotal
            })
          });

          if (!hashRes || !hashRes.success) {
            throw new Error("Failed to generate payment signature.");
          }

          const { merchantId, currency, hash, amount } = hashRes.data;
          
          const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "").replace(/\/$/, "");

          const payment = {
            sandbox: true,
            merchant_id: merchantId,
            return_url: `${window.location.origin}/my-orders`,
            cancel_url: `${window.location.origin}/restaurant`,
            notify_url: `${API_BASE}/api/payments/payhere-notify`,
            order_id: order._id,
            items: `Restaurant Order - ${cart.length} items`,
            amount: amount,
            currency: currency,
            hash: hash,
            first_name: customerName.split(" ")[0] || "Valued",
            last_name: customerName.split(" ")[1] || "Guest",
            email: user?.email || "guest@hoteljanro.com",
            phone: contactNumber,
            address: orderType === "Delivery" ? deliveryAddress : "Hotel Janro",
            city: "Colombo",
            country: "Sri Lanka",
            custom_1: "order" // Signal to backend that this is a restaurant order
          };

          window.payhere.onCompleted = function onCompleted(orderId) {
            completeSuccess();
            // Optional: redirect to my orders page if you prefer
            // window.location.href = "/my-orders";
          };

          window.payhere.onDismissed = function onDismissed() {
            toast.error("Payment window closed. Order is saved as Unpaid in your dashboard.");
            setCart([]);
            setShowCart(false);
          };

          window.payhere.onError = function onError(error) {
            toast.error("Payment failed: " + error);
            setCart([]);
            setShowCart(false);
          };

          window.payhere.startPayment(payment);
        } catch (err) {
          toast.error("Could not start payment: " + err.message);
          setCart([]);
          setShowCart(false);
        }
      } else {
        // Cash payment
        completeSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] py-16 text-center relative overflow-hidden">
        {/* Hero */}
        <div className="absolute inset-0 opacity-10">
          <img src="https://res.cloudinary.com/dhuirf8i9/image/upload/v1783022207/hotel_janro/hotel_hero.jpg" className="w-full h-full object-cover" alt="Hotel Janro" />
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
        {/* Search & Categories */}
        <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row gap-4 px-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
            <input
              type="text"
              placeholder="Search for your favorite dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0F172A] border border-[#D4AF37]/30 rounded-2xl shadow-md text-sm font-semibold outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-white placeholder:text-gray-400 hover:border-[#D4AF37]/60"
            />
          </div>
          
          {/* Category Dropdown */}
          <div className="relative w-full md:w-64">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-3.5 bg-[#0F172A] border border-[#D4AF37]/30 rounded-2xl shadow-md text-sm font-bold uppercase tracking-widest text-white cursor-pointer hover:border-[#D4AF37]/60 transition-all text-left"
            >
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <span className="truncate">{activeCategory}</span>
              <ChevronDown className={`w-5 h-5 text-[#D4AF37] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Options List */}
                <div className="absolute right-0 left-0 mt-2 bg-[#0F172A] border border-[#D4AF37]/30 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[#D4AF37]/10 animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeCategory === cat 
                          ? 'bg-[#D4AF37] text-[#0F172A]' 
                          : 'text-white hover:bg-white/5'
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

        {/* Menu Grid */}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-2">
                {paginatedItems.map((item) => (
                  <FoodCard key={item._id} item={item} onAddToCart={addToCart} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto animate-in fade-in duration-300">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                      currentPage === 1 
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                        : "bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-[#D4AF37] active:scale-95 border border-slate-200"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                      currentPage === totalPages 
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                        : "bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-[#D4AF37] active:scale-95 border border-slate-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )
        )}

        {/* Floating Cart Button */}
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

        {/* Checkout Modal */}
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
            <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowCart(false)} />

            <div className="relative bg-white w-full max-w-5xl h-[95vh] md:h-[85vh] rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500 border border-white/10">

              {/* Order Summary */}
              <div className="w-full md:w-[35%] h-[40%] md:h-full bg-[#0F172A] flex flex-col border-b md:border-b-0 md:border-r border-white/5 shrink-0 md:shrink">
                <div className="px-4 md:px-6 py-4 md:py-6 border-b border-white/5 shrink-0">
                  <h2 className="text-xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Your <span className="text-[#D4AF37]">Selection</span></h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar-dark px-4 md:px-6 py-4 space-y-3 min-h-0">
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

                <div className="p-4 md:p-6 bg-black/20 border-t border-white/5 space-y-2 shrink-0">
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
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] text-sky-400 uppercase tracking-widest font-black">
                        <span>Delivery Fee</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                      <span className="text-[7px] text-sky-400/60 text-right uppercase tracking-widest font-bold">
                        {distance.toFixed(1)} km (Distance-based fixed rate)
                      </span>
                    </div>
                  )}
                  {orderType === "Delivery" && deliveryAddress && (
                    <div className="pt-2 border-t border-white/5 flex flex-col gap-0.5 mt-2">
                      <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Delivery Address</span>
                      <span className="text-[9px] text-white/80 leading-snug line-clamp-2">{deliveryAddress}</span>
                    </div>
                  )}

                  <div className="pt-2 md:pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Total Payable</p>
                      <h3 className="text-2xl md:text-3xl text-white font-normal leading-none" style={{ fontFamily: "DM Serif Display, serif" }}>
                        {formatCurrency(grandTotal)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <div className="flex-1 bg-white flex flex-col h-[60%] md:h-full overflow-hidden">
                <div className="px-6 md:px-8 py-3 md:py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl md:text-2xl text-slate-900 font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Checkout <span className="text-[#D4AF37]">Details</span></h2>
                  </div>
                  <button onClick={() => setShowCart(false)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#0F172A] transition-all">
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="flex-1 px-6 md:px-8 py-4 md:py-6 space-y-5 overflow-y-auto bg-slate-50/10 min-h-0">
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
                          className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden border-2 ${orderType === type.id
                              ? "bg-[#0F172A] border-[#0F172A] scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                              : `${type.bg} ${type.border} hover:border-[#D4AF37]/30 hover:shadow-lg hover:-translate-y-1`
                            }`}
                        >
                          {/* Active Background Glow */}
                          {orderType === type.id && (
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#D4AF37] to-transparent animate-pulse" />
                          )}

                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${orderType === type.id
                              ? "bg-[#D4AF37] text-[#0F172A] shadow-[0_0_20px_rgba(212,175,55,0.4)] rotate-[360deg]"
                              : `bg-white ${type.text} shadow-sm group-hover:scale-110`
                            }`}>
                            <type.icon className="w-5 h-5" />
                          </div>

                          <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors duration-500 ${orderType === type.id ? "text-[#D4AF37]" : "text-slate-600"
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

                  {/* Step 2: Info */}
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

                  {/* Step 3: Location */}
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
                              {["T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-07", "T-08", "T-09", "T-10", "T-11", "T-12", "T-13", "T-14", "T-15"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <UtensilsCrossed className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" />
                          </div>
                          {validationErrors.tableNumber && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.tableNumber}</p>}
                        </>
                      )}
                      {orderType === "Room" && (
                        <>
                          {myRooms.length === 0 ? (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
                               <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                               <div>
                                 <p className="text-xs font-bold text-rose-700">No Active Reservations</p>
                                 <p className="text-[10px] text-rose-600 mt-1">You must be checked into a room to order food to it.</p>
                               </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <select value={roomNumber} onChange={e => { setRoomNumber(e.target.value); clearError('roomNumber'); }} className={`w-full bg-slate-50/50 border-2 ${validationErrors.roomNumber ? 'border-rose-300' : 'border-slate-100'} rounded-xl px-4 py-3 text-xs font-bold outline-none appearance-none cursor-pointer text-slate-700`}>
                                <option value="">Select Your Booked Room</option>
                                {myRooms.map(r => (
                                  <option key={r._id} value={r.room?.name || 'Standard Room'}>
                                    {r.room?.name || "Room"} (Check-in: {new Date(r.checkInDate).toLocaleDateString()})
                                  </option>
                                ))}
                              </select>
                              <Building2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none" />
                            </div>
                          )}
                          {validationErrors.roomNumber && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.roomNumber}</p>}
                        </>
                      )}
                      {orderType === "Delivery" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <textarea
                                value={deliveryAddress}
                                onChange={e => { setDeliveryAddress(e.target.value); clearError('deliveryAddress'); }}
                                className="flex-1 bg-slate-50/50 border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none h-12 resize-none text-slate-700"
                                placeholder="Type your full address here..."
                              />
                              <button
                                onClick={() => autoGeocode(deliveryAddress)}
                                disabled={isSearchingAddress}
                                className="w-16 h-12 bg-[#0F172A] text-[#D4AF37] rounded-xl flex flex-col items-center justify-center hover:bg-slate-800 transition-all shadow-md disabled:opacity-50"
                              >
                                {isSearchingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                <span className="text-[7px] font-black uppercase tracking-widest mt-1">Search</span>
                              </button>
                              <button
                                onClick={handleGetLocation}
                                className={`w-16 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-500 shadow-md group ${coordinates
                                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                              >
                                {isLocating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  coordinates ? <CheckCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4 group-hover:animate-bounce" />
                                )}
                                <span className="text-[7px] font-black uppercase tracking-widest mt-1">
                                  {isLocating ? "Wait" : "Auto"}
                                </span>
                              </button>
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider px-1">
                              * You can search your address or click "Auto". Then drag the pin below to your exact location.
                            </p>
                          </div>
                          <MapPicker coordinates={coordinates} onChange={handleMapCoordinatesChange} />
                          {coordinates && distance > 0 && (
                            <div className="mt-2 flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Est. Distance</span>
                              <span className={`text-[9px] font-black ${isDistanceTooFar ? 'text-rose-500' : 'text-[#D4AF37]'}`}>
                                {distance.toFixed(1)} km {isDistanceTooFar ? '(Too Far!)' : ''}
                              </span>
                            </div>
                          )}
                          {validationErrors.deliveryAddress && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">{validationErrors.deliveryAddress}</p>}
                          {isDistanceTooFar && <p className="text-[9px] text-rose-500 font-bold mt-1 ml-1 uppercase tracking-wider">Sorry, we only deliver within 15km.</p>}
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

                  {/* Step 5: Payment Method */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">05. Payment Method</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "Card"
                            ? "border-[#0F172A] bg-slate-50 shadow-inner"
                            : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Card"
                          checked={paymentMethod === "Card"}
                          onChange={() => setPaymentMethod("Card")}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Card' ? 'border-[#0F172A]' : 'border-slate-300'}`}>
                          {paymentMethod === 'Card' && <div className="w-2 h-2 rounded-full bg-[#0F172A]" />}
                        </div>
                        <span className={`text-sm font-bold ${paymentMethod === 'Card' ? 'text-[#0F172A]' : 'text-slate-500'}`}>
                          Pay Online
                        </span>
                      </label>
                      <label
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentMethod === "Cash"
                            ? "border-[#0F172A] bg-slate-50 shadow-inner"
                            : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Cash"
                          checked={paymentMethod === "Cash"}
                          onChange={() => setPaymentMethod("Cash")}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Cash' ? 'border-[#0F172A]' : 'border-slate-300'}`}>
                          {paymentMethod === 'Cash' && <div className="w-2 h-2 rounded-full bg-[#0F172A]" />}
                        </div>
                        <span className={`text-sm font-bold ${paymentMethod === 'Cash' ? 'text-[#0F172A]' : 'text-slate-500'}`}>
                          Pay by Cash
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 py-4 md:py-6 bg-white border-t border-slate-50 mt-auto shrink-0">
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
          </div>
        )}
      </div>
    </div>
  );
}
