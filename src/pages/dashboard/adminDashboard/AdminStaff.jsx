import React, { useState } from 'react';
import { Search, Edit2, Trash2, UserPlus, Users as UsersIcon, Briefcase, DollarSign } from 'lucide-react';
import { staffMembers } from '../../../data/newMockData.js';
import './AdminStaff.css';

export function AdminStaff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'All' || staff.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Manager': return 'bg-purple-100 text-purple-800';
      case 'Receptionist': return 'bg-blue-100 text-blue-800';
      case 'Chef': return 'bg-orange-100 text-orange-800';
      case 'Waiter': return 'bg-cyan-100 text-cyan-800';
      case 'Housekeeping': return 'bg-pink-100 text-pink-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStaff = staffMembers.length;
  const activeStaff = staffMembers.filter((s) => s.status === 'Active').length;
  const totalSalary = staffMembers.reduce((sum, staff) => sum + staff.salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Users & Staff Management</h1>
          <p className="mt-1 text-gray-500">Manage staff members, roles, and access permissions</p>
        </div>
        <button className="admin-staff-action-button">
          <UserPlus className="w-5 h-5" />Add Staff Member
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
            <div><p className="text-sm text-gray-600">Total Salary</p><h3 className="text-2xl font-semibold text-gray-900">${totalSalary.toLocaleString()}/mo</h3></div>
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
                  <td className="admin-staff-table-cell"><span className={`admin-staff-role-badge ${getRoleBadgeColor(staff.role)}`}>{staff.role}</span></td>
                  <td className="admin-staff-table-cell">{staff.department}</td>
                  <td className="admin-staff-table-cell"><span className="admin-staff-salary">${staff.salary.toLocaleString()}</span></td>
                  <td className="admin-staff-table-cell">{new Date(staff.joinDate).toLocaleDateString()}</td>
                  <td className="admin-staff-table-cell"><span className={`admin-staff-status-badge ${getStatusColor(staff.status)}`}>{staff.status}</span></td>
                  <td className="admin-staff-table-cell">
                    <button className="admin-staff-action-link admin-staff-action-link--edit">Edit</button>
                    <button className="admin-staff-action-link admin-staff-action-link--toggle">Disable</button>
                    <button className="admin-staff-action-link admin-staff-action-link--delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (<div className="py-12 text-center"><p className="text-gray-500">No staff members found</p></div>)}
        </div>
      </div>
    </div>
  );
}