import React, { useState, useEffect } from 'react';
import { Save, Building2, Bell, Lock, Globe, Mail, CreditCard, Loader2, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import './AdminSettings.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CURRENCIES = [
  { code: 'LKR', symbol: 'Rs.', label: 'Sri Lankan Rupee (LKR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
];

const LANGUAGES = ['English',];
const TIMEZONES = ['UTC+05:30 (Colombo)', 'UTC+00:00 (GMT)', 'UTC-05:00 (EST)', 'UTC+01:00 (CET)'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { settings, fetchSettings } = useSettings();
  
  // Profile Tab State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // General Tab State
  const [formData, setFormData] = useState({
    hotelName: '',
    email: '',
    address: '',
    phone: '',
    website: ''
  });

  // Localization Tab State
  const [locData, setLocData] = useState({
    currency: { code: 'LKR', symbol: 'Rs.' },
    language: 'English',
    timezone: 'UTC+05:30',
    dateFormat: 'DD/MM/YYYY'
  });

  // Security Tab State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('janro_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setProfileData({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || ''
      });
    }

    if (settings) {
      setFormData({
        hotelName: settings.hotelName || '',
        email: settings.email || '',
        address: settings.address || '',
        phone: settings.phone || '',
        website: settings.website || ''
      });
      setLocData({
        currency: settings.currency || { code: 'LKR', symbol: 'Rs.' },
        language: settings.language || 'English',
        timezone: settings.timezone || 'UTC+05:30',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY'
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocChange = (e) => {
    const { name, value } = e.target;
    if (name === 'currencyCode') {
      const selected = CURRENCIES.find(c => c.code === value);
      setLocData(prev => ({ ...prev, currency: { code: selected.code, symbol: selected.symbol } }));
    } else {
      setLocData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/updateme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Refreshing...' });
        // Update local storage user data
        const storedUser = JSON.parse(localStorage.getItem('janro_user'));
        localStorage.setItem('janro_user', JSON.stringify({ ...storedUser, ...profileData }));
        
        // Force reload to update sidebar and other components
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocalizationSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locData)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Localization settings updated successfully!' });
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update localization' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving localization' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while changing password' });
    } finally {
      setIsSaving(false);
    }
  };

  const onSave = () => {
    if (activeTab === 'profile') {
      handleProfileSave();
    } else if (activeTab === 'general') {
      handleGeneralSave();
    } else if (activeTab === 'security') {
      handleSecuritySave();
    } else if (activeTab === 'localization') {
      handleLocalizationSave();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Settings
          </h1>
          <p className="text-slate-300 mt-2">
            Manage your hotel system configuration and preferences
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-1">
              {[
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'general', label: 'Hotel Settings', icon: Building2 },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'localization', label: 'Localization', icon: Globe },
                { id: 'email', label: 'Email Config', icon: Mail },
                { id: 'payment', label: 'Payments', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMessage({ type: '', text: '' });
                    }}
                    className={`admin-settings-tab ${
                      activeTab === tab.id ? 'admin-settings-tab--active' : 'admin-settings-tab--inactive'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Personal Profile</h2>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="admin-settings-label">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        name="name"
                        value={profileData.name} 
                        onChange={handleProfileChange}
                        className="admin-settings-control" 
                        style={{ paddingLeft: '2.75rem' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-settings-label">Email Address</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input 
                          type="email" 
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="admin-settings-control" 
                          style={{ paddingLeft: '2.75rem' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="admin-settings-label">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input 
                          type="tel" 
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="admin-settings-control" 
                          style={{ paddingLeft: '2.75rem' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> To change your password, please go to the <strong>Security</strong> tab.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">Hotel Name</label>
                    <input 
                      type="text" 
                      name="hotelName"
                      value={formData.hotelName} 
                      onChange={handleChange}
                      className="admin-settings-control" 
                    />
                    <p className="text-xs text-gray-400 mt-1">This name will be displayed across the website and in emails.</p>
                  </div>
                  <div>
                    <label className="admin-settings-label">Address</label>
                    <textarea 
                      rows={3} 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="admin-settings-control" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-settings-label">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="admin-settings-control" 
                      />
                    </div>
                    <div>
                      <label className="admin-settings-label">Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="admin-settings-control" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">Website</label>
                    <input 
                      type="url" 
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="admin-settings-control" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'New Bookings', desc: 'Receive notifications for new room bookings', defaultChecked: true },
                    { label: 'Payment Received', desc: 'Get notified when payments are completed', defaultChecked: true },
                    { label: 'Low Inventory', desc: 'Alert when inventory items are running low', defaultChecked: true },
                    { label: 'Staff Updates', desc: 'Notifications about staff activities', defaultChecked: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="admin-settings-switch">
                        <input type="checkbox" className="admin-settings-switch__input" defaultChecked={item.defaultChecked} />
                        <div className="admin-settings-switch__track"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.current ? "text" : "password"} 
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password" 
                        className="admin-settings-control pr-10" 
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"} 
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password" 
                        className="admin-settings-control pr-10" 
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"} 
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password" 
                        className="admin-settings-control pr-10" 
                      />
                      <button 
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Enable 2FA</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'localization' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Localization Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">System Language</label>
                    <input type="text" value="English" disabled className="admin-settings-control bg-gray-50 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">System language is locked and cannot be changed.</p>
                  </div>
                  <div>
                    <label className="admin-settings-label">Timezone</label>
                    <select 
                      name="timezone"
                      value={locData.timezone}
                      onChange={handleLocChange}
                      className="admin-settings-control"
                    >
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-settings-label">System Currency</label>
                      <select 
                        name="currencyCode"
                        value={locData.currency.code}
                        onChange={handleLocChange}
                        className="admin-settings-control"
                      >
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="admin-settings-label">Date Format</label>
                      <select 
                        name="dateFormat"
                        value={locData.dateFormat}
                        onChange={handleLocChange}
                        className="admin-settings-control"
                      >
                        {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && <div className="p-4 text-gray-500 italic">Email configuration content (static)</div>}
            {activeTab === 'payment' && <div className="p-4 text-gray-500 italic">Payment gateway settings content (static)</div>}

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button 
                onClick={onSave}
                disabled={isSaving || (activeTab !== 'profile' && activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'localization')}
                className={`admin-settings-primary-btn ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
