import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users as UsersIcon, Briefcase, DollarSign, X, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { apiFetch } from '../../../api';
import './AdminStaff.css';
const calculateDuration = (start, end) => {
  if (!start || !end) return 0;
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let diff = (eH * 60 + eM) - (sH * 60 + sM);
  if (diff < 0) diff += 24 * 60; // Handle overnight  shifts
  return (diff / 60).toFixed(2);
};

export function AdminStaff() {
  const { settings } = useSettings();
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterEmployment, setFilterEmployment] = useState('All');
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
    status: 'Active',
    nic: '',
    employeeId: '',
    address: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    employmentType: 'permanent',
    hourlyRate: '',
    startTime: '',
    endTime: '',
    additionalHours: ''
  });
  const [formError, setFormError] = useState('');
  const [editStaff, setEditStaff] = useState(null);

  // Co-Admin State and Modals
  const [coAdmin, setCoAdmin] = useState(null);
  const [isCoAdminModalOpen, setIsCoAdminModalOpen] = useState(false);
  const [isEditingCoAdmin, setIsEditingCoAdmin] = useState(false);
  const [coAdminForm, setCoAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [showCoAdminPassword, setShowCoAdminPassword] = useState(false);

  const fetchStaff = async () => {
    try {
      const data = await apiFetch('/auth/users');
      if (data.success && data.data) {
        // Filter to show only staff/non-customer users
        const staffRoles = ['staff', 'manager', 'receptionist', 'chef', 'waiter', 'housekeeping', 'security', 'maintenance', 'cashier'];
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
          status: u.status || 'Active',
          nic: u.nic || '',
          employeeId: u.employeeId || '',
          address: u.address || '',
          emergencyContact: u.emergencyContact || '',
          emergencyContactPhone: u.emergencyContactPhone || '',
          employmentType: u.employmentType || 'permanent',
          hourlyRate: u.hourlyRate || 0,
          startTime: u.startTime || '',
          endTime: u.endTime || '',
          additionalHours: u.additionalHours || 0,
          bonus: u.bonus || 0
        }));

        setStaffList(formattedStaff);

        // Find the co-admin
        const currentUser = JSON.parse(localStorage.getItem('janro_user') || '{}');
        const otherAdmins = data.data.filter(u => u.role?.toLowerCase() === 'admin' && u.email !== currentUser.email);
        setCoAdmin(otherAdmins[0] || null);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  // Fetch staff from backend on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateCoAdminClick = () => {
    setFormError('');
    setCoAdminForm({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setIsEditingCoAdmin(false);
    setIsCoAdminModalOpen(true);
  };

  const handleEditCoAdminClick = () => {
    setFormError('');
    setCoAdminForm({
      name: coAdmin.name || '',
      email: coAdmin.email || '',
      phone: coAdmin.phone || '',
      password: ''
    });
    setIsEditingCoAdmin(true);
    setIsCoAdminModalOpen(true);
  };

  const handleDeleteCoAdminClick = async () => {
    if (!coAdmin) return;
    if (!confirm(`Are you sure you want to delete the co-admin account for ${coAdmin.name}? This action cannot be undone.`)) return;

    try {
      const data = await apiFetch(`/auth/users/${coAdmin._id}`, {
        method: 'DELETE'
      });
      if (!data.success) throw new Error(data.message || 'Failed to delete co-admin');
      
      setCoAdmin(null);
      alert('Co-Admin account deleted successfully.');
    } catch (err) {
      console.error('Delete co-admin error', err);
      alert(err.message || 'Unable to delete co-admin');
    }
  };

  const handleSaveCoAdmin = async (e) => {
    e.preventDefault();
    if (!coAdminForm.name || !coAdminForm.email || (!isEditingCoAdmin && !coAdminForm.password)) {
      setFormError('Name, Email, and Password are required.');
      return;
    }

    try {
      setFormError('');
      if (isEditingCoAdmin) {
        // Edit existing co-admin
        const body = {
          name: coAdminForm.name.trim(),
          email: coAdminForm.email.trim(),
          phone: coAdminForm.phone.trim(),
          role: 'admin'
        };
        if (coAdminForm.password) {
          body.password = coAdminForm.password;
          body.confirmPassword = coAdminForm.password;
        }

        const data = await apiFetch(`/auth/users/${coAdmin._id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        if (!data.success) throw new Error(data.message || 'Failed to update co-admin');
        
        await fetchStaff();
        setIsCoAdminModalOpen(false);
        alert('Co-Admin account updated successfully.');
      } else {
        // Create new co-admin
        const body = {
          name: coAdminForm.name.trim(),
          email: coAdminForm.email.trim(),
          phone: coAdminForm.phone.trim(),
          role: 'admin',
          password: coAdminForm.password,
          confirmPassword: coAdminForm.password,
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0]
        };

        const data = await apiFetch('/auth/users', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        if (!data.success) throw new Error(data.message || 'Failed to create co-admin');
        
        await fetchStaff();
        setIsCoAdminModalOpen(false);
        alert('Co-Admin account created successfully.');
      }
    } catch (err) {
      setFormError(err.message || 'Unable to save co-admin account');
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      (staff.name && staff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'All' || (staff.role && staff.role.toLowerCase() === filterRole.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (staff.status && staff.status.toLowerCase() === filterStatus.toLowerCase());
    const matchesEmployment = filterEmployment === 'All' || (staff.employmentType && staff.employmentType.toLowerCase() === filterEmployment.toLowerCase());
    return matchesSearch && matchesRole && matchesStatus && matchesEmployment;
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
      case 'admin': return 'bg-amber-100 text-amber-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'receptionist': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-teal-100 text-teal-800';
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
  
  const calculateMonthlySalary = (staff) => {
    if (!staff) return 0;
    if (staff.employmentType === 'temporary') {
      const duration = calculateDuration(staff.startTime, staff.endTime);
      const basePay = (staff.hourlyRate || 0) * duration;
      const otPay = (staff.additionalHours || 0) * 300;
      return basePay + otPay;
    } else {
      const basePay = Number(staff.salary) || 0;
      const otPay = (staff.additionalHours || 0) * 300;
      const bonusPay = Number(staff.bonus) || 0;
      return basePay + otPay + bonusPay;
    }
  };

  const totalSalary = staffList.reduce((sum, staff) => sum + calculateMonthlySalary(staff), 0);

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
      status: 'Active',
      employmentType: 'permanent',
      hourlyRate: '',
      startTime: '',
      endTime: '',
      additionalHours: '',
      bonus: ''
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
      status: staff.status || 'Active',
      nic: staff.nic || '',
      employeeId: staff.employeeId || '',
      address: staff.address || '',
      emergencyContact: staff.emergencyContact || '',
      emergencyContactPhone: staff.emergencyContactPhone || '',
      employmentType: staff.employmentType || 'permanent',
      hourlyRate: staff.hourlyRate || '',
      startTime: staff.startTime || '',
      endTime: staff.endTime || '',
      additionalHours: staff.additionalHours || '',
      bonus: staff.bonus || ''
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

    if (!editStaff.name || !editStaff.email || !editStaff.nic || !editStaff.joinDate) {
      setFormError('Name, email, NIC, and Join Date are required');
      return;
    }

    if (new Date(editStaff.joinDate) > new Date()) {
      setFormError('Join date cannot be in the future.');
      return;
    }

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
        status: editStaff.status,
        nic: editStaff.nic,
        employeeId: editStaff.employeeId,
        address: editStaff.address,
        emergencyContact: editStaff.emergencyContact,
        emergencyContactPhone: editStaff.emergencyContactPhone,
        employmentType: editStaff.employmentType,
        hourlyRate: Number(editStaff.hourlyRate) || 0,
        startTime: editStaff.startTime,
        endTime: editStaff.endTime,
        additionalHours: Number(editStaff.additionalHours) || 0,
        bonus: Number(editStaff.bonus) || 0
      };

      const data = await apiFetch(`/auth/users/${editStaff._id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      if (!data.success) throw new Error(data.message || 'Update failed');

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
        status: updated.status,
        employmentType: updated.employmentType,
        hourlyRate: updated.hourlyRate,
        startTime: updated.startTime,
        endTime: updated.endTime,
        additionalHours: updated.additionalHours,
        bonus: updated.bonus
      }} : s)));

      closeEditModal();
    } catch (err) {
      setFormError(err.message || 'Unable to update staff');
    }
  };

  const handleToggleStatus = async (staff) => {
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';

    if (!staff._id) {
      setStaffList((prev) => prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s)));
      return;
    }

    try {
      const data = await apiFetch(`/auth/users/${staff._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (!data.success) throw new Error(data.message || 'Status update failed');

      setStaffList((prev) => prev.map((s) => (s._id === staff._id ? { ...s, status: newStatus } : s)));
    } catch (err) {
      console.error('Toggle status error', err);
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (!confirm(`Delete ${staff.name}? This action cannot be undone.`)) return;

    if (!staff._id) {
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      return;
    }

    try {
      const data = await apiFetch(`/auth/users/${staff._id}`, {
        method: 'DELETE'
      });
      if (!data.success) throw new Error(data.message || 'Delete failed');

      setStaffList((prev) => prev.filter((s) => s._id !== staff._id));
    } catch (err) {
      console.error('Delete error', err);
      alert(err.message || 'Unable to delete staff');
    }
  };

  const handleAddStaff = (e) => {
    e.preventDefault();

    if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.joinDate || !newStaff.nic) {
      setFormError('Please fill all required fields (including NIC).');
      return;
    }

    if (new Date(newStaff.joinDate) > new Date()) {
      setFormError('Join date cannot be in the future.');
      return;
    }
    
    if (newStaff.employmentType === 'permanent' && !newStaff.salary) {
      setFormError('Monthly salary is required for permanent staff.');
      return;
    }
    
    if (newStaff.employmentType === 'temporary') {
      if (!newStaff.hourlyRate) {
        setFormError('Hourly rate is required for temporary staff.');
        return;
      }
      if (!newStaff.startTime || !newStaff.endTime) {
        setFormError('Start time and end time are required for temporary staff.');
        return;
      }
    }

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
          status: newStaff.status,
          nic: newStaff.nic,
          employeeId: newStaff.employeeId,
          address: newStaff.address,
          emergencyContact: newStaff.emergencyContact,
          emergencyContactPhone: newStaff.emergencyContactPhone,
          employmentType: newStaff.employmentType,
          hourlyRate: Number(newStaff.hourlyRate) || 0,
          startTime: newStaff.startTime,
          endTime: newStaff.endTime,
          additionalHours: Number(newStaff.additionalHours) || 0,
          bonus: Number(newStaff.bonus) || 0
        };

        const data = await apiFetch('/auth/users', {
          method: 'POST',
          body: JSON.stringify(body)
        });

        if (!data.success) {
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
          status: user.status || newStaff.status,
          nic: user.nic || newStaff.nic,
          employeeId: user.employeeId || newStaff.employeeId,
          address: user.address || newStaff.address,
          emergencyContact: user.emergencyContact || newStaff.emergencyContact,
          emergencyContactPhone: user.emergencyContactPhone || newStaff.emergencyContactPhone,
          employmentType: user.employmentType || newStaff.employmentType,
          hourlyRate: user.hourlyRate || Number(newStaff.hourlyRate),
          startTime: user.startTime || newStaff.startTime,
          endTime: user.endTime || newStaff.endTime,
          additionalHours: user.additionalHours || Number(newStaff.additionalHours),
          bonus: user.bonus || Number(newStaff.bonus) || 0
        };

        setStaffList((prev) => [createdStaff, ...prev]);
        handleCloseModal();
        if (user.tempPassword) {
          if (data.emailSent) {
            alert(`Staff member added successfully!\n\nTemporary Password: ${user.tempPassword}\n\nA welcome email containing these credentials has been sent successfully to: ${user.email}`);
          } else {
            alert(`Staff member added successfully, but the welcome email could not be sent (SMTP email configuration may be missing or offline).\n\nTemporary Password: ${user.tempPassword}\n\nIMPORTANT: Please copy and save this password now and share it directly with the staff member, as they did not receive the email.`);
          }
        }
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
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3">{settings.hotelName}</p>
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

      {/* Co-Admin Account Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Co-Admin Account</h3>
          <p className="text-sm text-gray-500 mt-1">
            {coAdmin 
              ? `A secondary admin account is active: ${coAdmin.name} (${coAdmin.email})` 
              : "No secondary admin account has been created yet. You can create exactly one co-admin account."}
          </p>
        </div>
        <div>
          {coAdmin ? (
            <div className="flex gap-2">
              <button 
                onClick={handleEditCoAdminClick}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors border border-slate-200"
              >
                Edit Co-Admin
              </button>
              <button 
                onClick={handleDeleteCoAdminClick}
                className="px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors border border-red-100"
              >
                Delete Co-Admin
              </button>
            </div>
          ) : (
            <button 
              onClick={handleCreateCoAdminClick}
              className="px-4 py-2 text-sm bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Create Co-Admin
            </button>
          )}
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
              <option>All</option><option>Manager</option><option>Receptionist</option><option>Cashier</option><option>Chef</option><option>Waiter</option><option>Housekeeping</option><option>Security</option><option>Maintenance</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="admin-staff-select lg:w-40">
              <option>All</option><option>Active</option><option>Inactive</option><option>On Leave</option>
            </select>
            <select value={filterEmployment} onChange={(e) => setFilterEmployment(e.target.value)} className="admin-staff-select lg:w-40">
              <option value="All">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
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
                <th>Pay</th>
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
                  <td className="admin-staff-table-cell">
                    {staff.employmentType === 'temporary' ? (
                      <div className="flex flex-col">
                        <span className="admin-staff-salary">
                          {settings.currency.symbol}
                          {calculateMonthlySalary(staff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {staff.startTime && staff.endTime ? `${staff.startTime} - ${staff.endTime} (${calculateDuration(staff.startTime, staff.endTime)}h)` : 'No times set'}
                        </span>
                        {(staff.additionalHours > 0) && (
                           <span className="text-xs text-orange-500 font-medium">+ {staff.additionalHours}h Extra</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="admin-staff-salary">
                          {settings.currency.symbol}
                          {calculateMonthlySalary(staff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500">
                          Base: {settings.currency.symbol}{(staff.salary || 0).toLocaleString()}
                        </span>
                        {(staff.additionalHours > 0) && (
                          <span className="text-xs text-orange-500 font-medium">+ {staff.additionalHours}h OT ({settings.currency.symbol}{(staff.additionalHours * 300).toLocaleString()})</span>
                        )}
                        {(staff.bonus > 0) && (
                          <span className="text-xs text-green-600 font-medium">+ Bonus: {settings.currency.symbol}{(staff.bonus || 0).toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="admin-staff-table-cell">{new Date(staff.joinDate).toLocaleDateString()}</td>
                  <td className="admin-staff-table-cell"><span className={`admin-staff-status-badge ${getStatusColor(staff.status)}`}>{staff.status ? staff.status.charAt(0).toUpperCase() + staff.status.slice(1).toLowerCase() : ''}</span></td>
                  <td className="admin-staff-table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-slate-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        onClick={() => openEditModal(staff)}
                        title="Edit Staff"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                        title={staff.status === 'Active' ? 'Disable Staff' : 'Enable Staff'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            staff.status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>

                      <button 
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDeleteStaff(staff)}
                        title="Delete Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                    <option>Cashier</option>
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
                  Employment Type
                  <select
                    className="admin-staff-form-input"
                    value={newStaff.employmentType}
                    onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                  >
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </label>

                {newStaff.employmentType === 'permanent' ? (
                  <>
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
                      OT Hours (Rs. 300/hr)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="admin-staff-form-input"
                        value={newStaff.additionalHours}
                        onChange={(e) => handleFieldChange('additionalHours', e.target.value)}
                        placeholder="e.g. 10"
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Monthly Bonus
                      <input
                        type="number"
                        min="0"
                        className="admin-staff-form-input"
                        value={newStaff.bonus}
                        onChange={(e) => handleFieldChange('bonus', e.target.value)}
                        placeholder="e.g. 5000"
                      />
                    </label>
                    <div className="admin-staff-form-label col-span-1 sm:col-span-2 md:col-span-1 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col justify-center">
                       <span className="text-sm font-medium text-blue-900 mb-1">Payment Summary</span>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-blue-700">Base Salary:</span>
                         <span className="text-sm font-semibold text-blue-900">{settings.currency.symbol}{(Number(newStaff.salary) || 0).toLocaleString()}</span>
                       </div>
                       {(newStaff.additionalHours > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-orange-600">OT Pay (Rs. 300/hr):</span>
                         <span className="text-sm font-semibold text-orange-600">+{settings.currency.symbol}{(newStaff.additionalHours * 300).toLocaleString()}</span>
                       </div>
                       )}
                       {(newStaff.bonus > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-green-600">Bonus:</span>
                         <span className="text-sm font-semibold text-green-600">+{settings.currency.symbol}{(Number(newStaff.bonus) || 0).toLocaleString()}</span>
                       </div>
                       )}
                       <div className="flex justify-between items-center mt-1 border-t border-blue-200 pt-1">
                         <span className="text-xs text-blue-700">Total Month's Pay:</span>
                         <span className="text-sm font-bold text-blue-900">{settings.currency.symbol}{((Number(newStaff.salary) || 0) + (Number(newStaff.additionalHours || 0) * 300) + (Number(newStaff.bonus || 0))).toLocaleString()}</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="admin-staff-form-label">
                      Hourly Rate
                      <input
                        type="number"
                        min="0"
                        className="admin-staff-form-input"
                        value={newStaff.hourlyRate}
                        onChange={(e) => handleFieldChange('hourlyRate', e.target.value)}
                        placeholder="500"
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Start Time
                      <input
                        type="time"
                        className="admin-staff-form-input"
                        value={newStaff.startTime}
                        onChange={(e) => handleFieldChange('startTime', e.target.value)}
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      End Time
                      <input
                        type="time"
                        className="admin-staff-form-input"
                        value={newStaff.endTime}
                        onChange={(e) => handleFieldChange('endTime', e.target.value)}
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Additional Hours (OT)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="admin-staff-form-input"
                        value={newStaff.additionalHours}
                        onChange={(e) => handleFieldChange('additionalHours', e.target.value)}
                        placeholder="e.g. 2"
                      />
                    </label>
                    <div className="admin-staff-form-label col-span-1 sm:col-span-2 md:col-span-1 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col justify-center">
                       <span className="text-sm font-medium text-blue-900 mb-1">Shift Summary</span>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-blue-700">Calculated Duration:</span>
                         <span className="text-sm font-bold text-blue-900">{calculateDuration(newStaff.startTime, newStaff.endTime)} hrs</span>
                       </div>
                       {(newStaff.additionalHours > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-orange-600">Extra Pay (Rs. 300/hr):</span>
                         <span className="text-sm font-bold text-orange-600">+{settings.currency.symbol}{((newStaff.additionalHours || 0) * 300).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                       )}
                       <div className="flex justify-between items-center mt-1 border-t border-blue-200 pt-1">
                         <span className="text-xs text-blue-700">Total Shift Pay:</span>
                         <span className="text-sm font-bold text-blue-900">{settings.currency.symbol}{((newStaff.hourlyRate * calculateDuration(newStaff.startTime, newStaff.endTime)) + ((newStaff.additionalHours || 0) * 300)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                    </div>
                  </>
                )}

                <label className="admin-staff-form-label">
                  Join Date
                  <input
                    type="date"
                    className="admin-staff-form-input"
                    value={newStaff.joinDate}
                    onChange={(e) => handleFieldChange('joinDate', e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
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

                <label className="admin-staff-form-label">
                  NIC Number *
                  <input
                    className="admin-staff-form-input"
                    value={newStaff.nic}
                    onChange={(e) => handleFieldChange('nic', e.target.value)}
                    placeholder="e.g. 19XXXXXXXXXX"
                    required
                  />
                </label>



                <label className="admin-staff-form-label col-span-2">
                  Address
                  <textarea
                    className="admin-staff-form-input"
                    value={newStaff.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Enter full residential address"
                    rows="2"
                  />
                </label>

                <label className="admin-staff-form-label">
                  Emergency Contact Name
                  <input
                    className="admin-staff-form-input"
                    value={newStaff.emergencyContact}
                    onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                    placeholder="Name of contact person"
                  />
                </label>

                <label className="admin-staff-form-label">
                  Emergency Contact Phone
                  <input
                    className="admin-staff-form-input"
                    value={newStaff.emergencyContactPhone}
                    onChange={(e) => handleFieldChange('emergencyContactPhone', e.target.value)}
                    placeholder="Phone of contact person"
                  />
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
                    <option>Cashier</option>
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
                  Employment Type
                  <select
                    className="admin-staff-form-input"
                    value={editStaff.employmentType}
                    onChange={(e) => setEditStaff((p) => ({ ...p, employmentType: e.target.value }))}
                  >
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </label>

                {editStaff.employmentType === 'permanent' ? (
                  <>
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
                      OT Hours (Rs. 300/hr)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="admin-staff-form-input"
                        value={editStaff.additionalHours}
                        onChange={(e) => setEditStaff((p) => ({ ...p, additionalHours: e.target.value }))}
                        placeholder="e.g. 10"
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Monthly Bonus
                      <input
                        type="number"
                        min="0"
                        className="admin-staff-form-input"
                        value={editStaff.bonus}
                        onChange={(e) => setEditStaff((p) => ({ ...p, bonus: e.target.value }))}
                        placeholder="e.g. 5000"
                      />
                    </label>
                    <div className="admin-staff-form-label col-span-1 sm:col-span-2 md:col-span-1 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col justify-center">
                       <span className="text-sm font-medium text-blue-900 mb-1">Payment Summary</span>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-blue-700">Base Salary:</span>
                         <span className="text-sm font-semibold text-blue-900">{settings.currency.symbol}{(Number(editStaff.salary) || 0).toLocaleString()}</span>
                       </div>
                       {(editStaff.additionalHours > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-orange-600">OT Pay (Rs. 300/hr):</span>
                         <span className="text-sm font-semibold text-orange-600">+{settings.currency.symbol}{(editStaff.additionalHours * 300).toLocaleString()}</span>
                       </div>
                       )}
                       {(editStaff.bonus > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-green-600">Bonus:</span>
                         <span className="text-sm font-semibold text-green-600">+{settings.currency.symbol}{(Number(editStaff.bonus) || 0).toLocaleString()}</span>
                       </div>
                       )}
                       <div className="flex justify-between items-center mt-1 border-t border-blue-200 pt-1">
                         <span className="text-xs text-blue-700">Total Month's Pay:</span>
                         <span className="text-sm font-bold text-blue-900">{settings.currency.symbol}{((Number(editStaff.salary) || 0) + (Number(editStaff.additionalHours || 0) * 300) + (Number(editStaff.bonus || 0))).toLocaleString()}</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="admin-staff-form-label">
                      Hourly Rate
                      <input
                        type="number"
                        min="0"
                        className="admin-staff-form-input"
                        value={editStaff.hourlyRate}
                        onChange={(e) => setEditStaff((p) => ({ ...p, hourlyRate: e.target.value }))}
                        placeholder="500"
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Start Time
                      <input
                        type="time"
                        className="admin-staff-form-input"
                        value={editStaff.startTime}
                        onChange={(e) => setEditStaff((p) => ({ ...p, startTime: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      End Time
                      <input
                        type="time"
                        className="admin-staff-form-input"
                        value={editStaff.endTime}
                        onChange={(e) => setEditStaff((p) => ({ ...p, endTime: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="admin-staff-form-label">
                      Additional Hours (OT)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="admin-staff-form-input"
                        value={editStaff.additionalHours}
                        onChange={(e) => setEditStaff((p) => ({ ...p, additionalHours: e.target.value }))}
                        placeholder="e.g. 2"
                      />
                    </label>
                    <div className="admin-staff-form-label col-span-1 sm:col-span-2 md:col-span-1 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col justify-center">
                       <span className="text-sm font-medium text-blue-900 mb-1">Shift Summary</span>
                       <div className="flex justify-between items-center">
                         <span className="text-xs text-blue-700">Calculated Duration:</span>
                         <span className="text-sm font-bold text-blue-900">{calculateDuration(editStaff.startTime, editStaff.endTime)} hrs</span>
                       </div>
                       {(editStaff.additionalHours > 0) && (
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-orange-600">Extra Pay (Rs. 300/hr):</span>
                         <span className="text-sm font-bold text-orange-600">+{settings.currency.symbol}{((editStaff.additionalHours || 0) * 300).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                       )}
                       <div className="flex justify-between items-center mt-1 border-t border-blue-200 pt-1">
                         <span className="text-xs text-blue-700">Total Shift Pay:</span>
                         <span className="text-sm font-bold text-blue-900">{settings.currency.symbol}{((editStaff.hourlyRate * calculateDuration(editStaff.startTime, editStaff.endTime)) + ((editStaff.additionalHours || 0) * 300)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                       </div>
                    </div>
                  </>
                )}

                <label className="admin-staff-form-label">
                  Join Date
                  <input
                    type="date"
                    className="admin-staff-form-input"
                    value={editStaff.joinDate}
                    onChange={(e) => setEditStaff((p) => ({ ...p, joinDate: e.target.value }))}
                    max={new Date().toISOString().slice(0, 10)}
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

                <label className="admin-staff-form-label">
                  NIC Number *
                  <input
                    className="admin-staff-form-input"
                    value={editStaff.nic}
                    onChange={(e) => setEditStaff((p) => ({ ...p, nic: e.target.value }))}
                    placeholder="e.g. 19XXXXXXXXXX"
                    required
                  />
                </label>



                <label className="admin-staff-form-label col-span-2">
                  Address
                  <textarea
                    className="admin-staff-form-input"
                    value={editStaff.address}
                    onChange={(e) => setEditStaff((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Enter full residential address"
                    rows="2"
                  />
                </label>

                <label className="admin-staff-form-label">
                  Emergency Contact Name
                  <input
                    className="admin-staff-form-input"
                    value={editStaff.emergencyContact}
                    onChange={(e) => setEditStaff((p) => ({ ...p, emergencyContact: e.target.value }))}
                    placeholder="Name of contact person"
                  />
                </label>

                <label className="admin-staff-form-label">
                  Emergency Contact Phone
                  <input
                    className="admin-staff-form-input"
                    value={editStaff.emergencyContactPhone}
                    onChange={(e) => setEditStaff((p) => ({ ...p, emergencyContactPhone: e.target.value }))}
                    placeholder="Phone of contact person"
                  />
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

      {/* Co-Admin Create/Edit Modal */}
      {isCoAdminModalOpen && (
        <div className="admin-staff-modal-overlay">
          <div className="admin-staff-modal-content max-w-lg">
            <div className="admin-staff-modal-header">
              <h2 className="admin-staff-modal-title">{isEditingCoAdmin ? 'Edit Co-Admin Account' : 'Create Co-Admin Account'}</h2>
              <button className="admin-staff-modal-close" onClick={() => setIsCoAdminModalOpen(false)}>
                <X />
              </button>
            </div>
            
            {formError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCoAdmin}>
              <div className="grid grid-cols-1 gap-4 py-4">
                <label className="admin-staff-form-label">
                  Name *
                  <input
                    type="text"
                    className="admin-staff-form-input"
                    value={coAdminForm.name}
                    onChange={(e) => setCoAdminForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </label>

                <label className="admin-staff-form-label">
                  Email Address *
                  <input
                    type="email"
                    className="admin-staff-form-input"
                    value={coAdminForm.email}
                    onChange={(e) => setCoAdminForm(p => ({ ...p, email: e.target.value }))}
                    required
                    disabled={isEditingCoAdmin}
                  />
                </label>

                <label className="admin-staff-form-label">
                  Phone Number
                  <input
                    type="tel"
                    className="admin-staff-form-input"
                    value={coAdminForm.phone}
                    onChange={(e) => setCoAdminForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 0771234567"
                  />
                </label>

                    <label className="admin-staff-form-label">
                      Password {isEditingCoAdmin ? '(Leave blank to keep current)' : '*'}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type={showCoAdminPassword ? "text" : "password"}
                          className="admin-staff-form-input"
                          style={{ paddingRight: '40px', width: '100%' }}
                          value={coAdminForm.password}
                          onChange={(e) => setCoAdminForm(p => ({ ...p, password: e.target.value }))}
                          required={!isEditingCoAdmin}
                          placeholder={isEditingCoAdmin ? "••••••••" : "Enter password"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCoAdminPassword(!showCoAdminPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B'
                          }}
                        >
                          {showCoAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </label>
              </div>

              <div className="admin-staff-modal-actions mt-4">
                <button type="button" className="admin-staff-secondary-button" onClick={() => setIsCoAdminModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-staff-primary-button">
                  {isEditingCoAdmin ? 'Save Changes' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
