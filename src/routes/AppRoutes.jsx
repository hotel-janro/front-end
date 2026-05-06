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
import { Profile } from "../pages/dashboard/customerDashboard/Profile.jsx";
import { MyBookings } from "../pages/dashboard/customerDashboard/MyBookings.jsx";
import { MyOrders } from "../pages/dashboard/customerDashboard/MyOrders.jsx";
import { AdminDashboard } from "../pages/dashboard/adminDashboard/AdminDashboard.jsx";
import { AdminPool } from "../pages/dashboard/adminDashboard/AdminPool.jsx";
import { AdminStaff } from "../pages/dashboard/adminDashboard/AdminStaff.jsx";
import { AdminSettings } from "../pages/dashboard/adminDashboard/AdminSettings.jsx";
import { ReceptionDashboard } from "../pages/dashboard/receptionDashboard/ReceptionDashbord.jsx";
import { ReceptionPool } from "../pages/dashboard/receptionDashboard/ReciptionPool.jsx";
import { CashierDashboard } from "../pages/dashboard/cashierDashboard/CashierDashbord.jsx";
import { Cart } from "../pages/website/Cart.jsx";
import { Checkout } from "../pages/website/Checkout.jsx";

export function AppRoutes({ isLoggedIn, user, onLogin, onRegister, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isReception = user?.role === "reception" || user?.role === "receptionist";
  const isCashier = user?.role === "cashier";
  const isCustomer = user?.role === "customer";
  
  const postAuthPath = isAdmin ? "/admin" : isReception ? "/reception" : isCashier ? "/cashier" : "/";

  const protectedBook = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    alert(`Booking confirmed! Thank you, ${user?.name || "Guest"}.`);
  };

  const protectedOrder = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    alert(`Order placed successfully!\n\nThank you, ${user?.name || "Guest"}.`);
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms" element={<Rooms onBook={protectedBook} isLoggedIn={isLoggedIn} />} />
      <Route path="/events" element={<Events onBook={protectedBook} />} />
      <Route path="/restaurant" element={<Restaurant onOrder={protectedOrder} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Login onLogin={onLogin} />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Register onRegister={onRegister} />}
      />

      {/* Customer Management Routes (Website Style) */}
      <Route path="/my-bookings" element={isLoggedIn ? <MyBookings /> : <Navigate to="/login" replace />} />
      <Route path="/my-bookings/profile" element={isLoggedIn ? <Profile user={user} /> : <Navigate to="/login" replace />} />
      <Route path="/my-orders" element={isLoggedIn ? <MyOrders /> : <Navigate to="/login" replace />} />

      {/* Admin Panel (Simplified for Website Style) */}
      <Route
        path="/admin"
        element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />}
      />
      <Route path="/admin/pool" element={isLoggedIn && isAdmin ? <AdminPool /> : <Navigate to="/login" replace />} />
      <Route path="/admin/staff" element={isLoggedIn && isAdmin ? <AdminStaff /> : <Navigate to="/login" replace />} />
      <Route path="/admin/settings" element={isLoggedIn && isAdmin ? <AdminSettings /> : <Navigate to="/login" replace />} />

      {/* Reception & Cashier */}
      <Route
        path="/reception"
        element={isLoggedIn && isReception ? <ReceptionDashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/cashier"
        element={isLoggedIn && isCashier ? <CashierDashboard /> : <Navigate to="/login" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}