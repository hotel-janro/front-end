
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeUser = (userData) => {
    return userData;
};

const parseApiError = async (response, fallbackMessage) => {
    let data = null;
    try {
        data = await response.json();
    } catch {
        throw new Error(fallbackMessage);
    }

    if (!response.ok || !data.success) {
        const error = new Error(data.message || fallbackMessage);
        error.data = data;
        throw error;
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
    const [authChecked, setAuthChecked] = useState(false);

    // Restore session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("janro_user");
        const token = localStorage.getItem("janro_token");

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }
        setAuthChecked(true);
    }, []);

    const handleLogin = async (credentials) => {
        const { email, password } = credentials;
        if (!password) {
            const demoUser = normalizeUser(credentials);
            setUser(demoUser);
            setIsLoggedIn(true);
            localStorage.setItem("janro_user", JSON.stringify(demoUser));
            localStorage.removeItem("janro_token");
            navigate(
                    demoUser.role === "admin"
                        ? "/admin"
                        : (demoUser.role === "reception" || demoUser.role === "receptionist")
                        ? "/reception"
                        : demoUser.role === "cashier"
                        ? "/cashier"
                        : "/"
            );
            return;
        }

        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email.trim(), password })
        });

        try {
            const result = await parseApiError(response, "Login failed");

            const { token, refreshToken, ...apiUserData } = result.data;

            const nextUser = normalizeUser(apiUserData);

            localStorage.setItem("janro_token", token);
            localStorage.setItem("janro_refresh_token", refreshToken);

            localStorage.setItem("janro_user", JSON.stringify(nextUser));

            setUser(nextUser);
            setIsLoggedIn(true);
            navigate(
                nextUser.role === "admin"
                    ? "/admin"
                    : (nextUser.role === "reception" || nextUser.role === "receptionist")
                    ? "/reception"
                    : nextUser.role === "cashier"
                    ? "/cashier"
                    : "/"
            );
        } catch (error) {
            if (error.data?.requireVerification) {
                navigate("/verify-email", { state: { email: credentials.email.trim() } });
                return;
            }
            throw error;
        }
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

        try {
            const result = await parseApiError(response, "Registration failed");
            if (result.requireVerification) {
                navigate("/verify-email", { state: { email: email.trim() } });
                return;
            }

            const { token, refreshToken, ...userData } = result.data || {};
            if (token && refreshToken) {
                const nextUser = normalizeUser(userData);
                localStorage.setItem("janro_token", token);
                localStorage.setItem("janro_refresh_token", refreshToken);
                localStorage.setItem("janro_user", JSON.stringify(nextUser));
                setUser(nextUser);
                setIsLoggedIn(true);
                navigate(
                    nextUser.role === "admin"
                        ? "/admin"
                        : (nextUser.role === "reception" || nextUser.role === "receptionist")
                        ? "/reception"
                        : nextUser.role === "cashier"
                        ? "/cashier"
                        : "/"
                );
            }
        } catch (error) {
            if (error.data?.requireVerification) {
                navigate("/verify-email", { state: { email: email.trim() } });
                return;
            }
            throw error;
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("janro_token");
        localStorage.removeItem("janro_refresh_token");
        localStorage.removeItem("janro_user");
        navigate("/");
    };
    const location = useLocation();
    
    // Check if current route is a management dashboard
    const isDashboardRoute = location.pathname.startsWith("/admin") || 
                             location.pathname.startsWith("/reception") || 
                             location.pathname.startsWith("/cashier");

    return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            <Toaster position="top-right" richColors />
            {!isDashboardRoute && <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} authChecked={authChecked}/>}
            <main className="flex-1">
                <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout}/>
            </main>
            {!isDashboardRoute && <Footer />}
        </div>
    );
}
export default function App() {
    return (<SettingsProvider>
        <SocketProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppInner />
          </BrowserRouter>
        </SocketProvider>
      </SettingsProvider>);
}
