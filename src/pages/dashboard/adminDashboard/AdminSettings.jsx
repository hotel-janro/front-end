import React, { useState } from 'react';
import { Save, Building2, Bell, Lock, Palette, Globe, Mail, CreditCard } from 'lucide-react';
import './AdminSettings.css';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your hotel system configuration and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-1">
              {[
                { id: 'general', label: 'General', icon: Building2 },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'localization', label: 'Localization', icon: Globe },
                { id: 'email', label: 'Email Settings', icon: Mail },
                { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">Hotel Name</label>
                    <input type="text" defaultValue="Grand Luxury Hotel" className="admin-settings-control" />
                  </div>
                  <div>
                    <label className="admin-settings-label">Address</label>
                    <textarea rows={3} defaultValue="123 Main Street, Downtown, City, State 12345" className="admin-settings-control" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-settings-label">Phone Number</label>
                      <input type="tel" defaultValue="+1 (555) 123-4567" className="admin-settings-control" />
                    </div>
                    <div>
                      <label className="admin-settings-label">Email</label>
                      <input type="email" defaultValue="info@grandhotel.com" className="admin-settings-control" />
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">Website</label>
                    <input type="url" defaultValue="https://www.grandhotel.com" className="admin-settings-control" />
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
                    <input type="password" placeholder="Enter current password" className="admin-settings-control" />
                  </div>
                  <div>
                    <label className="admin-settings-label">New Password</label>
                    <input type="password" placeholder="Enter new password" className="admin-settings-control" />
                  </div>
                  <div>
                    <label className="admin-settings-label">Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" className="admin-settings-control" />
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

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">Theme</label>
                    <select className="admin-settings-control">
                      <option>Light</option><option>Dark</option><option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-settings-label">Primary Color</label>
                    <div className="flex gap-3">
                      <button className="admin-settings-color-chip admin-settings-color-chip--blue"></button>
                      <button className="admin-settings-color-chip admin-settings-color-chip--active admin-settings-color-chip--purple"></button>
                      <button className="admin-settings-color-chip admin-settings-color-chip--active admin-settings-color-chip--green"></button>
                      <button className="admin-settings-color-chip admin-settings-color-chip--active admin-settings-color-chip--orange"></button>
                      <button className="admin-settings-color-chip admin-settings-color-chip--active admin-settings-color-chip--pink"></button>
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">Sidebar Position</label>
                    <select className="admin-settings-control">
                      <option>Left</option><option>Right</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'localization' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Localization Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">Language</label>
                    <select className="admin-settings-control">
                      <option>English (US)</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-settings-label">Timezone</label>
                    <select className="admin-settings-control">
                      <option>UTC-08:00 (Pacific Time)</option><option>UTC-05:00 (Eastern Time)</option><option>UTC+00:00 (GMT)</option><option>UTC+01:00 (Central European Time)</option><option>UTC+08:00 (China Standard Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-settings-label">Currency</label>
                    <select className="admin-settings-control">
                      <option>USD ($)</option><option>EUR (&euro;)</option><option>GBP (&pound;)</option><option>JPY (&yen;)</option><option>CNY (&yen;)</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-settings-label">Date Format</label>
                    <select className="admin-settings-control">
                      <option>MM/DD/YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-settings-label">SMTP Server</label>
                    <input type="text" placeholder="smtp.example.com" className="admin-settings-control" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-settings-label">Port</label>
                      <input type="number" placeholder="587" className="admin-settings-control" />
                    </div>
                    <div>
                      <label className="admin-settings-label">Encryption</label>
                      <select className="admin-settings-control">
                        <option>TLS</option><option>SSL</option><option>None</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="admin-settings-label">Username</label>
                    <input type="email" placeholder="your-email@example.com" className="admin-settings-control" />
                  </div>
                  <div>
                    <label className="admin-settings-label">Password</label>
                    <input type="password" placeholder="••••••••" className="admin-settings-control" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Settings</h2>
                <div className="space-y-6">
                  <div className="admin-settings-gateway-card">
                    <div className="admin-settings-gateway-header">
                      <h3 className="font-medium text-gray-900">Stripe</h3>
                      <label className="admin-settings-switch">
                        <input type="checkbox" className="admin-settings-switch__input" defaultChecked />
                        <div className="admin-settings-switch__track"></div>
                      </label>
                    </div>
                    <input type="text" placeholder="Publishable Key" className="admin-settings-control mb-2" />
                    <input type="password" placeholder="Secret Key" className="admin-settings-control" />
                  </div>
                  <div className="admin-settings-gateway-card">
                    <div className="admin-settings-gateway-header">
                      <h3 className="font-medium text-gray-900">PayPal</h3>
                      <label className="admin-settings-switch">
                        <input type="checkbox" className="admin-settings-switch__input" />
                        <div className="admin-settings-switch__track"></div>
                      </label>
                    </div>
                    <input type="text" placeholder="Client ID" className="admin-settings-control mb-2" />
                    <input type="password" placeholder="Secret" className="admin-settings-control" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button className="admin-settings-primary-btn">
                <Save className="w-5 h-5" />Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}