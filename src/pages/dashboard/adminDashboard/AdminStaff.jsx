import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users as UsersIcon, Briefcase, DollarSign, X } from 'lucide-react';
import { staffMembers } from '../../../data/newMockData.js';
import { useSettings } from '../../../context/SettingsContext.jsx';
import './AdminStaff.css';

export function AdminStaff() {
  const { settings } = useSettings();
  const [staffList, setStaffList] = useState(staffMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Receptionist',
    department: 'Front Office',
    salary: '',
    joinDate: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [editStaff, setEditStaff] = useState(null);

  // Fetch staff from backend on component mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('janro_token');

        const res = await fetch(`${API_BASE}/api/auth/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        const data = await res.json();
        if (res.ok && data.success && data.data) {
          // Filter to show only staff/non-customer users
          const staffRoles = ['staff', 'manager', 'receptionist', 'chef', 'waiter', 'housekeeping', 'security', 'maintenance'];
          const filteredStaff = data.data.filter((u) => staffRoles.includes(u.role?.toLowerCase()));
          
          // Map API data to match frontend format with id field
          const formattedStaff = filteredStaff.map((u, idx) => ({
            id: String(idx + 1).padStart(3, '0'),
            _id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            department: u.department || 'Front Office',
            salary: u.salary || 0,
            joinDate: u.joinDate,
            status: u.status || 'Active'
          }));

          setStaffList(formattedStaff.length > 0 ? formattedStaff : staffMembers);
        }
      } catch (err) {
        console.error('Failed to fetch staff:', err);
        // Keep mock data as fallback
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      (staff.name && staff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'All' || (staff.role && staff.role.toLowerCase() === filterRole.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (staff.status && staff.status.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role) => {
    if (!role) return 'bg-gray-100 text-gray-800';
    switch (role.toLowerCase()) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'receptionist': return 'bg-blue-100 text-blue-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      case 'waiter': return 'bg-cyan-100 text-cyan-800';
      case 'housekeeping': return 'bg-pink-100 text-pink-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === 'Active').length;
  const totalSalary = staffList.reduce((sum, staff) => sum + staff.salary, 0);

  const handleOpenModal = () => {
    setFormError('');
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: 'Receptionist',
      department: 'Front Office',
      salary: '',
      joinDate: '',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setFormError('');
  };

  const handleFieldChange = (field, value) => {
    setNewStaff((prev) => ({ ...prev, [field]: value }));
  };

  const openEditModal = (staff) => {
    setFormError('');
    // copy staff into editStaff state
    setEditStaff({
      _id: staff._id,
      id: staff.id,
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'Receptionist',
      department: staff.department || 'Front Office',
      salary: staff.salary || '',
      joinDate: staff.joinDate ? new Date(staff.joinDate).toISOString().slice(0,10) : '',
      status: staff.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditStaff(null);
    setFormError('');
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editStaff) return;

    if (!editStaff.name || !editStaff.email) {
      setFormError('Name and email are required');
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('janro_token');

    // If this staff doesn't have an _id (mocked), update locally
    if (!editStaff._id) {
      setStaffList((prev) => prev.map((s) => (s.id === editStaff.id ? { ...s, ...editStaff } : s)));
      closeEditModal();
      return;
    }

    try {
      setFormError('');
      const body = {
        name: editStaff.name,
        email: editStaff.email,
        phone: editStaff.phone,
        role: editStaff.role,
        department: editStaff.department,
        salary: Number(editStaff.salary) || 0,
        joinDate: editStaff.joinDate,
        status: editStaff.status
      };

      const res = await fetch(`${API_BASE}/api/auth/users/${editStaff._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');

      const updated = data.data;
      setStaffList((prev) => prev.map((s) => (s._id === updated._id || s.id === editStaff.id ? { ...s, ...{
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        salary: updated.salary,
        joinDate: updated.joinDate,
        status: updated.status
      }} : s)));

      closeEditModal();
    } catch (err) {
      setFormError(err.message || 'Unable to update staff');
    }
  };

  const handleToggleStatus = async (staff) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('janro_token');
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';

    if (!staff._id) {
      setStaffList((prev) => prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s)));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${staff._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Status update failed');

      setStaffList((prev) => prev.map((s) => (s._id === staff._id ? { ...s, status: newStatus } : s)));
    } catch (err) {
      console.error('Toggle status error', err);
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (!confirm(`Delete ${staff.name}? This action cannot be undone.`)) return;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('janro_token');

    if (!staff._id) {
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${staff._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');

      setStaffList((prev) => prev.filter((s) => s._id !== staff._id));
    } catch (err) {
      console.error('Delete error', err);
      alert(err.message || 'Unable to delete staff');
    }
  };

  const handleAddStaff = (e) => {
    e.preventDefault();

    if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.salary || !newStaff.joinDate) {
      setFormError('Please fill all required fields.');
      return;
    }
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('janro_token');

    (async () => {
      try {
        setFormError('');
        const body = {
          name: newStaff.name.trim(),
          email: newStaff.email.trim(),
          phone: newStaff.phone.trim(),
          role: newStaff.role,
          department: newStaff.department,
          salary: Number(newStaff.salary),
          joinDate: newStaff.joinDate,
          status: newStaff.status
        };

        const res = await fetch(`${API_BASE}/api/auth/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to add staff');
        }

        const user = data.data;
        const nextId = String(staffList.length + 1).padStart(3, '0');
        const createdStaff = {
          id: nextId,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || newStaff.phone,
          role: user.role,
          department: user.department || newStaff.department,
          salary: user.salary || Number(newStaff.salary),
          joinDate: user.joinDate || newStaff.joinDate,
          status: user.status || newStaff.status
        };

        setStaffList((prev) => [createdStaff, ...prev]);
        handleCloseModal();
      } catch (err) {
        setFormError(err.message || 'Unable to add staff');
      }
    })();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">Hotel Janro</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Users & Staff Management
          </h1>
          <p className="text-slate-300 mt-2">
            Manage staff members, roles, and access permissions
          </p>
        </div>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-xl font-medium transition-colors shadow-lg shadow-[#D4AF37]/20 self-start sm:self-center whitespace-nowrap"
          onClick={handleOpenModal}
        >
          <UserPlus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="admin-staff-stat-icon admin-staff-stat-icon--blue"><UsersIcon /></div>
            <div><p className="text-sm text-gray-600">Total Staff</p><h3 className="text-2xl font-semibold text-gray-900">{totalStaff}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="admin-staff-stat-icon admin-staff-stat-icon--green"><Briefcase /></div>
            <div><p className="text-sm text-gray-600">Active Staff</p><h3 className="text-2xl font-semibold text-gray-900">{activeStaff}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="admin-staff-stat-icon admin-staff-stat-icon--purple"><DollarSign /></div>
            <div><p className="text-sm text-gray-600">Total Salary</p><h3 className="text-2xl font-semibold text-gray-900">{settings.currency.symbol}{totalSalary.toLocaleString()}/mo</h3></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="admin-staff-search-wrap">
              <Search className="admin-staff-search-icon" />
              <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="admin-staff-input" />
              </div>
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="admin-staff-select lg:w-48">
              <option>All</option><option>Manager</option><option>Receptionist</option><option>Chef</option><option>Waiter</option><option>Housekeeping</option><option>Security</option><option>Maintenance</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-staff-select lg:w-40">
              <option>All</option><option>Active</option><option>Inactive</option><option>On Leave</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-staff-table">
            <thead className="admin-staff-table-head">
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="admin-staff-table-body">
              {filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td className="admin-staff-table-cell"><span className="admin-staff-id">#STF-{staff.id.padStart(3, '0')}</span></td>
                  <td className="admin-staff-table-cell">
                    <div className="flex items-center gap-3">
                      <div className="admin-staff-avatar">
                        {staff.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div><div className="admin-staff-name">{staff.name}</div></div>
                    </div>
                  </td>
                  <td className="admin-staff-table-cell"><div><div className="admin-staff-contact-email text-gray-900">{staff.email}</div><div className="admin-staff-contact-phone">{staff.phone}</div></div></td>
                  <td className="admin-staff-table-cell"><span className={`admin-staff-role-badge ${getRoleBadgeColor(staff.role)}`}>{staff.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1).toLowerCase() : ''}</span></td>
                  <td className="admin-staff-table-cell">{staff.department}</td>
                  <td className="admin-staff-table-cell"><span className="admin-staff-salary">{settings.currency.symbol}{staff.salary.toLocaleString()}</span></td>
                  <td className="admin-staff-table-cell">{new Date(staff.joinDate).toLocaleDateString()}</td>
                  <td className="admin-staff-table-cell"><span className={`admin-staff-status-badge ${getStatusColor(staff.status)}`}>{staff.status ? staff.status.charAt(0).toUpperCase() + staff.status.slice(1).toLowerCase() : ''}</span></td>
                  <td className="admin-staff-table-cell">
                    <button className="admin-staff-action-link admin-staff-action-link--edit" onClick={() => openEditModal(staff)}>Edit</button>
                    <button className="admin-staff-action-link admin-staff-action-link--toggle" onClick={() => handleToggleStatus(staff)}>{staff.status === 'Active' ? 'Disable' : 'Enable'}</button>
                    <button className="admin-staff-action-link admin-staff-action-link--delete" onClick={() => handleDeleteStaff(staff)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (<div className="py-12 text-center"><p className="text-gray-500">No staff members found</p></div>)}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="admin-staff-modal-overlay" role="dialog" aria-modal="true" aria-label="Add staff member dialog">
          <div className="admin-staff-modal-card">
            <div className="admin-staff-modal-header">
              <div>
                <h2 className="admin-staff-modal-title">Add Staff Member</h2>
                <p className="admin-staff-modal-subtitle">Enter new staff details to add them to the table.</p>
              </div>
              <button type="button" className="admin-staff-close-button" onClick={handleCloseModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="admin-staff-modal-form">
              {formError && <p className="admin-staff-form-error">{formError}</p>}

              <div className="admin-staff-form-grid">
                <label className="admin-staff-form-label">
                  Full Name
                  <input
                    className="admin-staff-form-input"
                    value={newStaff.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Email
                  <input
                    type="email"
                    className="admin-staff-form-input"
                    value={newStaff.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="name@hoteljanro.com"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Phone
                  <input
                    className="admin-staff-form-input"
                    value={newStaff.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Role
                  <select
                    className="admin-staff-form-input"
                    value={newStaff.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                  >
                    <option>Manager</option>
                    <option>Receptionist</option>
                    <option>Chef</option>
                    <option>Waiter</option>
                    <option>Housekeeping</option>
                    <option>Security</option>
                    <option>Maintenance</option>
                  </select>
                </label>

                <label className="admin-staff-form-label">
                  Department
                  <select
                    className="admin-staff-form-input"
                    value={newStaff.department}
                    onChange={(e) => handleFieldChange('department', e.target.value)}
                  >
                    <option>Front Office</option>
                    <option>Housekeeping</option>
                    <option>Food & Beverage</option>
                    <option>Kitchen</option>
                    <option>Maintenance</option>
                    <option>Security</option>
                    <option>Administration</option>
                    <option>Sales & Marketing</option>
                  </select>
                </label>

                <label className="admin-staff-form-label">
                  Monthly Salary
                  <input
                    type="number"
                    min="0"
                    className="admin-staff-form-input"
                    value={newStaff.salary}
                    onChange={(e) => handleFieldChange('salary', e.target.value)}
                    placeholder="90000"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Join Date
                  <input
                    type="date"
                    className="admin-staff-form-input"
                    value={newStaff.joinDate}
                    onChange={(e) => handleFieldChange('joinDate', e.target.value)}
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Status
                  <select
                    className="admin-staff-form-input"
                    value={newStaff.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                </label>
              </div>

              <div className="admin-staff-modal-actions">
                <button type="button" className="admin-staff-secondary-button" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="admin-staff-primary-button">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editStaff && (
        <div className="admin-staff-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit staff member dialog">
          <div className="admin-staff-modal-card">
            <div className="admin-staff-modal-header">
              <div>
                <h2 className="admin-staff-modal-title">Edit Staff Member</h2>
                <p className="admin-staff-modal-subtitle">Update staff details.</p>
              </div>
              <button type="button" className="admin-staff-close-button" onClick={closeEditModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="admin-staff-modal-form">
              {formError && <p className="admin-staff-form-error">{formError}</p>}

              <div className="admin-staff-form-grid">
                <label className="admin-staff-form-label">
                  Full Name
                  <input
                    className="admin-staff-form-input"
                    value={editStaff.name}
                    onChange={(e) => setEditStaff((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Email
                  <input
                    type="email"
                    className="admin-staff-form-input"
                    value={editStaff.email}
                    onChange={(e) => setEditStaff((p) => ({ ...p, email: e.target.value }))}
                    placeholder="name@hoteljanro.com"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Phone
                  <input
                    className="admin-staff-form-input"
                    value={editStaff.phone}
                    onChange={(e) => setEditStaff((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+94 7X XXX XXXX"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Role
                  <select
                    className="admin-staff-form-input"
                    value={editStaff.role}
                    onChange={(e) => setEditStaff((p) => ({ ...p, role: e.target.value }))}
                  >
                    <option>Manager</option>
                    <option>Receptionist</option>
                    <option>Chef</option>
                    <option>Waiter</option>
                    <option>Housekeeping</option>
                    <option>Security</option>
                    <option>Maintenance</option>
                  </select>
                </label>

                <label className="admin-staff-form-label">
                  Department
                  <select
                    className="admin-staff-form-input"
                    value={editStaff.department}
                    onChange={(e) => setEditStaff((p) => ({ ...p, department: e.target.value }))}
                  >
                    <option>Front Office</option>
                    <option>Housekeeping</option>
                    <option>Food & Beverage</option>
                    <option>Kitchen</option>
                    <option>Maintenance</option>
                    <option>Security</option>
                    <option>Administration</option>
                    <option>Sales & Marketing</option>
                  </select>
                </label>

                <label className="admin-staff-form-label">
                  Monthly Salary
                  <input
                    type="number"
                    min="0"
                    className="admin-staff-form-input"
                    value={editStaff.salary}
                    onChange={(e) => setEditStaff((p) => ({ ...p, salary: e.target.value }))}
                    placeholder="90000"
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Join Date
                  <input
                    type="date"
                    className="admin-staff-form-input"
                    value={editStaff.joinDate}
                    onChange={(e) => setEditStaff((p) => ({ ...p, joinDate: e.target.value }))}
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Status
                  <select
                    className="admin-staff-form-input"
                    value={editStaff.status}
                    onChange={(e) => setEditStaff((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                </label>
              </div>

              <div className="admin-staff-modal-actions">
                <button type="button" className="admin-staff-secondary-button" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="admin-staff-primary-button">Update Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
