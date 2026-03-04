import React, { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";

function App() {
  // These states manage whether a user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Fake login/logout functions for now
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleRegister = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar goes here so it shows on every page */}
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      
      {/* Main content area where pages change */}
      <main className="flex-grow">
        <AppRoutes 
          isLoggedIn={isLoggedIn} 
          user={user} 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
        />
      </main>
    </div>
  );
}

export default App;