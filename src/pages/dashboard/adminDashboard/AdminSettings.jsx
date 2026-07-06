import React, { useState, useEffect } from 'react';
import { Save, Building2, Bell, Lock, CreditCard, Loader2, Eye, EyeOff, User, Phone, Mail, Plus, Trash2, X, Pencil } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import './AdminSettings.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { settings, fetchSettings } = useSettings();
  
  // Profile Tab State
  const [user, setUser] = useState(null);
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
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  // Bank Accounts State (Multiple accounts)
  const [bankAccounts, setBankAccounts] = useState([]);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  // 2FA Setup State
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');

  // Editing state for bank account cards
  const [editingAccountIndex, setEditingAccountIndex] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('janro_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      });
      setTwoFactorEnabled(parsedUser.twoFactorEnabled || false);
    }
    fetchSettings();
  }, []);

  useEffect(() => {
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
      setBankDetails({
        bankName: settings.bankDetails?.bankName || '',
        branchName: settings.bankDetails?.branchName || '',
        accountNumber: settings.bankDetails?.accountNumber || '',
        accountHolderName: settings.bankDetails?.accountHolderName || ''
      });
      setBankAccounts(settings.bankAccounts || []);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const formatAccountNumber = (num) => {
    if (!num) return '•••• •••• •••• ••••';
    return num.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
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
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update local storage user data
        const storedUser = JSON.parse(localStorage.getItem('janro_user'));
        localStorage.setItem('janro_user', JSON.stringify({ ...storedUser, ...profileData }));
        
        // Dispatch an event so other components (like topbar) can update if they listen
        window.dispatchEvent(new Event('storage'));
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

  const handleEditBankAccountClick = (idx) => {
    const account = bankAccounts[idx];
    setNewBankAccount({
      bankName: account.bankName || '',
      branchName: account.branchName || '',
      accountNumber: account.accountNumber || '',
      accountHolderName: account.accountHolderName || ''
    });
    setEditingAccountIndex(idx);
    
    // Smooth scroll to the form element
    const formElement = document.getElementById('bank-form-header');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setNewBankAccount({
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: ''
    });
    setEditingAccountIndex(null);
  };

  const handlePaymentSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      let updatedAccounts = [...bankAccounts];
      const hasInputs = newBankAccount.bankName || newBankAccount.branchName || newBankAccount.accountNumber || newBankAccount.accountHolderName;

      if (hasInputs) {
        const bankNameTrimmed = (newBankAccount.bankName || '').trim();
        const branchNameTrimmed = (newBankAccount.branchName || '').trim();
        const accountHolderNameTrimmed = (newBankAccount.accountHolderName || '').trim();
        const rawAccountNumber = (newBankAccount.accountNumber || '').replace(/\s+/g, '');

        if (!bankNameTrimmed || !branchNameTrimmed || !rawAccountNumber || !accountHolderNameTrimmed) {
          setMessage({ type: 'error', text: 'Please fill in all bank account details' });
          setIsSaving(false);
          return;
        }

        if (bankNameTrimmed.length < 2) {
          setMessage({ type: 'error', text: 'Bank name must be at least 2 characters long' });
          setIsSaving(false);
          return;
        }

        if (branchNameTrimmed.length < 2) {
          setMessage({ type: 'error', text: 'Branch name must be at least 2 characters long' });
          setIsSaving(false);
          return;
        }

        if (accountHolderNameTrimmed.length < 2) {
          setMessage({ type: 'error', text: 'Account holder name must be at least 2 characters long' });
          setIsSaving(false);
          return;
        }

        // Account holder name validation (only letters, spaces, dots, dashes, parentheses)
        const nameRegex = /^[a-zA-Z\s.,()-]+$/;
        if (!nameRegex.test(accountHolderNameTrimmed)) {
          setMessage({ type: 'error', text: 'Account holder name must contain only letters, spaces, dots, or dashes' });
          setIsSaving(false);
          return;
        }

        if (!/^\d{6,20}$/.test(rawAccountNumber)) {
          setMessage({ type: 'error', text: 'Account number must contain only digits (6 to 20 numbers)' });
          setIsSaving(false);
          return;
        }

        const updatedDetail = {
          bankName: bankNameTrimmed,
          branchName: branchNameTrimmed,
          accountHolderName: accountHolderNameTrimmed,
          accountNumber: rawAccountNumber
        };
        if (editingAccountIndex !== null) {
          updatedAccounts[editingAccountIndex] = updatedDetail;
        } else {
          updatedAccounts.push(updatedDetail);
        }
      }

      const token = localStorage.getItem('janro_token');
      const primaryBankDetails = updatedAccounts.length > 0 ? updatedAccounts[0] : {
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountHolderName: ''
      };
      
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bankDetails: primaryBankDetails, bankAccounts: updatedAccounts })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: editingAccountIndex !== null ? 'Bank account updated successfully!' : 'Payment settings updated successfully!' });
        setBankAccounts(updatedAccounts);
        setNewBankAccount({
          bankName: '',
          branchName: '',
          accountNumber: '',
          accountHolderName: ''
        });
        setEditingAccountIndex(null);
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update payment settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving payment settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBankAccount = async (idx) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }
    
    const updatedAccounts = bankAccounts.filter((_, i) => i !== idx);
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const primaryBankDetails = updatedAccounts.length > 0 ? updatedAccounts[0] : {
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountHolderName: ''
      };
      
      const response = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bankDetails: primaryBankDetails, bankAccounts: updatedAccounts })
      });
      
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Bank account deleted successfully!' });
        setBankAccounts(updatedAccounts);
        
        // If we were editing the deleted account, cancel the edit mode
        if (editingAccountIndex === idx) {
          setNewBankAccount({
            bankName: '',
            branchName: '',
            accountNumber: '',
            accountHolderName: ''
          });
          setEditingAccountIndex(null);
        } else if (editingAccountIndex > idx) {
          // Adjust editing index if it shifted
          setEditingAccountIndex(prev => prev - 1);
        }
        
        fetchSettings(); // Refresh global settings
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete bank account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting bank account' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewBankChange = (e) => {
    const { name, value } = e.target;
    setNewBankAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleEnable2FA = async () => {
    setTwoFactorError('');
    setVerificationCode('');
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setQrCodeUrl(result.qrCodeUrl);
        setTotpSecret(result.secret);
        setIs2faModalOpen(true);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to initialize 2FA setup.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during 2FA initialization.' });
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
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
        body: JSON.stringify({ secret: totpSecret, code: verificationCode })
      });
      const result = await response.json();
      if (result.success) {
        setTwoFactorEnabled(true);
        setIs2faModalOpen(false);
        setMessage({ type: 'success', text: 'Two-Factor Authentication has been successfully enabled!' });
        
        // Update local storage
        const storedUser = JSON.parse(localStorage.getItem('janro_user'));
        const updatedUser = { ...storedUser, twoFactorEnabled: true };
        localStorage.setItem('janro_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setTwoFactorError(result.message || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      setTwoFactorError('Failed to verify code. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return;
    }
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('janro_token');
      const response = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTwoFactorEnabled(false);
        setMessage({ type: 'success', text: 'Two-Factor Authentication has been successfully disabled.' });
        
        // Update local storage
        const storedUser = JSON.parse(localStorage.getItem('janro_user'));
        const updatedUser = { ...storedUser, twoFactorEnabled: false };
        localStorage.setItem('janro_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to disable 2FA.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while disabling 2FA.' });
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
                { id: 'payment', label: 'Payment Settings', icon: CreditCard },
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
                      readOnly
                      className="admin-settings-control bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 focus:ring-0 focus:border-gray-200" 
                    />
                    <p className="text-xs text-gray-400 mt-1">This name is permanent and displayed across the website and in emails.</p>
                  </div>
                  <div>
                    <label className="admin-settings-label">Address</label>
                    <textarea 
                      rows={3} 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      readOnly
                      className="admin-settings-control bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 focus:ring-0 focus:border-gray-200" 
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
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication (2FA)</p>
                        <p className="text-sm text-gray-500">
                          {twoFactorEnabled 
                            ? 'Your account is secured with Two-Factor Authentication.' 
                            : 'Add an extra layer of security by requiring a verification code when logging in.'}
                        </p>
                      </div>
                      {twoFactorEnabled ? (
                        <button
                          type="button"
                          onClick={handleDisable2FA}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-semibold border border-red-200"
                        >
                          Disable 2FA
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleEnable2FA}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Payment & Settlement Settings</h2>
                  <p className="text-sm text-gray-500">Configure your official bank accounts for settlements and direct deposits.</p>
                </div>

                {/* Add Bank Account Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  {/* Left Column: Bank Account Card Preview */}
                  <div className="lg:col-span-5 flex flex-col justify-center items-center">
                    <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Live Bank Card Preview</p>
                    
                    {/* Visual Bank Card */}
                    <div className="relative w-full max-w-[320px] aspect-[1.586/1] bg-gradient-to-br from-[#1e293b] via-[#151f32] to-[#0f172a] text-white p-5 rounded-[20px] shadow-xl border border-slate-700/50 flex flex-col justify-between overflow-hidden select-none">
                      {/* Decorative elements */}
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_50%,transparent_100%)] pointer-events-none"></div>
                      <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full blur-lg pointer-events-none"></div>
                      <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-blue-950/20 rounded-full blur-md pointer-events-none"></div>
                      
                      {/* Card Top: Bank Brand & Safe Icon */}
                      <div className="flex justify-between items-start z-10">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-medium">Settlement Bank</span>
                          <span className="text-sm font-bold tracking-wide truncate max-w-[160px] drop-shadow-sm uppercase text-slate-100 mt-0.5">
                            {newBankAccount.bankName || 'BANK NAME'}
                          </span>
                        </div>
                        {/* Circular Bank Logo */}
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm">
                          <Building2 className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>

                      {/* Gold Chip */}
                      <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-md relative overflow-hidden shadow border border-amber-600/30">
                        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-800/20"></div>
                        <div className="absolute inset-y-0 left-2/3 w-[1px] bg-amber-800/20"></div>
                        <div className="absolute inset-x-0 top-1/4 h-[1px] bg-amber-800/20"></div>
                        <div className="absolute inset-x-0 top-2/4 h-[1px] bg-amber-800/20"></div>
                        <div className="absolute inset-x-0 top-3/4 h-[1px] bg-amber-800/20"></div>
                      </div>

                      {/* Card Middle: Account Number */}
                      <div className="z-10">
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">Account Number</span>
                        <p className="text-lg font-mono tracking-widest text-slate-100 drop-shadow-sm truncate">
                          {formatAccountNumber(newBankAccount.accountNumber)}
                        </p>
                      </div>

                      {/* Card Bottom: Holder, Branch, Hologram */}
                      <div className="flex justify-between items-end z-10 pt-2 border-t border-slate-700/20">
                        <div className="max-w-[45%]">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 block">Holder</span>
                          <span className="text-xs font-semibold tracking-wide truncate uppercase text-slate-200 block mt-0.5">
                            {newBankAccount.accountHolderName || 'HOLDER NAME'}
                          </span>
                        </div>
                        <div className="max-w-[35%] text-left ml-2">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 block">Branch</span>
                          <span className="text-xs font-semibold truncate text-slate-200 block mt-0.5 uppercase">
                            {newBankAccount.branchName || 'BRANCH'}
                          </span>
                        </div>
                        {/* Hologram Circle */}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 opacity-80 shadow-sm shadow-teal-500/20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Bank Details Form */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 id="bank-form-header" className="font-bold text-gray-800 text-base pb-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          {editingAccountIndex !== null ? 'Edit Bank Account Details' : 'Settlement Account Details'}
                        </span>
                        {editingAccountIndex !== null && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200/50 font-medium"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="admin-settings-label text-xs">Bank Name</label>
                          <input 
                            type="text" 
                            name="bankName"
                            value={newBankAccount.bankName} 
                            onChange={handleNewBankChange}
                            placeholder="e.g., Bank of Ceylon"
                            className="admin-settings-control text-sm focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="admin-settings-label text-xs">Branch Name</label>
                          <input 
                            type="text" 
                            name="branchName"
                            value={newBankAccount.branchName} 
                            onChange={handleNewBankChange}
                            placeholder="e.g., Colombo Fort"
                            className="admin-settings-control text-sm focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="admin-settings-label text-xs">Account Number</label>
                          <input 
                            type="text" 
                            name="accountNumber"
                            value={newBankAccount.accountNumber} 
                            onChange={handleNewBankChange}
                            placeholder="e.g., 0012345678"
                            className="admin-settings-control text-sm font-mono focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="admin-settings-label text-xs">Account Holder Name</label>
                          <input 
                            type="text" 
                            name="accountHolderName"
                            value={newBankAccount.accountHolderName} 
                            onChange={handleNewBankChange}
                            placeholder="e.g., Hotel Janro (Pvt) Ltd"
                            className="admin-settings-control text-sm focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configured Bank Cards List */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Active Accounts</h3>
                      <p className="text-xs text-gray-500">Settlement destinations displayed as official debit cards</p>
                    </div>
                  </div>

                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                      <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No bank accounts configured yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bankAccounts.map((account, idx) => (
                        <div key={idx} className="relative aspect-[1.586/1] bg-gradient-to-br from-[#1e293b] via-[#151f32] to-[#0f172a] text-white p-5 rounded-[20px] shadow-lg border border-slate-700/50 flex flex-col justify-between overflow-hidden group select-none transition-all duration-300 hover:shadow-xl">
                          {/* Card Gloss Overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_50%,transparent_100%)] pointer-events-none"></div>

                          {/* Top Row: Bank Brand & Safe Icon */}
                          <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col">
                              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-medium">Settlement Bank</span>
                              <span className="text-sm font-bold tracking-wide truncate max-w-[140px] drop-shadow-sm uppercase text-slate-100 mt-0.5">
                                {account.bankName}
                              </span>
                                 <div className="flex items-center gap-1.5">
                               {/* Circular Bank Logo */}
                               <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm">
                                 <Building2 className="w-4 h-4 text-slate-300" />
                               </div>
                               <button
                                 type="button"
                                 onClick={() => handleEditBankAccountClick(idx)}
                                 className="p-1.5 bg-blue-500/25 hover:bg-blue-600 text-blue-400 hover:text-white rounded-full transition-all duration-200 shadow-sm"
                                 title="Edit Bank Account"
                               >
                                 <Pencil className="w-3 h-3" />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => handleDeleteBankAccount(idx)}
                                 className="p-1.5 bg-red-500/25 hover:bg-red-600 text-red-400 hover:text-white rounded-full transition-all duration-200 shadow-sm"
                                 title="Delete Bank Account"
                               >
                                 <Trash2 className="w-3 h-3" />
                               </button>
                             </div>
                            </div>
                          </div>

                          {/* Gold Chip */}
                          <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-md relative overflow-hidden shadow border border-amber-600/30">
                            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-800/20"></div>
                            <div className="absolute inset-y-0 left-2/3 w-[1px] bg-amber-800/20"></div>
                            <div className="absolute inset-x-0 top-1/4 h-[1px] bg-amber-800/20"></div>
                            <div className="absolute inset-x-0 top-2/4 h-[1px] bg-amber-800/20"></div>
                            <div className="absolute inset-x-0 top-3/4 h-[1px] bg-amber-800/20"></div>
                          </div>

                          {/* Card Middle: Account Number */}
                          <div className="z-10">
                            <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">Account Number</span>
                            <p className="text-base font-mono tracking-widest text-slate-100 drop-shadow-sm truncate">
                              {formatAccountNumber(account.accountNumber)}
                            </p>
                          </div>

                          {/* Card Bottom: Holder, Branch, Hologram */}
                          <div className="flex justify-between items-end z-10 pt-2 border-t border-slate-700/20">
                            <div className="max-w-[45%]">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 block">Holder</span>
                              <span className="text-xs font-semibold tracking-wide truncate uppercase text-slate-200 block mt-0.5">
                                {account.accountHolderName}
                              </span>
                            </div>
                            <div className="max-w-[35%] text-left ml-2">
                              <span className="text-[8px] uppercase tracking-wider text-slate-400 block">Branch</span>
                              <span className="text-xs font-semibold truncate text-slate-200 block mt-0.5 uppercase">
                                {account.branchName}
                              </span>
                            </div>
                            {/* Hologram Circle */}
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 opacity-80 shadow-sm shadow-teal-500/20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* 2FA Setup Modal */}
      {is2faModalOpen && (
        <div className="admin-staff-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-staff-modal-card max-w-md">
            <div className="admin-staff-modal-header">
              <div>
                <h2 className="admin-staff-modal-title">Set Up Two-Factor Authentication</h2>
                <p className="admin-staff-modal-subtitle">Scan the QR code to secure your admin account.</p>
              </div>
              <button type="button" className="admin-staff-close-button" onClick={() => setIs2faModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerify2FA} className="admin-staff-modal-form space-y-4">
              {twoFactorError && (
                <p className="admin-staff-form-error mb-4">{twoFactorError}</p>
              )}

              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border border-slate-200 rounded-xl bg-white p-2" />
                <p className="text-xs text-slate-500 mt-2">Scan this QR code with Google Authenticator or a similar app.</p>
              </div>

              <div>
                <label className="admin-settings-label text-xs">Manual Entry Key</label>
                <input
                  type="text"
                  readOnly
                  value={totpSecret}
                  className="admin-settings-control text-sm font-mono text-center bg-slate-100 select-all"
                />
              </div>

              <div>
                <label className="admin-settings-label text-xs">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="admin-settings-control text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="admin-staff-modal-actions pt-4 border-t border-gray-100">
                <button type="button" className="admin-staff-secondary-button" onClick={() => setIs2faModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-staff-primary-button">
                  Verify and Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
