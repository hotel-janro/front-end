<<<<<<< HEAD
import React from 'react';

/**
 * Button Component
 * A premium, reusable button component following the Hotel Janro "Compact Luxury" design language.
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";

  const variants = {
    primary: "bg-[#D4AF37] text-[#0F172A] hover:bg-white hover:text-[#0F172A] shadow-[0_10px_20px_-5px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)]",
    secondary: "bg-[#0F172A] text-white border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] shadow-xl",
    outline: "bg-transparent border border-slate-200 text-slate-600 hover:border-[#0F172A] hover:text-[#0F172A]",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
=======
// Button.jsx - Reusable Button Component (Pure JavaScript)
import React from "react";

export function Button({ children, variant = "primary", className = "", onClick, type = "button", disabled = false }) {
  const base = "px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-[#D4AF37] text-[#0F172A] hover:bg-[#c4a030] hover:shadow-lg",
    secondary: "bg-[#1E3A8A] text-white hover:bg-[#0F172A] hover:shadow-lg",
    outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F172A]",
    white: "bg-white text-[#0F172A] hover:bg-gray-100 hover:shadow-lg",
    ghost: "text-[#D4AF37] hover:bg-[#D4AF37]/10",
>>>>>>> edb44e2740fcb3c9675d4c44778a683fa754eeb4
  };

  return (
    <button
      type={type}
<<<<<<< HEAD
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};
=======
      className={`${base} ${variants[variant] || variants.primary} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
>>>>>>> edb44e2740fcb3c9675d4c44778a683fa754eeb4
