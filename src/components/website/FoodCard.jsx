// FoodCard.jsx - Food Item Card Component (Pure JavaScript)
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";

export function FoodCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const { settings } = useSettings();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100">
      <div className="relative overflow-hidden h-48">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0F172A] px-3 py-1 rounded-full text-sm">
          {settings.currency.symbol} {item.price.toFixed(2)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-[#0F172A] mb-1" style={{ fontFamily: "DM Serif Display, serif" }}>
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-lg px-3 py-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-[#1E3A8A] hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-[#1E3A8A] hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="secondary"
            className="!px-4 !py-2 text-sm"
            onClick={() => { onAddToCart({ ...item, quantity }); setQuantity(1); }}
          >
            <ShoppingCart className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
