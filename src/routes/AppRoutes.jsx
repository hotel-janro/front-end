// AppRoutes.jsx - Application Routes 
import React, { useState } from "react";
import { apiFetch } from "../api";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Home } from "../pages/website/Home.jsx";
import { Rooms } from "../pages/website/Rooms.jsx";
import { Events } from "../pages/website/Events.jsx";
import { Restaurant } from "../pages/website/Restaurant.jsx";
import { About } from "../pages/website/About.jsx";
import { Contact } from "../pages/website/Contact.jsx";
import { Login } from "../pages/website/Login.jsx";
import { Register } from "../pages/website/Register.jsx";
import { Cart } from "../pages/website/Cart.jsx";
import { Checkout } from "../pages/website/Checkout.jsx";
import { Profile } from "../pages/dashboard/customerDashboard/Profile.jsx";
import { MyBookings } from "../pages/dashboard/customerDashboard/MyBookings.jsx";
import { MyOrders } from "../pages/dashboard/customerDashboard/MyOrders.jsx";
import { DashboardLayout } from "../pages/dashboard/DashboardLayout.jsx";
import { AdminDashboard } from "../pages/dashboard/adminDashboard/AdminDashboard.jsx";
import { AdminRooms } from "../pages/dashboard/adminDashboard/AdminRooms.jsx";
import { AdminRestaurant } from "../pages/dashboard/adminDashboard/AdminRestaurant.jsx";
import { AdminPOS } from "../pages/dashboard/adminDashboard/AdminPos.jsx";
import { AdminReports } from "../pages/dashboard/adminDashboard/AdminReports.jsx";
import { AdminPayments } from "../pages/dashboard/adminDashboard/AdminPayments.jsx";
import { AdminPool } from "../pages/dashboard/adminDashboard/AdminPool.jsx";
import { AdminGym } from "../pages/dashboard/adminDashboard/AdminGym.jsx";
import { AdminStaff } from "../pages/dashboard/adminDashboard/AdminStaff.jsx";
import { AdminSettings } from "../pages/dashboard/adminDashboard/AdminSettings.jsx";
import { AdminBookings } from "../pages/dashboard/adminDashboard/AdminBooking.jsx";
import { AdminGuests } from "../pages/dashboard/adminDashboard/AdminGuests.jsx";
import { AdminWedding } from "../pages/dashboard/adminDashboard/AdminWeddings.jsx";
import { AdminInventory } from "../pages/dashboard/adminDashboard/AdminInventory.jsx";
import { AdminMessages } from "../pages/dashboard/adminDashboard/AdminMessages.jsx";

import { ReceptionDashboard } from "../pages/dashboard/receptionDashboard/ReceptionDashboard.jsx";
import { ReceptionPool } from "../pages/dashboard/receptionDashboard/ReciptionPool.jsx";
import { ReceptionGym } from "../pages/dashboard/receptionDashboard/ReceptionGym.jsx";
import { ReceptionBookings } from "../pages/dashboard/receptionDashboard/ReceptionBookings.jsx";
import { ReceptionRooms } from "../pages/dashboard/receptionDashboard/ReceptionRooms.jsx";
import { ReceptionWedding } from "../pages/dashboard/receptionDashboard/ReceptionWedding.jsx";
import { ReceptionProfile } from "../pages/dashboard/receptionDashboard/ReceptionProfile.jsx";
import { ReceptionLayout } from "../pages/dashboard/ReceptionLayout.jsx";
import { CashierDashboard } from "../pages/dashboard/cashierDashboard/CashierDashbord.jsx";
import { CashierOrders } from "../pages/dashboard/cashierDashboard/CashierOrders.jsx";
import { CashierPayments } from "../pages/dashboard/cashierDashboard/CashierPayments.jsx";
import { CashierReceipts } from "../pages/dashboard/cashierDashboard/CashierReceipts.jsx";
import { CashierProfile } from "../pages/dashboard/cashierDashboard/CashierProfile.jsx";
import { CashierLayout } from "../pages/dashboard/CashierLayout.jsx";
import { ForgotPassword } from "../pages/website/ForgotPassword.jsx";
import { ResetPassword } from "../pages/website/ResetPassword.jsx";

export function AppRoutes({ isLoggedIn, user, onLogin, onVerify2FA, onRegister, onLogout, onGoogleLogin, onUpdateUser }) {
  const navigate = useNavigate();
  const roleLower = user?.role?.toLowerCase().trim();
  const isAdmin = roleLower === "admin";
  const isReception = roleLower === "reception" || roleLower === "receptionist";
  const isCashier = roleLower === "cashier";
  const isCustomer = roleLower === "customer";

  const postAuthPath = isAdmin ? "/admin" : isReception ? "/reception" : isCashier ? "/cashier" : "/";

  const [bookingSuccess, setBookingSuccess] = useState(null); // { name, roomName, guests }

  const protectedBook = async (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (data?.room) {
      try {
        const response = await apiFetch("/bookings", {
          method: "POST",
          body: JSON.stringify({
            roomId: data.room._id,
            roomNumber: data.roomNumber,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            guests: data.guests,
            fullName: data.fullName || user?.name,
            email: data.email || user?.email,
            phone: data.phone || user?.phone || "N/A",
            specialRequests: data.specialRequests || "",
            decorationItems: data.decorationItems || [],
            checkInType: data.checkInType || 'Day',
            checkOutType: data.checkOutType || 'Night',
            stayMode: data.stayMode || 'custom'
          })
        });

        if (response.success) {
          const decorationText = data.decorationItems?.length
            ? data.decorationItems.join(", ")
            : null;

          setBookingSuccess({
            name: user?.name || "Guest",
            roomName: data.room.name,
            guests: data.guests,
            decorations: decorationText
          });
          
          // Refresh room counts after short delay
          setTimeout(() => window.location.reload(), 3000);
        }
      } catch (error) {
        alert(`Booking failed: ${error.message}`);
      }
      return;
    }
    setBookingSuccess({ name: user?.name || "Guest", roomName: null, guests: null, decorations: null });
  };

  const protectedOrder = (data) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const total = Number(data?.totalAmount || data?.total || 0);
    const orderType = data?.orderType || "Dine-in";
    alert(`Order placed successfully!\n\nThank you, ${user?.name || "Guest"}.\nTotal: Rs ${total.toLocaleString()}\nType: ${orderType}\n\nOur kitchen has received your order and is preparing it now.`);
  };

  return (
    <>
      {bookingSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" style={{ animation: 'fadeInScale 0.3s ease' }}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-4">Thank you, <span className="font-semibold text-gray-800">{bookingSuccess.name}</span></p>
            {bookingSuccess.roomName && (
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Room</span>
                  <span className="font-medium text-gray-800">{bookingSuccess.roomName}</span>
                </div>
                {bookingSuccess.guests && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium text-gray-800">{bookingSuccess.guests}</span>
                  </div>
                )}
                {bookingSuccess.decorations && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Decorations</span>
                    <span className="font-medium text-gray-800">{bookingSuccess.decorations}</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #0F172A, #1e293b)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeInScale { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms" element={<Rooms onBook={protectedBook} isLoggedIn={isLoggedIn} />} />
      <Route path="/events" element={<Events onBook={protectedBook} isLoggedIn={isLoggedIn} user={user} />} />
      <Route path="/restaurant" element={<Restaurant onOrder={protectedOrder} user={user} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/forgot-password" element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <ForgotPassword />} />
      <Route path="/reset-password/:token" element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <ResetPassword />} />

      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Login onLogin={onLogin} onVerify2FA={onVerify2FA} onGoogleLogin={onGoogleLogin} />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to={postAuthPath} replace /> : <Register onRegister={onRegister} onGoogleLogin={onGoogleLogin} />}
      />

      {/* Customer Management Routes (Website Style) */}
      <Route path="/my-bookings" element={isLoggedIn ? <MyBookings /> : <Navigate to="/login" replace />} />
      <Route path="/my-bookings/profile" element={isLoggedIn ? <Profile user={user} /> : <Navigate to="/login" replace />} />
      <Route path="/my-orders" element={isLoggedIn ? <MyOrders /> : <Navigate to="/login" replace />} />

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={isLoggedIn && isAdmin ? <DashboardLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="pool" element={<AdminPool />} />
        <Route path="gym" element={<AdminGym />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="guests" element={<AdminGuests />} />
        <Route path="events" element={<AdminWedding />} />
        <Route path="restaurant" element={<AdminRestaurant />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      {/* Reception & Cashier */}
      <Route
        path="/reception"
        element={isLoggedIn && isReception ? <ReceptionLayout user={user} onLogout={onLogout} onUpdateUser={onUpdateUser} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<ReceptionDashboard />} />
        <Route path="rooms" element={<ReceptionRooms isLoggedIn={isLoggedIn} onBook={protectedBook} />} />
        <Route path="wedding" element={<ReceptionWedding />} />
        <Route path="bookings" element={<ReceptionBookings />} />
        <Route path="pool" element={<ReceptionPool />} />
        <Route path="gym" element={<ReceptionGym />} />
        <Route path="customers" element={<AdminGuests />} />
      </Route>

      <Route
        path="/cashier"
        element={isLoggedIn && isCashier ? <CashierLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<CashierDashboard />} />
        <Route path="orders" element={<CashierOrders />} />
        <Route path="payments" element={<CashierPayments />} />
        <Route path="receipts" element={<CashierReceipts />} />
        <Route path="profile" element={<CashierProfile />} />
        <Route path="*" element={<CashierDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
