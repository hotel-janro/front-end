import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; // Fixed import

// Importing Pages
import Home from "../pages/website/Home";
import Rooms from "../pages/website/Rooms";
import Events from "../pages/website/Events";
import Restaurant from "../pages/website/Restaurant";
import About from "../pages/website/About";
import Contact from "../pages/website/Contact";
import Login from "../pages/website/Login";
import Register from "../pages/website/Register";

const AppRoutes = ({ isLoggedIn, user, onLogin, onRegister }) => {
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
};

export default AppRoutes;