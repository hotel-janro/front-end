import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Calendar, Star, MoreVertical, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../../api';

export function AdminGuests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/bookings');
      if (response.success && response.data) {
        const bookings = response.data;
        const guestMap = {};

        bookings.forEach(booking => {
          if (!booking.fullName) return; // Skip if no name
          
          // Use email as unique identifier, fallback to phone or name
          const key = (booking.email || booking.phone || booking.fullName).toLowerCase().trim();
          
          if (!guestMap[key]) {
            guestMap[key] = {
              id: booking._id ? `G-${booking._id.substring(booking._id.length - 6)}` : `G-${Math.floor(Math.random()*10000)}`,
              name: booking.fullName,
              email: booking.email || 'N/A',
              phone: booking.phone || 'N/A',
              totalStays: 1,
              lastStay: booking.createdAt || booking.checkInDate || new Date().toISOString(),
              category: 'Regular'
            };
          } else {
            guestMap[key].totalStays += 1;
            // Update lastStay if this booking is newer
            const currentLastStay = new Date(guestMap[key].lastStay);
            const thisStayDate = new Date(booking.createdAt || booking.checkInDate || new Date().toISOString());
            if (thisStayDate > currentLastStay) {
              guestMap[key].lastStay = thisStayDate.toISOString();
            }
          }
        });

        const guestList = Object.values(guestMap).map(g => {
          // Determine category based on total stays
          if (g.totalStays >= 10) g.category = 'VVIP';
          else if (g.totalStays >= 3) g.category = 'VIP';
          return g;
        });

        // Sort by last stay (most recent first)
        guestList.sort((a, b) => new Date(b.lastStay) - new Date(a.lastStay));

        setGuests(guestList);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'All' || guest.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'VVIP': return 'bg-purple-100 text-purple-800';
      case 'VIP': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Guests</h1>
          <p className="text-gray-500 mt-1">Manage your guest profiles and history</p>
        </div>
        <button 
          onClick={fetchGuests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Guests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stays</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Stay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && guests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Loading guests...
                  </td>
                </tr>
              ) : filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No guests found.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {guest.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          <div className="text-xs text-gray-500">ID: {guest.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1"><Mail className="w-3 h-3" /> {guest.email}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {guest.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.totalStays} trips
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(guest.lastStay).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
