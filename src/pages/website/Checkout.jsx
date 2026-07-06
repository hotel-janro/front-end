import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Truck, Home, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { apiFetch } from "../../api.js";
import { useSettings } from "../../context/SettingsContext.jsx";
import { toast } from "sonner";

export function Checkout() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [method, setMethod] = useState("card");
  const [delivery, setDelivery] = useState("room");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("janro_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const currencySymbol = settings.currency?.symbol || "Rs.";

  // Sync cart items with actual backend menu items to avoid casting/foreign key validation errors
  useEffect(() => {
    const fetchRealItems = async () => {
      try {
        const menuData = await apiFetch("/menu");
        if (menuData && menuData.length > 0) {
          const updatedItems = cartItems.map((item, idx) => {
            // Swap numeric mock IDs (like 1 or 2) with real MongoDB ObjectIds
            if (typeof item.id === "number" || item.id === 1 || item.id === 2) {
              const realItem = menuData[idx % menuData.length];
              return {
                ...item,
                _id: realItem._id,
                name: realItem.name,
                price: realItem.price,
                quantity: item.quantity
              };
            }
            return item;
          });
          setCartItems(updatedItems);
          localStorage.setItem("janro_cart", JSON.stringify(updatedItems));
        }
      } catch (err) {
        console.error("Failed to load real menu items for validation:", err);
      }
    };
    fetchRealItems();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Track an existing unpaid order so we don't create duplicates on PayHere retry
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const launchPayHere = async (orderId, totalAmount) => {
    const user = JSON.parse(localStorage.getItem("janro_user") || "null");

    const hashRes = await apiFetch("/payments/payhere-hash", {
      method: "POST",
      body: JSON.stringify({
        orderId: orderId,
        amount: totalAmount
      })
    });

    if (!hashRes || !hashRes.success) {
      throw new Error(hashRes?.message || "Failed to generate payment signature hash");
    }

    const { merchantId, currency, hash, amount } = hashRes.data;

    const payment = {
      sandbox: true,
      merchant_id: merchantId,
      return_url: `${window.location.origin}/my-orders`,
      cancel_url: `${window.location.origin}/checkout`,
      notify_url: `${API_BASE}/api/payments/payhere-notify`,
      order_id: orderId,
      items: `Hotel Food Order`,
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

    window.payhere.onCompleted = async function onCompleted(completedOrderId) {
      try {
        await apiFetch(`/orders/${orderId}`, {
          method: "PUT",
          body: JSON.stringify({ paymentStatus: "Paid", orderStatus: "Completed" })
        });
        localStorage.removeItem("janro_cart");
        setPendingOrderId(null);
        setIsSuccess(true);
        toast.success("Payment completed successfully!");
      } catch (err) {
        console.error("Local status update failed:", err);
      } finally {
        setLoading(false);
      }
    };

    window.payhere.onDismissed = async function onDismissed() {
      setLoading(false);
      try {
        await apiFetch(`/orders/${orderId}/abandon`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to abandon order:", err);
      }
      setPendingOrderId(null);
      toast.info("Payment cancelled. You can retry anytime with a new order.");
    };

    window.payhere.onError = async function onError(error) {
      setLoading(false);
      try {
        await apiFetch(`/orders/${orderId}/abandon`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to abandon order:", err);
      }
      setPendingOrderId(null);
      toast.error(`Payment failed: ${error}`);
    };

    window.payhere.startPayment(payment);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (delivery === "room" && !selectedRoom) {
      toast.error("Please choose a room number");
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("janro_user") || "null");

      if (method === "card" && pendingOrderId) {
        // Reuse existing unpaid order — just re-open PayHere
        await launchPayHere(pendingOrderId, total);
        return;
      }

      // Create a new Order in MongoDB (Unpaid initially)
      const orderPayload = {
        orderType: delivery === "room" ? "Room" : "Take-away",
        roomNumber: delivery === "room" ? selectedRoom : undefined,
        items: cartItems.map(item => ({
          menuItemId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal,
        tax,
        totalAmount: total,
        paymentMethod: method === "card" ? "Card" : "Cash",
        paymentStatus: "Unpaid",
        customerName: user?.name || "Guest User",
        customerUser: user?.id || user?._id || undefined
      };

      const order = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload)
      });

      if (!order || !order._id) {
        throw new Error(order?.message || "Failed to create order on the server");
      }

      if (method === "cash") {
        // Direct Cash checkout
        localStorage.removeItem("janro_cart");
        setLoading(false);
        setIsSuccess(true);
        toast.success("Order placed successfully");
      } else {
        // Card flow — save order ID for retry and launch PayHere
        setPendingOrderId(order._id);
        await launchPayHere(order._id, total);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "An error occurred during checkout");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for your order. Your food will be delivered shortly to your room.
          </p>
          <div className="space-y-3">
            <Link to="/my-orders">
              <Button variant="secondary" className="w-full">Track Orders</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-[#D4AF37]" />
                Delivery Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDelivery("room")}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    delivery === "room" ? "border-[#D4AF37] bg-amber-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-3 rounded-lg ${delivery === "room" ? "bg-white" : "bg-gray-50"}`}>
                    <Home className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="font-bold">Room Delivery</p>
                    <p className="text-xs text-gray-500">To your hotel room</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDelivery("pickup")}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    delivery === "pickup" ? "border-[#D4AF37] bg-amber-50" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className={`p-3 rounded-lg ${delivery === "pickup" ? "bg-white" : "bg-gray-50"}`}>
                    <MapPin className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <p className="font-bold">Restaurant Pickup</p>
                    <p className="text-xs text-gray-500">Pick it up yourself</p>
                  </div>
                </button>
              </div>
            </section>

            {/* Room Selection */}
            {delivery === "room" && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Home className="text-[#D4AF37]" />
                  Select Your Room
                </h2>
                <select 
                  required
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-700 appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5em' }}
                >
                  <option value="">Choose Room Number</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={`${i + 1}`}>Room {i + 1}</option>
                  ))}
                </select>
              </section>
            )}

            {/* Payment Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-[#D4AF37]" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={method === "card"} 
                    onChange={() => setMethod("card")}
                    className="w-5 h-5 accent-[#1E3A8A]"
                  />
                  <span className="font-medium">Credit / Debit Card (PayHere Sandbox)</span>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={method === "cash"} 
                    onChange={() => setMethod("cash")}
                    className="w-5 h-5 accent-[#1E3A8A]"
                  />
                  <span className="font-medium">Pay at Room (Cash)</span>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxes (10%)</span>
                  <span>{currencySymbol} {tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <span className="text-lg font-bold">Payable Amount</span>
                  <span className="text-2xl font-bold text-[#1E3A8A]">{currencySymbol} {total.toFixed(2)}</span>
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full !py-4" isLoading={loading}>
                {method === "card" ? "Pay & Place Order" : "Place Order Now"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
