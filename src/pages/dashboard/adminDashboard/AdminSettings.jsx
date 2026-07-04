import React, { useState, useEffect } from 'react';
import { Save, Building2, Bell, Lock, CreditCard, Loader2, Eye, EyeOff, User, Phone, Mail, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import './AdminSettings.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  // Notifications Tab State
  const [notificationPrefs, setNotificationPrefs] = useState({
    newBookings: true,
    paymentReceived: true,
    lowInventory: true,
    staffUpdates: true
  });

  // Bank Details State
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankIndex, setEditingBankIndex] = useState(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  // 2FA State
  const [currentUser, setCurrentUser] = useState(null);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFASetupData, setTwoFASetupData] = useState({ secret: '', qrCodeUrl: '' });
  const [twoFAVerificationCode, setTwoFAVerificationCode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user status", error);
    }
  };

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

    fetchCurrentUser();

    if (settings) {
      setFormData({
        hotelName: settings.hotelName || '',
        email: settings.email || '',
        address: settings.address || '',
        phone: settings.phone || '',
        website: settings.website || ''
      });
      setNotificationPrefs({
        newBookings: settings.notifications?.newBookings !== false,
        paymentReceived: settings.notifications?.paymentReceived !== false,
        lowInventory: settings.notifications?.lowInventory !== false,
        staffUpdates: settings.notifications?.staffUpdates !== false
      });
      setBankAccounts(settings.bankAccounts || []);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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



  const handleNotificationsSave = async () => {
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
        body: JSON.stringify({ notifications: notificationPrefs })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Notification preferences updated successfully!' });
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update notification preferences' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving notification preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStart2FA = async () => {
    setTwoFAError('');
    setTwoFAVerificationCode('');
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTwoFASetupData({
          secret: result.secret,
          qrCodeUrl: result.qrCodeUrl
        });
        setIs2FAModalOpen(true);
      } else {
        alert(result.message || "Failed to start 2FA setup");
      }
    } catch (error) {
      alert("Error starting 2FA setup");
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFAError('');
    if (!twoFAVerificationCode || twoFAVerificationCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit code");
      return;
    }

    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          secret: twoFASetupData.secret,
          code: twoFAVerificationCode
        })
      });

      const result = await response.json();
      if (result.success) {
        setIs2FAModalOpen(false);
        alert("Two-Factor Authentication enabled successfully!");
        fetchCurrentUser();
        const storedUser = localStorage.getItem('janro_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.twoFactorEnabled = true;
          localStorage.setItem('janro_user', JSON.stringify(parsed));
        }
      } else {
        setTwoFAError(result.message || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      setTwoFAError("An error occurred during verification");
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")) {
      return;
    }

    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        alert("Two-Factor Authentication disabled successfully.");
        fetchCurrentUser();
        const storedUser = localStorage.getItem('janro_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.twoFactorEnabled = false;
          localStorage.setItem('janro_user', JSON.stringify(parsed));
        }
      } else {
        alert(result.message || "Failed to disable 2FA");
      }
    } catch (error) {
      alert("Error disabling 2FA");
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

    if (passwordData.newPassword === passwordData.currentPassword) {
      setMessage({ type: 'error', text: 'New password cannot be the same as your current password' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
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

  const handleOpenBankModal = (index = null) => {
    if (index !== null) {
      setEditingBankIndex(index);
      setBankForm(bankAccounts[index]);
    } else {
      setEditingBankIndex(null);
      setBankForm({
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountHolderName: ''
      });
    }
    setIsBankModalOpen(true);
  };

  const handleSaveBankAccount = async (e) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.branchName || !bankForm.accountNumber || !bankForm.accountHolderName) {
      alert("Please fill in all fields.");
      return;
    }

    let updatedList;
    if (editingBankIndex !== null) {
      updatedList = bankAccounts.map((item, idx) => idx === editingBankIndex ? bankForm : item);
    } else {
      updatedList = [...bankAccounts, bankForm];
    }
    
    setBankAccounts(updatedList);
    setIsBankModalOpen(false);
    await handlePaymentSave(updatedList);
  };

  const handleDeleteBankAccount = async (index) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) return;
    
    const updatedList = bankAccounts.filter((_, idx) => idx !== index);
    setBankAccounts(updatedList);
    await handlePaymentSave(updatedList);
  };

  const handlePaymentSave = async (updatedAccounts) => {
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
        body: JSON.stringify({ bankAccounts: updatedAccounts || bankAccounts })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Bank details updated successfully!' });
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update bank details' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving bank details' });
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
    } else if (activeTab === 'notifications') {
      handleNotificationsSave();
    } else if (activeTab === 'payment') {
      handlePaymentSave();
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
                    { key: 'newBookings', label: 'New Bookings', desc: 'Receive notifications for new room bookings' },
                    { key: 'paymentReceived', label: 'Payment Received', desc: 'Get notified when payments are completed' },
                    { key: 'lowInventory', label: 'Low Inventory', desc: 'Alert when inventory items are running low' },
                    { key: 'staffUpdates', label: 'Staff Updates', desc: 'Notifications about staff activities' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="admin-settings-switch">
                        <input
                          type="checkbox"
                          className="admin-settings-switch__input"
                          checked={notificationPrefs[item.key]}
                          onChange={(e) => setNotificationPrefs(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        />
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
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security using Google Authenticator or Microsoft Authenticator.</p>
                      </div>
                      {currentUser?.twoFactorEnabled ? (
                        <button 
                          onClick={handleDisable2FA}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 rounded-xl text-xs transition-colors"
                        >
                          Disable 2FA
                        </button>
                      ) : (
                        <button 
                          onClick={handleStart2FA}
                          className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#b8962d] text-slate-900 font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Bank Accounts & Payments</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage direct bank transfer details shown to customers for payments.</p>
                  </div>
                  <button
                    onClick={() => handleOpenBankModal(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#b8962d] text-slate-900 font-bold rounded-xl text-xs transition-colors shadow-md shadow-[#D4AF37]/10"
                  >
                    <Plus className="w-4 h-4" />
                    Add Bank Account
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Table list of bank accounts */}
                  <div className="xl:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    {bankAccounts.length === 0 ? (
                      <div className="py-12 text-center">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No bank accounts configured</p>
                        <p className="text-xs text-slate-400 mt-1">Add a bank account to display it as a payment method.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</th>
                              <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</th>
                              <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {bankAccounts.map((account, idx) => (
                              <tr key={idx} className="hover:bg-slate-100/50 transition-colors">
                                <td className="py-4">
                                  <div className="font-bold text-slate-800 text-sm">{account.bankName}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{account.branchName} • {account.accountHolderName}</div>
                                </td>
                                <td className="py-4 font-mono text-sm text-slate-600">{account.accountNumber}</td>
                                <td className="py-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleOpenBankModal(idx)}
                                      className="p-2 text-slate-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                                      title="Edit Bank Details"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBankAccount(idx)}
                                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Bank Account"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Card preview scroll list */}
                  <div className="xl:col-span-1 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Live Card Previews</h4>
                    {bankAccounts.length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-2xl h-56 flex items-center justify-center text-xs text-slate-400 font-medium">
                        Card preview will appear here
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                        {bankAccounts.map((account, idx) => (
                          <div key={idx} className="admin-settings-card-preview relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-6 rounded-2xl shadow-md border border-white/10 flex flex-col justify-between h-56">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-[9px] text-[#D4AF37] uppercase tracking-[0.2em] font-semibold">Official Bank Account</p>
                                <h4 className="text-xs font-bold text-white mt-1 uppercase tracking-wider truncate max-w-[180px]">
                                  {account.bankName}
                                </h4>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                              </div>
                            </div>

                            <div className="my-3">
                              <p className="text-[8px] text-slate-400 uppercase tracking-wider">Account Number</p>
                              <p className="text-base font-mono font-bold tracking-widest text-[#F5E7B2] truncate">
                                {account.accountNumber ? account.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                              </p>
                            </div>

                            <div className="flex justify-between items-end gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-[8px] text-slate-400 uppercase tracking-wider">Account Holder</p>
                                <p className="text-[10px] font-semibold uppercase truncate text-white">
                                  {account.accountHolderName}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[8px] text-slate-400 uppercase tracking-wider">Branch</p>
                                <p className="text-[10px] font-semibold text-white">
                                  {account.branchName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button 
                onClick={onSave}
                disabled={isSaving || (activeTab !== 'profile' && activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'notifications' && activeTab !== 'payment')}
                className={`admin-settings-primary-btn ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0F172A] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {editingBankIndex !== null ? 'Edit Bank Account' : 'Add Bank Account'}
                </h3>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mt-1">Configure Transfer Info</p>
              </div>
              <button 
                type="button" 
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white" 
                onClick={() => setIsBankModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBankAccount} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Account Holder Name *</label>
                <input 
                  type="text" 
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-sm font-medium text-slate-800"
                  placeholder="e.g. Hotel Janro (Pvt) Ltd"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Bank Name *</label>
                  <input 
                    type="text" 
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-sm font-medium text-slate-800"
                    placeholder="e.g. Bank of Ceylon"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Branch Name *</label>
                  <input 
                    type="text" 
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-sm font-medium text-slate-800"
                    placeholder="e.g. Dompe Branch"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Account Number *</label>
                <input 
                  type="text" 
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-sm font-medium text-slate-800"
                  placeholder="e.g. 123456789"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-slate-900/10"
                >
                  {editingBankIndex !== null ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-[#0F172A] px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
                  Setup Two-Factor Authentication
                </h3>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mt-1">Scan & Verify</p>
              </div>
              <button 
                type="button" 
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white" 
                onClick={() => setIs2FAModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleVerify2FA} className="p-6 space-y-5 text-center">
              <p className="text-xs text-slate-500 text-left">
                Scan this QR code with your authenticator application (e.g. Google Authenticator, Microsoft Authenticator, Authy), then enter the 6-digit code generated by the app.
              </p>

              {/* QR Code Container */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 inline-block shadow-inner mx-auto">
                <img 
                  src={twoFASetupData.qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-40 h-40 block"
                />
              </div>

              {/* Manual Entry Secret */}
              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div className="font-bold text-slate-700">Can't scan the QR code?</div>
                <div className="text-slate-500 mt-1 flex justify-between items-center">
                  <span>Enter this key manually:</span>
                  <span className="font-mono bg-white px-2 py-0.5 border border-slate-200 rounded font-bold text-slate-800 tracking-wider">
                    {twoFASetupData.secret}
                  </span>
                </div>
              </div>

              {twoFAError && (
                <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-left">
                  ⚠️ {twoFAError}
                </div>
              )}

              {/* Verification input */}
              <div className="text-left">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={twoFAVerificationCode}
                  onChange={(e) => setTwoFAVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none text-lg font-mono font-bold tracking-[0.3em] text-slate-800"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIs2FAModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-slate-900/10"
                >
                  Verify and Enable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
