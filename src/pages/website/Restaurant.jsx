// Restaurant.jsx - Restaurant Page (Updated with API Integration)
import React, { useState, useEffect } from "react";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ShoppingCart, X, Truck, Building2, Loader2 } from "lucide-react";
import { apiFetch } from "../../api.js";
import { toast } from "sonner";

export function Restaurant({ onOrder }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [delivery, setDelivery] = useState("room");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await apiFetch("/menu?limit=50");
        const items = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
        setMenuItems(items);
      } catch (err) {
        toast.error(err.message || "Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ["All", ...new Set(menuItems.map((item) => item.category).filter(Boolean))];

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + (item.quantity || 1) } : c);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c._id !== id));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        orderType: delivery === "room" ? "Room" : "Delivery",
        items: cart.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: delivery === "room" ? "Room Delivery" : "Pickup",
      };

      const result = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      toast.success("Order placed successfully!");
      setCart([]);
      setShowCart(false);
      if (onOrder) onOrder(result);
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Culinary Excellence</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Restaurant
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Savor extraordinary flavors crafted by our world-class chefs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#1E3A8A] text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-gray-500">Loading delicious dishes...</p>
          </div>
        ) : (
          filteredItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No menu items available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {filteredItems.map((item) => (
                <FoodCard key={item._id} item={item} onAddToCart={addToCart} />
              ))}
            </div>
          )
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-[#D4AF37] text-[#0F172A] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-110 transition-transform cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-[#1E3A8A] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                <h2 className="text-[#0F172A] text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>Your Order</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#1E3A8A] font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">Delivery Option</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDelivery("room")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-all cursor-pointer ${
                        delivery === "room" ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F172A]" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Truck className="w-4 h-4" /> Room Delivery
                    </button>
                    <button
                      onClick={() => setDelivery("pickup")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-all cursor-pointer ${
                        delivery === "pickup" ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F172A]" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Pickup
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total (Excl. Tax)</span>
                    <span className="text-2xl text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full py-4 text-lg"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </Button>
                  <p className="text-[10px] text-gray-400 mt-3 text-center">
                    * 10% tax will be added to the final bill.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
