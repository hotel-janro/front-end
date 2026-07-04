// FoodCard.jsx - Supreme Luxury Food Item Card Component
import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Star, Clock } from "lucide-react";
import { ImageWithFallback } from "../common/ImageWithFallback.jsx";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../api";

export function FoodCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPortion, setSelectedPortion] = useState(
    item.hasPortions && item.portions?.length > 0 ? item.portions[0].portionType : ''
  );
  const { settings } = useSettings();

  const imageUrl = getImageUrl(item.image);

  const currentPrice = item.hasPortions 
    ? (item.portions.find(p => p.portionType === selectedPortion)?.price || 0)
    : item.price;

  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-[0_30px_70px_-15px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/30 transition-all duration-700 hover:-translate-y-1.5">
      {/* Premium Image Container */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.8s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Floating Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          <div className="bg-white/90 backdrop-blur-md text-[#0F172A] px-4.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.18em] shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-white/20">
            {item.category || 'Specialty'}
          </div>
          <div className="flex items-center gap-1 bg-[#D4AF37] text-[#0F172A] px-3.5 py-1.5 rounded-full text-[8px] font-black shadow-[0_8px_20px_rgba(212,175,55,0.15)] border border-[#D4AF37]/10">
            <Star className="w-2.5 h-2.5 fill-[#0F172A] text-transparent" /> 4.9
          </div>
        </div>

        <div className="absolute bottom-5 right-5 z-10">
          <div className="bg-slate-950/90 backdrop-blur-md text-[#D4AF37] px-4.5 py-2.5 rounded-2xl font-black text-lg shadow-2xl border border-white/10 group-hover:bg-[#D4AF37] group-hover:text-[#0F172A] group-hover:border-[#D4AF37] transition-all duration-500">
            {settings.currency.symbol}{Number(currentPrice).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2.5">
          <h3 className="text-xl font-normal text-[#0F172A] leading-tight group-hover:text-[#D4AF37] transition-colors duration-300" style={{ fontFamily: "DM Serif Display, serif" }}>
            {item.name}
          </h3>
        </div>
        
        <p className="text-slate-500 text-[11px] leading-relaxed mb-5 line-clamp-2 min-h-[32px]">
          {item.description || "A culinary masterpiece crafted with the finest ingredients to tantalize your senses."}
        </p>

        {/* Portion Selector */}
        {item.hasPortions && item.portions?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
            {item.portions.map(p => (
              <button
                key={p.portionType}
                onClick={() => setSelectedPortion(p.portionType)}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  selectedPortion === p.portionType
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F172A] shadow-[0_8px_20px_rgba(212,175,55,0.2)] scale-[1.02]' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-[#D4AF37] hover:bg-slate-100/50 hover:text-[#0F172A]'
                }`}
              >
                {p.portionType}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100/80">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 hover:bg-[#0F172A] hover:text-[#D4AF37] hover:border-transparent rounded-lg transition-all shadow-sm border border-slate-100 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm font-black text-slate-950 w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 hover:bg-[#0F172A] hover:text-[#D4AF37] hover:border-transparent rounded-lg transition-all shadow-sm border border-slate-100 cursor-pointer"
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
            className="flex-1 bg-[#0F172A] text-[#D4AF37] border border-transparent py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-[#0F172A] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_25px_rgba(212,175,55,0.3)] cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}
