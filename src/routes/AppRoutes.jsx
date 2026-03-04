// AppRoutes.jsx - Application Routes (Pure JavaScript)
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { Home } from "../pages/website/Home.jsx";
import { Rooms } from "../pages/website/Rooms.jsx";
import { Events } from "../pages/website/Events.jsx";
import { Restaurant } from "../pages/website/Restaurant.jsx";
import { About } from "../pages/website/About.jsx";
import { Contact } from "../pages/website/Contact.jsx";
import { Login } from "../pages/website/Login.jsx";
import { Register } from "../pages/website/Register.jsx";

export function AppRoutes({ isLoggedIn, user, onLogin, onRegister }) {
  const navigate = useNavigate();

  const protectedBook = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    alert(`Booking confirmed! Thank you, ${user?.name || "Guest"}. Your booking details have been saved.\n\nThis is a frontend demo. In production, this would send data to the backend API.`);
  };

  const protectedOrder = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    alert(`Order placed successfully!\n\nThank you, ${user?.name || "Guest"}.\nTotal: $${data.total.toFixed(2)}\nDelivery: ${data.delivery === "room" ? "Room Delivery" : "Pickup"}\n\nThis is a frontend demo. In production, this would send data to the backend API.`);
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms" element={<Rooms onBook={protectedBook} />} />
      <Route path="/events" element={<Events onBook={protectedBook} />} />
      <Route path="/restaurant" element={<Restaurant onOrder={protectedOrder} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={onLogin} />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Register onRegister={onRegister} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}