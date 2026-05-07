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
import { AdminRestaurant } from "../pages/dashboard/adminDashboard/AdminResturant.jsx";
import { AdminPOS } from "../pages/dashboard/adminDashboard/AdminPos.jsx";
import { AdminReports } from "../pages/dashboard/adminDashboard/AdminReports.jsx";
import { AdminPayments } from "../pages/dashboard/adminDashboard/AdminPayemnts.jsx";
import { AdminPool } from "../pages/dashboard/adminDashboard/AdminPool.jsx";
import { AdminStaff } from "../pages/dashboard/adminDashboard/AdminStaff.jsx";
import { AdminSettings } from "../pages/dashboard/adminDashboard/AdminSettings.jsx";
import { AdminRooms } from "../pages/dashboard/adminDashboard/AdminRooms.jsx";
import { AdminBookings } from "../pages/dashboard/adminDashboard/AdminBooking.jsx";
import { AdminGuests } from "../pages/dashboard/adminDashboard/AdminGuests.jsx";
import { AdminWedding } from "../pages/dashboard/adminDashboard/AdminWeddings.jsx";
import { ReceptionDashboard } from "../pages/dashboard/receptionDashboard/ReceptionDashbord.jsx";
import { ReceptionPool } from "../pages/dashboard/receptionDashboard/ReciptionPool.jsx";
import { ReceptionLayout } from "../pages/dashboard/ReceptionLayout.jsx";
import { CashierDashboard } from "../pages/dashboard/cashierDashboard/CashierDashbord.jsx";
import { CashierLayout } from "../pages/dashboard/CashierLayout.jsx";


export function AppRoutes({ isLoggedIn, user, onLogin, onRegister, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isReception = user?.role === "reception";
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
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="pool" element={<AdminPool />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="guests" element={<AdminGuests />} /> 
        <Route path="events" element={<AdminWedding />} /> 
        <Route path="restaurant" element={<AdminRestaurant />} />
        <Route path="orders" element={<AdminPOS />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>

      <Route
        path="/reception"
        element={isLoggedIn && isReception ? <ReceptionLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<ReceptionDashboard />} />
        <Route path="pool" element={<ReceptionPool />} />
      </Route>

      <Route
        path="/cashier"
        element={isLoggedIn && isCashier ? <CashierLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<CashierDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}