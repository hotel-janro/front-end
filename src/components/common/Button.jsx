import React from "react";

const Button = ({ children, variant = "primary", className = "", onClick, type = "button", disabled = false }) => {
  const base = "px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-[#D4AF37] text-[#0F172A] hover:bg-[#c4a030] hover:shadow-lg",
    secondary: "bg-[#1E3A8A] text-white hover:bg-[#0F172A] hover:shadow-lg",
    outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F172A]",
    white: "bg-white text-[#0F172A] hover:bg-gray-100 hover:shadow-lg",
    ghost: "text-[#D4AF37] hover:bg-[#D4AF37]/10",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;