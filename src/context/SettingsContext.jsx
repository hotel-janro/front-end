import React, { createContext, useContext, useState, useEffect } from 'react';


const SettingsContext = createContext();

// 2. Custom hook to use settings in any component 
export const useSettings = () => useContext(SettingsContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 3. Provider component that wraps the app 
export const SettingsProvider = ({ children }) => {
  // Initial default values (not database)
  const [settings, setSettings] = useState({
    hotelName: 'Hotel Janro',
    email: 'info@hoteljanro.com',
    address: 'No: 10/2, B, Medagodawatta, Malwana-Dompe Road, Dompe 11680, Sri Lanka',
    phone: '+94 76 360 0041',
    website: 'https://www.hoteljanro.com',
    currency: { code: 'LKR', symbol: 'Rs.' },
    language: 'English',
    timezone: 'UTC+05:30',
    dateFormat: 'DD/MM/YYYY'
  });
  const [loading, setLoading] = useState(true);

  // 4. Function to fetch settings from backend 
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings`);
      const result = await response.json();
      if (result.success) {
      
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

   
  useEffect(() => {
    fetchSettings();
  }, []);

  // 6. Function to update local settings state 
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
