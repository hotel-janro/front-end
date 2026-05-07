import React, { useState } from 'react';
import { Heart, Calendar, Users, DollarSign, Plus, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { weddingHalls, weddingBookings } from '../../../data/newMockData.js';

export function AdminWedding() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredBookings = weddingBookings.filter((booking) => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredHalls = weddingHalls.filter((hall) =>
    hall.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHallStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Booked': return 'bg-orange-100 text-orange-800';
      case 'Maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBookings = weddingBookings.length;
  const confirmedBookings = weddingBookings.filter((b) => b.status === 'Confirmed').length;
  const totalRevenue = weddingBookings.reduce((sum, booking) => sum + booking.advancePaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Wedding & Event Management</h1>
          <p className="text-gray-500 mt-1">Manage wedding hall bookings and event scheduling</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          {activeTab === 'bookings' ? 'New Booking' : 'Add Hall'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-lg"><Heart className="w-6 h-6 text-pink-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <h3 className="text-2xl font-semibold text-gray-900">{totalBookings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg"><Calendar className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Confirmed Events</p>
              <h3 className="text-2xl font-semibold text-gray-900">{confirmedBookings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg"><DollarSign className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 font-medium transition-colors ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Event Bookings</button>
            <button onClick={() => setActiveTab('halls')} className={`px-6 py-3 font-medium transition-colors ${activeTab === 'halls' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Wedding Halls</button>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder={activeTab === 'bookings' ? 'Search bookings...' : 'Search halls...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {activeTab === 'bookings' && (
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {activeTab === 'bookings' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">#WED-{booking.id.padStart(3, '0')}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div><div className="text-sm font-medium text-gray-900">{booking.customerName}</div><div className="text-sm text-gray-500">{booking.customerEmail}</div></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.hallName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div><div className="text-sm text-gray-900">{new Date(booking.eventDate).toLocaleDateString()}</div><div className="text-sm text-gray-500">{booking.eventTime}</div></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.guestCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.packageType}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div><div className="text-sm font-medium text-gray-900">${booking.totalAmount.toLocaleString()}</div><div className="text-xs text-gray-500">Paid: ${booking.advancePaid.toLocaleString()}</div></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No bookings found</p></div>)}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHalls.map((hall) => (
                <div key={hall.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-pink-400" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{hall.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getHallStatusColor(hall.status)}`}>{hall.status}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="w-4 h-4" />Capacity: {hall.capacity} guests</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600"><DollarSign className="w-4 h-4" />${hall.pricePerDay.toLocaleString()} / day</div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {hall.features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white text-xs text-gray-600 rounded border border-gray-200">{feature}</span>
                        ))}
                      </div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">View Details</button>
                  </div>
                </div>
              ))}
            </div>
            {filteredHalls.length === 0 && (<div className="text-center py-12"><p className="text-gray-500">No halls found</p></div>)}
          </div>
        )}
      </div>
    </div>
  );
}
