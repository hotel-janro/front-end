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
import { DashboardLayout } from "../pages/dashboard/DashboardLayout.jsx";
import { AdminDashboard } from "../pages/dashboard/adminDashboard/AdminDashboard.jsx";
import { AdminPool } from "../pages/dashboard/adminDashboard/AdminPool.jsx";
import { AdminStaff } from "../pages/dashboard/adminDashboard/AdminStaff.jsx";
import { AdminSettings } from "../pages/dashboard/adminDashboard/AdminSettings.jsx";
import { ReceptionDashboard } from "../pages/dashboard/receptionDashboard/ReceptionDashbord.jsx";
import { ReceptionPool } from "../pages/dashboard/receptionDashboard/ReciptionPool.jsx";
import { CashierDashboard } from "../pages/dashboard/cashierDashboard/CashierDashbord.jsx";

export function AppRoutes({ isLoggedIn, user, onLogin, onRegister, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isReception = user?.role === "reception" || user?.role === "receptionist";
  const isCashier = user?.role === "cashier";
  const postAuthPath = isAdmin ? "/admin" : isReception ? "/reception" : isCashier ? "/cashier" : "/";

  const protectedBook = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (data?.room) {
      const decorationText = data.decorationItems?.length
        ? `\nHoneymoon decorations: ${data.decorationItems.join(", ")}`
        : "";

      alert(`Booking confirmed! Thank you, ${user?.name || "Guest"}.\n\nRoom: ${data.room.name}\nGuests: ${data.guests}${decorationText}\n\nThis is a frontend demo. In production, this would send data to the backend API.`);
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
      <Route path="/rooms" element={<Rooms onBook={protectedBook} isLoggedIn={isLoggedIn} />} />
      <Route path="/events" element={<Events onBook={protectedBook} />} />
      <Route path="/restaurant" element={<Restaurant onOrder={protectedOrder} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Login onLogin={onLogin} />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Register onRegister={onRegister} />}
      />
      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={isLoggedIn && isAdmin ? <DashboardLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pool" element={<AdminPool />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route
        path="/reception"
        element={isLoggedIn && isReception ? <ReceptionDashboard /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/reception/pool"
        element={isLoggedIn && isReception ? <ReceptionPool /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/cashier"
        element={isLoggedIn && isCashier ? <CashierDashboard /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}