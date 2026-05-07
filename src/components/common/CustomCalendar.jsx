import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CustomCalendar({ selectedDate, onDateSelect, bookedDates = [], onMonthChange }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  // Whenever the month changes, notify parent
  useEffect(() => {
    onMonthChange(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }, [currentMonth.getFullYear(), currentMonth.getMonth()]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to YYYY-MM-DD
    const dateStr = newDate.toLocaleDateString("en-CA");
    onDateSelect(dateStr);
  };

  // Helper to pad month/day
  const pad = (n) => (n < 10 ? "0" + n : n);

  const renderDays = () => {
    const days = [];
    
    // Empty slots for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${pad(currentMonth.getMonth() + 1)}-${pad(d)}`;
      const isSelected = selectedDate === dateStr;
      
      const bookedInfo = bookedDates.find(bd => bd.date === dateStr);
      const isFullyBooked = bookedInfo && bookedInfo.bookedVenuesCount >= 6; // Assuming 6 total venues
      const isPartiallyBooked = bookedInfo && bookedInfo.bookedVenuesCount > 0 && bookedInfo.bookedVenuesCount < 6;

      // Determine date state
      const todayStr = new Date().toLocaleDateString("en-CA");
      const isPast = dateStr < todayStr;
      
      let btnClasses = "relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer ";
      
      if (isPast) {
         btnClasses += "text-gray-300 cursor-not-allowed opacity-50";
      } else if (isFullyBooked) {
         btnClasses += "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60";
      } else if (isSelected) {
         btnClasses += "bg-[#0F172A] text-[#D4AF37] shadow-lg scale-110";
      } else {
         btnClasses += "text-[#0F172A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]";
      }

      days.push(
        <button
          key={d}
          disabled={isPast || isFullyBooked}
          onClick={() => handleDateClick(d)}
          className={btnClasses}
          title={isFullyBooked ? "Fully Booked" : isPartiallyBooked ? "Some Venues Booked" : "Available"}
        >
          {d}
          {/* Indicator dots */}
          {isPartiallyBooked && !isSelected && !isPast && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D4AF37]"></span>
          )}
          {isFullyBooked && !isPast && (
            <span className="absolute bottom-1 w-full border-t border-gray-400 transform -rotate-45"></span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm mx-auto select-none">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-[#0F172A] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-[#0F172A] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {dayNames.map(day => (
          <div key={day} className="text-xs font-bold text-gray-400 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 place-items-center">
        {renderDays()}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-6 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
           Partially Booked
         </div>
         <div className="flex items-center gap-1.5 relative">
           <span className="w-2 h-2 rounded-full border border-gray-400 relative overflow-hidden flex items-center justify-center">
             <span className="w-full h-[1px] bg-gray-400 transform -rotate-45 absolute"></span>
           </span>
           Fully Booked
         </div>
      </div>
    </div>
  );
}
