// App.jsx - Main Application Entry (Pure JavaScript)
// Main entry is now JSX and the app is fully JavaScript.
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";

function getUserRole(userData) {
    const email = userData?.email?.toLowerCase() || "";
    if (userData?.role) return userData.role;
    if (email.includes("admin")) return "admin";
    if (email.includes("reception") || email.includes("reciption") || email.includes("frontdesk")) return "reception";
    return "guest";
}

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}
function AppInner() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const savedUser = localStorage.getItem("janro_user");
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            const role = getUserRole(parsedUser);
            setUser({ ...parsedUser, role });
            setIsLoggedIn(true);
        }
    }, []);
    const handleLogin = (userData) => {
        const role = getUserRole(userData);
        const nextUser = { ...userData, role };
        setUser(nextUser);
        setIsLoggedIn(true);
        localStorage.setItem("janro_user", JSON.stringify(nextUser));
        navigate(role === "admin" ? "/admin" : role === "reception" ? "/reception" : "/");
    };
    const handleRegister = (userData) => {
        const nextUser = { ...userData, role: "guest" };
        setUser(nextUser);
        setIsLoggedIn(true);
        localStorage.setItem("janro_user", JSON.stringify(nextUser));
        navigate("/");
    };
    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("janro_user");
        navigate("/");
    };
    const location = useLocation();
        const isDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/reception");

    return (<div className="min-h-screen flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {!isDashboardRoute && <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}/>}
      <main className="flex-1">
        <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout}/>
      </main>
            {!isDashboardRoute && <Footer />}
    </div>);
}
export default function App() {
    return (<BrowserRouter>
      <ScrollToTop />
      <AppInner />
    </BrowserRouter>);
}
