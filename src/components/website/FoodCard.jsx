// FoodCard.jsx - Supreme Luxury Food Item Card Component
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Star, Clock } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../api";

export function FoodCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState('Full');
  const { settings } = useSettings();

  const imageUrl = getImageUrl(item.image);

  const currentPrice = item.hasPortions 
    ? (item.portions.find(p => p.portionType === selectedPortion)?.price || 0)
    : item.price;

  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] transition-all duration-700 hover:-translate-y-1">
      {/* Premium Image Container */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Floating Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md text-[#0F172A] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] shadow-xl border border-white/20">
            {item.category || 'Specialty'}
          </div>
          <div className="flex items-center gap-1.5 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-[8px] font-black shadow-lg">
            <Star className="w-2.5 h-2.5 fill-current" /> 4.9
          </div>
        </div>

        <div className="absolute bottom-5 right-5">
          <div className="bg-[#0F172A]/90 backdrop-blur-md text-[#D4AF37] px-4 py-2 rounded-xl font-black text-lg shadow-xl border border-white/10 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-500">
            {settings.currency.symbol}{Number(currentPrice).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-normal text-slate-900 leading-tight group-hover:text-[#D4AF37] transition-colors duration-300" style={{ fontFamily: "DM Serif Display, serif" }}>
            {item.name}
          </h3>
        </div>
        
        <p className="text-slate-500 text-[11px] leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
          {item.description || "A culinary masterpiece crafted with the finest ingredients to tantalize your senses."}
        </p>

        {/* Portion Selector */}
        {item.hasPortions && (
          <div className="flex gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            {['Full', 'Half'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPortion(p)}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  selectedPortion === p 
                    ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#D4AF37]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white rounded-lg transition-all shadow-sm border border-slate-100 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-black text-slate-900 w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 hover:bg-[#D4AF37] hover:text-white rounded-lg transition-all shadow-sm border border-slate-100 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => { 
              onAddToCart({ 
                ...item, 
                quantity, 
                price: currentPrice, 
                portion: item.hasPortions ? selectedPortion : '' 
              }); 
              setQuantity(1); 
            }}
            className="flex-1 bg-[#0F172A] text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.1em] hover:bg-[#D4AF37] hover:scale-[1.02] active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}
