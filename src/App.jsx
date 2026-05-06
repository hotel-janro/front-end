
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

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
                // Try to get user profile with current access token
                const response = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${savedToken}`
                    }
                });

                if (response.status === 401) {
                    // Access token might be expired (15 min), try to refresh it
                    const savedRefreshToken = localStorage.getItem("janro_refresh_token");
                    if (!savedRefreshToken) throw new Error("No refresh token");

                    const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken: savedRefreshToken })
                    });

                    const refreshData = await parseApiError(refreshResponse, "Refresh failed");
                    const newToken = refreshData.token;

                    // Save new access token
                    localStorage.setItem("janro_token", newToken);
                    
                    // Retry getting user profile with NEW token
                    const retryResponse = await fetch(`${API_BASE}/api/auth/me`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${newToken}`
                        }
                    });
                    const retryResult = await parseApiError(retryResponse, "Session retry failed");
                    const nextUser = normalizeUser(retryResult.data);
                    setUser(nextUser);
                    setIsLoggedIn(true);
                } else {
                    const result = await parseApiError(response, "Session expired");
                    const nextUser = normalizeUser(result.data);
                    setUser(nextUser);
                    setIsLoggedIn(true);
                    localStorage.setItem("janro_user", JSON.stringify(nextUser));
                }
            } catch (error) {
                console.error("Auth error:", error);
                handleLogout(); // Clear everything if both tokens fail
            }
        };

        verifySavedSession();
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
                    : demoUser.role === "reception"
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
                : nextUser.role === "reception"
                ? "/reception"
                : nextUser.role === "cashier"
                ? "/cashier"
                : "/"
        );
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
        const { token, refreshToken, ...userData } = result.data;

        const nextUser = normalizeUser(userData);

        localStorage.setItem("janro_token", token);
        localStorage.setItem("janro_refresh_token", refreshToken);

        localStorage.setItem("janro_user", JSON.stringify(nextUser));

        setUser(nextUser);
        setIsLoggedIn(true);
        navigate(
            nextUser.role === "admin"
                ? "/admin"
                : nextUser.role === "reception"
                ? "/reception"
                : nextUser.role === "cashier"
                ? "/cashier"
                : "/"
        );
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
            {!isDashboardRoute && <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout}/>}
            <main className="flex-1">
                <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout}/>
            </main>
            {!isDashboardRoute && <Footer />}
        </div>
    );
}
export default function App() {
    return (<SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppInner />
        </BrowserRouter>
      </SettingsProvider>);
}
