
import React, { useState, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
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

    // Inactivity logout for staff roles (admin, receptionist, cashier, staff) - PCI-DSS Compliant
    useEffect(() => {
        if (!isLoggedIn || !user) return;

        const isStaff = ['admin', 'reception', 'receptionist', 'cashier', 'staff'].includes(
            user.role?.toLowerCase().trim()
        );

        if (!isStaff) return;

        // Inactivity timeout: 15 minutes (900000 ms)
        const TIMEOUT = 15 * 60 * 1000;
        let timeoutId;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                alert("Logged out due to 15 minutes of inactivity for security.");
                handleLogout();
            }, TIMEOUT);
        };

        // Events to monitor user activity
        const events = ['mousemove', 'keypress', 'mousedown', 'scroll', 'click', 'touchstart'];
        
        // Start monitoring
        resetTimer();

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup on unmount or when dependencies change
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isLoggedIn, user]);

    const handleLogin = async (credentials) => {
        const { email, password } = credentials;


        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email.trim(), password })
        });

        try {
            const result = await parseApiError(response, "Login failed");

            if (result.twoFactorRequired) {
                return result; // returns { success: true, twoFactorRequired: true, userId: ... }
            }

            const { token, refreshToken, ...apiUserData } = result.data;

            const nextUser = normalizeUser(apiUserData);

            localStorage.setItem("janro_token", token);
            localStorage.setItem("janro_refresh_token", refreshToken);

            localStorage.setItem("janro_user", JSON.stringify(nextUser));

            setUser(nextUser);
            setIsLoggedIn(true);
            const roleLower = nextUser.role?.toLowerCase().trim();
            navigate(
                roleLower === "admin"
                    ? "/admin"
                    : (roleLower === "reception" || roleLower === "receptionist")
                    ? "/reception"
                    : roleLower === "cashier"
                    ? "/cashier"
                    : "/"
            );
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleVerifyLogin2FA = async (userId, code) => {
        const response = await fetch(`${API_BASE}/api/auth/login-2fa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, code })
        });

        try {
            const result = await parseApiError(response, "2FA Verification failed");

            const { token, refreshToken, ...apiUserData } = result.data;

            const nextUser = normalizeUser(apiUserData);

            localStorage.setItem("janro_token", token);
            localStorage.setItem("janro_refresh_token", refreshToken);

            localStorage.setItem("janro_user", JSON.stringify(nextUser));

            setUser(nextUser);
            setIsLoggedIn(true);
            const roleLower = nextUser.role?.toLowerCase().trim();
            navigate(
                roleLower === "admin"
                    ? "/admin"
                    : (roleLower === "reception" || roleLower === "receptionist")
                    ? "/reception"
                    : roleLower === "cashier"
                    ? "/cashier"
                    : "/"
            );
        } catch (error) {
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

            const { token, refreshToken, ...userData } = result.data || {};
            if (token && refreshToken) {
                const nextUser = normalizeUser(userData);
                localStorage.setItem("janro_token", token);
                localStorage.setItem("janro_refresh_token", refreshToken);
                localStorage.setItem("janro_user", JSON.stringify(nextUser));
                setUser(nextUser);
                setIsLoggedIn(true);
                const roleLower = nextUser.role?.toLowerCase().trim();
                navigate(
                    roleLower === "admin"
                        ? "/admin"
                        : (roleLower === "reception" || roleLower === "receptionist")
                        ? "/reception"
                        : roleLower === "cashier"
                        ? "/cashier"
                        : "/"
                );
            }
        } catch (error) {
            throw error;
        }
    };

    const handleGoogleLogin = async (googleCredential) => {
        const response = await fetch(`${API_BASE}/api/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ credential: googleCredential })
        });

        try {
            const result = await parseApiError(response, "Google sign in failed");

            const { token, refreshToken, ...apiUserData } = result.data;

            const nextUser = normalizeUser(apiUserData);

            localStorage.setItem("janro_token", token);
            localStorage.setItem("janro_refresh_token", refreshToken);

            localStorage.setItem("janro_user", JSON.stringify(nextUser));

            setUser(nextUser);
            setIsLoggedIn(true);
            const roleLower = nextUser.role?.toLowerCase().trim();
            navigate(
                roleLower === "admin"
                    ? "/admin"
                    : (roleLower === "reception" || roleLower === "receptionist")
                    ? "/reception"
                    : roleLower === "cashier"
                    ? "/cashier"
                    : "/"
            );
        } catch (error) {
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
    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("janro_user", JSON.stringify(updatedUser));
    };

    const location = useLocation();
    
    // Check if current route is a management dashboard
    const isDashboardRoute = location.pathname.startsWith("/admin") || 
                             location.pathname.startsWith("/reception") || 
                             location.pathname.startsWith("/cashier");

    return (
        <div className="min-h-screen flex flex-col" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {!isDashboardRoute && <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} authChecked={authChecked}/>}
            <main className="flex-1">
                <AppRoutes isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onVerify2FA={handleVerifyLogin2FA} onRegister={handleRegister} onLogout={handleLogout} onGoogleLogin={handleGoogleLogin} onUpdateUser={handleUpdateUser}/>
            </main>
            {!isDashboardRoute && <Footer />}
        </div>
    );
}
import { Toaster } from "sonner";

export default function App() {
    return (
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppInner />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </SettingsProvider>
    );
}
