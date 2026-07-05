import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";

export function Cart() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("janro_cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("janro_cart", JSON.stringify(items));
  }, [items]);

  const updateQuantity = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Looks like you haven't added anything to your cart yet. Explore our restaurant menu!
        </p>
        <Link to="/restaurant">
          <Button variant="secondary" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-8 flex items-center gap-3">
          <ShoppingBag className="text-[#D4AF37]" />
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex gap-4 sm:gap-6">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-100"
                />
                
                <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A]">{item.name}</h3>
                    <p className="text-[#D4AF37] font-semibold mt-1">Rs {item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-500" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-[#1E3A8A]">Rs {(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (10%)</span>
                  <span>Rs {tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#1E3A8A]">Rs {total.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button variant="secondary" className="w-full !py-4 flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <p className="text-center text-xs text-gray-400 mt-6">
                Free delivery for in-room orders or hotel guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
