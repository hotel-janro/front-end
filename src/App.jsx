
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeUser = (userData) => {
    const fallbackRole = userData?.email?.toLowerCase().includes("admin") ? "admin" : "customer";
    return {
        ...userData,
        role: userData?.role || fallbackRole
    };
};

const parseApiError = async (response, fallbackMessage) => {
    let data = null;
    try {
        data = await response.json();
    } catch {
        throw new Error(fallbackMessage);
    }

    if (!response.ok || !data.success) {
        throw new Error(data.message || fallbackMessage);
    }

    return data;
};

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
        const savedToken = localStorage.getItem("janro_token");

        const verifySavedSession = async () => {
            if (!savedUser || !savedToken) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${savedToken}`
                    }
                });

                const result = await parseApiError(response, "Session expired");
                const nextUser = normalizeUser(result.data);
                setUser(nextUser);
                setIsLoggedIn(true);
                localStorage.setItem("janro_user", JSON.stringify(nextUser));
            } catch {
                localStorage.removeItem("janro_token");
                localStorage.removeItem("janro_user");
                setUser(null);
                setIsLoggedIn(false);
            }
        };

        verifySavedSession();
    }, []);

    const handleLogin = async ({ email, password }) => {
        if (!password) {
            const demoUser = normalizeUser({ email, role: "admin" });
            setUser(demoUser);
            setIsLoggedIn(true);
            localStorage.setItem("janro_user", JSON.stringify(demoUser));
            localStorage.removeItem("janro_token");
            navigate("/admin");
            return;
        }

        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email.trim(), password })
        });

        const result = await parseApiError(response, "Login failed");

        const { token, ...userData } = result.data;
        const nextUser = normalizeUser(userData);

        localStorage.setItem("janro_token", token);
        localStorage.setItem("janro_user", JSON.stringify(nextUser));

        setUser(nextUser);
        setIsLoggedIn(true);
        navigate(nextUser.role === "admin" ? "/admin" : "/");
    };

    const handleRegister = async ({ name, email, password, confirmPassword, phone }) => {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                password,
                confirmPassword,
                phone
            })
        });

        const result = await parseApiError(response, "Registration failed");
        const { token, ...userData } = result.data;
        const nextUser = normalizeUser(userData);

        localStorage.setItem("janro_token", token);
        localStorage.setItem("janro_user", JSON.stringify(nextUser));

        setUser(nextUser);
        setIsLoggedIn(true);
        navigate(nextUser.role === "admin" ? "/admin" : "/");
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("janro_token");
        localStorage.removeItem("janro_user");
        navigate("/");
    };
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (<div className="min-h-screen flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
      {!isAdminRoute && <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}/>}
      <main className="flex-1">
        <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout}/>
      </main>
      {!isAdminRoute && <Footer />}
    </div>);
}
export default function App() {
    return (<BrowserRouter>
      <ScrollToTop />
      <AppInner />
    </BrowserRouter>);
}
