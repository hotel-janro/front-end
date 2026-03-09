// App.jsx - Main Application Entry (Pure JavaScript)
// Main entry is now JSX and the app is fully JavaScript.
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
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
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
    }, []);
    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem("janro_user", JSON.stringify(userData));
        navigate("/");
    };
    const handleRegister = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem("janro_user", JSON.stringify(userData));
        navigate("/");
    };
    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("janro_user");
        navigate("/");
    };
    return (<div className="min-h-screen flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}/>
      <main className="flex-1">
        <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onRegister={handleRegister}/>
      </main>
      <Footer />
    </div>);
}
export default function App() {
    return (<BrowserRouter>
      <ScrollToTop />
      <AppInner />
    </BrowserRouter>);
}
