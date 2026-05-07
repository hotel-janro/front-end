import React, { useState } from "react";
import { Link } from "react-router";
import { CreditCard, Truck, Home, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";

export function Checkout() {
  const [method, setMethod] = useState("card");
  const [delivery, setDelivery] = useState("room");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 2000);
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
            <Link to="/my-bookings">
              <Button variant="secondary" className="w-full">Track Order</Button>
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
                  <span className="font-medium">Credit / Debit Card</span>
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

              {method === "card" && (
                <div className="mt-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="col-span-2">
                    <input type="text" placeholder="Card Number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" />
                  </div>
                  <input type="text" placeholder="MM/YY" className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" />
                  <input type="text" placeholder="CVV" className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none" />
                </div>
              )}
            </section>
          </div>

          {/* Right Column Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Cart Total</span>
                  <span>$42.50</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <span className="text-lg font-bold">Payable Amount</span>
                  <span className="text-2xl font-bold text-[#1E3A8A]">$42.50</span>
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full !py-4" isLoading={loading}>
                Place Order Now
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
