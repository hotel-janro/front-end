import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    email: 'info@hoteljanro.com',
    address: '123 Luxury Avenue, Paradise City, PC 10001',
    phone: '+1 (555) 123-4567',
    website: 'https://www.hoteljanro.com',
    currency: { code: 'LKR', symbol: 'Rs.' },
    language: 'English',
    timezone: 'UTC+05:30',
    dateFormat: 'DD/MM/YYYY'
  });
  const [loading, setLoading] = useState(true);

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

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
