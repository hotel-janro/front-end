// FoodCard.jsx - Supreme Luxury Food Item Card Component
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Star, Clock } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../api";

export function FoodCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const { settings } = useSettings();

  const imageUrl = getImageUrl(item.image);

  return (
    <div className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] transition-all duration-700">
      {/* Premium Image Container */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-md text-[#0F172A] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
            {item.category || 'Specialty'}
          </span>
          <div className="flex items-center gap-1 bg-[#D4AF37] text-[#0F172A] px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
            <Star className="w-3 h-3 fill-current" /> 4.9
          </div>
        </div>

        <div className="absolute bottom-6 right-6">
          <div className="bg-white/90 backdrop-blur-md text-slate-900 px-5 py-2 rounded-2xl font-black text-lg shadow-2xl border border-white/20">
            {settings.currency.symbol}{item.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-normal text-slate-900 leading-tight group-hover:text-[#D4AF37] transition-colors duration-300" style={{ fontFamily: "DM Serif Display, serif" }}>
            {item.name}
          </h3>
        </div>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 min-h-[40px]">
          {item.description || "A culinary masterpiece crafted with the finest ingredients to tantalize your senses."}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-black text-slate-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white rounded-xl transition-all shadow-sm border border-slate-100 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { onAddToCart({ ...item, quantity }); setQuantity(1); }}
            className="flex-1 bg-[#0F172A] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 cursor-pointer flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
