import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Users, DollarSign, Plus, Search, X, Phone, Mail, User, Clock, MapPin, Info } from 'lucide-react';
import { apiFetch } from '../../../api';

export function ReceptionWedding() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    eventType: 'Wedding',
    guestCount: '',
    corkageIncluded: false,
    cateringPackage: '100 Pax Package',
    selectedMeals: [],
    optionalServices: [],
    specialRequests: '',
    advancePaid: '',
    bookingCategory: 'Wedding',
    venuePreference: 'Indoor',
    timeSlot: 'Day'
  });

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Edit Guest Count State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newGuestCount, setNewGuestCount] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const weddingFullMenu = {
    WelcomeDrinks: ['Orange Juice', 'Mango juice', 'MixFruit juice'],
    Appetizers: ['Salad Corner: Tomato, Onion or Green Chilli Salad / Cucamba Card With Salad / Mix Vegetable Salad / Salada Kola', 'Soup: Chicken Soup / Vegetable Soup / Egg Soup'],
    MainCourse: ['Rice: Steam basmathi Rice / Yellow Rice / Chiken Fride Rice / Vegetable Noodles', 'Chicken: Chicken Red Curry / Chilli Chicken / Spicy Chicken Badum / Chicken kuruma', 'Fish: Fish Talapath / Fish Red Curry (Talapath) / Fish Peppered Curry (Moldivan Style) / Fish Ambultiyal / Fish Masala', 'Vegetables: Tempered Potato & Potato Curry / Brinjall Capcicum & Tomato Moju Or Pahi / Tempered Dhal Or Dhal Fry Indian Style / Garlice Green Beans / Temperd Mushroom With kunisso / Cashew (Green Peas Curry)', 'Condiments Platter: DRY FISH / Sinhala Achcharu / Mango Chutney / Chilli Paste / Tomato Sauce / Papadam Dry Chilly'],
    LiveStations: ['Poruwa & Seti Back', 'Oil Lamp Decorated', 'Entrance Arch', 'Beautiful Location Photos', 'Table Decoration', 'Cake Baskets', 'Registration table / Cake Table / Milk Rice Table', '(Led) Dancing Floor', 'Two A/C Rooms for Dressing', 'Astaka', 'Jayamangala', 'Piliganeem', 'West Natum', 'Kirikala or Champagine'],
    Desserts: ['Cream Orange Caramal', 'Watalappam', 'Fresh Fruits Salad', 'Fresh Fruites Cuts (papaya Pineple,Banana ) Water Melan', 'Rainbow Jelly ( Red & Green)', 'CUSTARD PUDDING']
  };

  const weddingPackageDetails = {
    '100 Pax Package': {
      price: 4750,
      highlights: ['Poruwa & Seti Back, Dancing Floor, A/C Rooms, Astaka', 'Welcome Drink, Rice, Chicken, Fish, Vegetables, Desserts', 'Free Bites: Chicken, Sausages 2kg, Kadala 2kg'],
      fullMenu: weddingFullMenu
    },
    '150 Pax Package': {
      price: 4450,
      highlights: ['Poruwa & Seti Back, Dancing Floor, A/C Rooms, Astaka', 'Welcome Drink, Rice, Chicken, Fish, Vegetables, Desserts', 'Free Bites (15kg): Chicken 5kg, Sausages 4kg, Kadala 3kg, Hot Butter Mushroom 3kg'],
      fullMenu: weddingFullMenu
    },
    '200 Pax Package': {
      price: 3850,
      highlights: ['Poruwa & Seti Back, Dancing Floor, A/C Rooms, Astaka', 'Welcome Drink, Rice, Chicken, Fish, Vegetables, Desserts', 'Free Bites: Chicken 7kg, Sausages 4kg, Kadala 4kg'],
      fullMenu: weddingFullMenu
    },
    '250 Pax Package': {
      price: 3750,
      highlights: ['Poruwa & Seti Back, Dancing Floor, A/C Rooms, Astaka', 'Welcome Drink, Rice, Chicken, Fish, Vegetables, Desserts', 'Free Bites (18kg): Chicken 10kg, Sausages 4kg, Kadala 4kg'],
      fullMenu: weddingFullMenu
    }
  };
  const weddingPackagePrices = {
    '100 Pax Package': 4750,
    '150 Pax Package': 4450,
    '200 Pax Package': 3850,
    '250 Pax Package': 3750
  };

  const eventPackagePrices = {
    'Lunch With Pool': 2415,
    'Menu I': 2900,
    'Menu II': 2750
  };
  const packagePrices = formData.bookingCategory === 'Wedding' ? weddingPackagePrices : eventPackagePrices;
  const mealPrices = {
    'Breakfast': 800,
    'Lunch': 1500,
    'Tea Time': 600,
    'Dinner': 1800
  };
  const weddingServicePrices = {
    'Decorations': 45000,
    'DJ/Music': 35000,
    'Photography': 55000,
    'Videography': 40000,
    'Wedding Cake': 25000,
    'Lighting System': 30000,
    'Flower Arrangements': 20000
  };
  const eventServicePrices = {
    'Decorations': 15000,
    'DJ/Music': 10000,
    'Photography': 15000,
    'Videography': 12000,
    'Wedding Cake': 8000,
    'Lighting System': 8000,
    'Flower Arrangements': 5000
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.bookingCategory === 'Wedding' && formData.hallId && formData.cateringPackage !== 'Custom') {
      const selectedHall = halls.find(h => h._id === formData.hallId);
      if (selectedHall) {
        const maxCapacity = selectedHall.capacity;
        const match = formData.cateringPackage.match(/(\d+)/);
        if (match) {
          const packagePax = parseInt(match[0], 10);
          if (packagePax > maxCapacity) {
            setFormData(prev => ({ ...prev, cateringPackage: '100 Pax Package' }));
          }
        }
      }
    }
  }, [formData.hallId, formData.bookingCategory, formData.cateringPackage, halls]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bookingsRes, hallsRes] = await Promise.all([
        apiFetch('/wedding/bookings'),
        apiFetch('/wedding/halls')
      ]);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (hallsRes.success) setHalls(hallsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load wedding data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/wedding/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ bookingStatus: newStatus })
      });
      if (res.success) {
        fetchData(); // Refresh
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddPayment = async (booking) => {
    setSelectedBooking(booking);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const balance = selectedBooking.totalAmount - (selectedBooking.advancePaid || 0);
    if (Number(paymentAmount) > balance) {
      if (!window.confirm(`Amount Rs.${paymentAmount} exceeds the balance Rs.${balance}. Continue anyway?`)) return;
    }

    try {
      const res = await apiFetch(`/wedding/bookings/${selectedBooking._id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paymentAmount: Number(paymentAmount) })
      });
      if (res.success) {
        alert("Payment added successfully!");
        setShowPaymentModal(false);
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleHallStatusChange = async (id, newStatus) => {
    try {
      const res = await apiFetch(`/wedding/halls/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.success) {
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleServiceToggle = (serviceName) => {
    setFormData(prev => {
      const services = prev.optionalServices.includes(serviceName)
        ? prev.optionalServices.filter(s => s !== serviceName)
        : [...prev.optionalServices, serviceName];
      return { ...prev, optionalServices: services };
    });
  };

  const calculateTotal = () => {
    let total = 0;
    const selectedHall = halls.find(h => h._id === formData.hallId);
    if (selectedHall) total += selectedHall.price;

    if (formData.guestCount) {
      if (formData.cateringPackage && packagePrices[formData.cateringPackage]) {
        total += packagePrices[formData.cateringPackage] * Number(formData.guestCount);
      } else if (formData.bookingCategory !== 'Wedding') {
        formData.selectedMeals?.forEach(meal => {
          total += (mealPrices[meal] || 0) * Number(formData.guestCount);
        });
      }
    }

    const servicePrices = formData.bookingCategory === 'Wedding' ? weddingServicePrices : eventServicePrices;
    formData.optionalServices.forEach(s => {
      total += servicePrices[s] || 0;
    });

    // --- Extra Hour Calculation ---
    if (formData.startTime && formData.endTime) {
      const calculateDuration = (start, end) => {
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        let diff = (eH + eM/60) - (sH + sM/60);
        if (diff < 0) diff += 24; 
        return diff;
      };

      const duration = calculateDuration(formData.startTime, formData.endTime);
      const standardHours = formData.bookingCategory === 'Wedding' ? (formData.timeSlot === 'Day' ? 7 : 6) : 6;
      const extraHourPrice = formData.bookingCategory === 'Wedding' ? 10000 : 5000;

      if (duration > standardHours) {
        const extraHours = Math.ceil(duration - standardHours);
        total += extraHours * extraHourPrice;
      }
    }
    // ---

    return total;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/wedding/bookings', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        alert("Booking created successfully!");
        setShowModal(false);
        setFormData({
          customerName: '', customerPhone: '', customerEmail: '',
          brideName: '', bridePhone: '', nekathTimes: '', seatingStyle: '', dietaryNotes: '', corkageIncluded: false,
          guestCount: '', hallId: '', cateringPackage: '100 Pax Package',
          selectedMeals: [], optionalServices: [], specialRequests: '', 
          advancePaid: '', bookingCategory: 'Wedding', venuePreference: 'Indoor', timeSlot: 'Day'
        });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateGuestCount = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/wedding/bookings/${editingBooking._id}/guest-count`, {
        method: 'PUT',
        body: JSON.stringify({ guestCount: Number(newGuestCount) })
      });
      if (res.success) {
        alert("Guest count updated successfully!");
        setShowGuestModal(false);
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || booking.bookingStatus === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredHalls = halls.filter((hall) =>
    hall.hallName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHallStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-emerald-100 text-emerald-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Wedding & Event Bookings</h1>
          <p className="text-slate-500 mt-1">Manage luxury venues and hall bookings (Front Desk)</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              groomName: '', groomPhone: '', brideName: '', bridePhone: '', nekathTimes: '', seatingStyle: '', dietaryNotes: '', corkageIncluded: false,
              guestCount: '', hallId: '', cateringPackage: '100 Pax Package',
              selectedMeals: [], optionalServices: [], specialRequests: '', 
              advancePaid: '', bookingCategory: 'Wedding', venuePreference: 'Indoor', timeSlot: 'Day'
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-5 h-5 text-[#D4AF37]" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#0F172A] rounded-2xl"><Heart className="w-6 h-6 text-[#D4AF37]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Bookings</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalBookings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#0F172A] rounded-2xl"><Calendar className="w-6 h-6 text-[#D4AF37]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Confirmed Events</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{confirmedBookings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#0F172A] rounded-2xl"><DollarSign className="w-6 h-6 text-[#D4AF37]" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">Rs. {totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex px-4 pt-4">
            <button 
              onClick={() => setActiveTab('bookings')} 
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'bookings' ? 'text-[#D4AF37] border-[#D4AF37] bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
              Event Bookings
            </button>
            <button 
              onClick={() => setActiveTab('halls')} 
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'halls' ? 'text-[#D4AF37] border-[#D4AF37] bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
              Venue & Hall Management
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={activeTab === 'bookings' ? 'Search bookings by customer name...' : 'Search halls...'} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm" 
                />
              </div>
            </div>
            {activeTab === 'bookings' && (
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white text-sm min-w-[150px]"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {activeTab === 'bookings' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hall & Guests</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading bookings...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No bookings found</td></tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{booking.customerName}</div>
                        <div className="text-xs text-slate-500">{booking.customerPhone}</div>
                        {booking.customerEmail && <div className="text-xs text-slate-500">{booking.customerEmail}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#0F172A]">{booking.eventType}</div>
                        <div className="text-xs text-slate-500">{new Date(booking.eventDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{booking.startTime} - {booking.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{booking.hallId?.hallName || 'Unknown Hall'}</div>
                        <div className="text-xs text-slate-500">{booking.guestCount} Guests</div>
                        <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">{booking.cateringPackage} Pkg</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">Rs. {booking.totalAmount?.toLocaleString()}</div>
                        <div className="text-[10px] font-semibold text-emerald-600 mt-1">Paid: Rs. {booking.advancePaid?.toLocaleString()}</div>
                        <div className="text-[10px] font-semibold text-red-500">Bal: Rs. {(booking.totalAmount - (booking.advancePaid || 0)).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border w-fit ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                          <span className={`inline-flex px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border w-fit ${
                            booking.paymentStatus === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            booking.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            {booking.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {booking.bookingStatus === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(booking._id, 'confirmed')} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors font-semibold">Confirm</button>
                              <button onClick={() => handleStatusChange(booking._id, 'rejected')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-semibold">Reject</button>
                            </>
                          )}
                          {booking.bookingStatus === 'confirmed' && (
                            <>
                              <button onClick={() => {
                                setEditingBooking(booking);
                                setNewGuestCount(booking.guestCount);
                                setShowGuestModal(true);
                              }} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold">Edit Guests</button>
                              {booking.paymentStatus !== 'Fully Paid' && (
                                <button onClick={() => handleAddPayment(booking)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-semibold">Pay</button>
                              )}
                              <button onClick={() => handleStatusChange(booking._id, 'cancelled')} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            {isLoading ? (
               <div className="text-center py-12 text-slate-400">Loading halls...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHalls.map((hall) => (
                  <div key={hall._id} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="h-40 bg-[#0F172A] relative flex items-center justify-center">
                      <div className="absolute right-0 top-0 h-full w-1/2 bg-[#D4AF37]/10 rounded-l-full blur-2xl" />
                      <Heart className="w-12 h-12 text-[#D4AF37] relative z-10 opacity-50" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>{hall.hallName}</h3>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${getHallStatusColor(hall.status)}`}>{hall.status}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{hall.type || 'Hall'}</span>
                      </div>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><Users className="w-4 h-4 text-[#D4AF37]" />Capacity: {hall.capacity} guests</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><DollarSign className="w-4 h-4 text-[#D4AF37]" />Rs. {hall.price?.toLocaleString()} base price</div>
                      </div>
                      <select 
                        value={hall.status}
                        onChange={(e) => handleHallStatusChange(hall._id, e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none border-2 transition-all cursor-pointer ${
                          hall.status === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          hall.status === 'maintenance' ? 'bg-red-50 border-red-200 text-red-700' :
                          hall.status === 'occupied' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="occupied">Occupied</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredHalls.length === 0 && !isLoading && (<div className="text-center py-12"><p className="text-slate-500">No halls found</p></div>)}
          </div>
        )}
      </div>

      {/* NEW BOOKING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl my-4 border border-white/20 flex flex-col max-h-[95vh]">
            <div className="bg-[#0F172A] text-white p-6 rounded-t-[2rem] flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-2xl" style={{ fontFamily: "DM Serif Display, serif" }}>Create New Booking</h2>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-1">Event Management</p>
              </div>
              <button onClick={() => setShowModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitBooking} className="p-8 overflow-y-auto">
              
              <div className="flex flex-col sm:flex-row gap-6 mb-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Booking Category</label>
                  <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    {['Wedding', 'Event'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, bookingCategory: cat, cateringPackage: cat === 'Wedding' ? '100 Pax Package' : 'Menu I', eventType: cat === 'Wedding' ? 'Wedding' : 'Birthday Party', venuePreference: 'Indoor', hallId: ''})}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.bookingCategory === cat ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex-1 transition-all duration-500 ${formData.bookingCategory === 'Event' ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none'}`}>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">
                    {formData.bookingCategory === 'Wedding' ? 'Venue Location (Fixed)' : 'Venue Location'}
                  </label>
                  <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    {['Indoor', 'Outdoor'].map(loc => (
                      <button
                        key={loc}
                        type="button"
                        disabled={formData.bookingCategory === 'Wedding' && loc === 'Outdoor'}
                        onClick={() => setFormData({...formData, venuePreference: loc, hallId: ''})}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.venuePreference === loc ? 'bg-[#D4AF37] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'} ${formData.bookingCategory === 'Wedding' && loc === 'Outdoor' ? 'hidden' : ''}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.bookingCategory === 'Wedding' && (
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Time Slot</label>
                    <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      {['Day', 'Night'].map((slot) => (
                        <button 
                          key={slot} 
                          type="button" 
                          onClick={() => {
                            const defaults = slot === 'Day' ? { start: '09:00', end: '16:00' } : { start: '18:00', end: '00:00' };
                            setFormData({...formData, timeSlot: slot, startTime: defaults.start, endTime: defaults.end});
                          }} 
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${formData.timeSlot === slot ? 'bg-[#0F172A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1 */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-b border-slate-200/60 pb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#D4AF37]" /> Customer Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Customer Name *</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-xs" placeholder="Customer Name" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone *</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-xs" placeholder="+94 7X XXX XXXX" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-xs" placeholder="john@example.com" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-b border-slate-200/60 pb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" /> Event & Venue
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.bookingCategory === 'Event' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Event Type *</label>
                            <select required value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none text-xs font-bold">
                              <option>Birthday Party</option>
                              <option>Anniversary</option>
                              <option>Corporate Meeting</option>
                              <option>Other</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Event Date *</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Start Time *</label>
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                              <Clock className="w-4 h-4" />
                            </div>
                            <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-xs" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">End Time *</label>
                          <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                              <Clock className="w-4 h-4" />
                            </div>
                            <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-xs" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">{formData.venuePreference === 'Indoor' ? 'Hall' : 'Outdoor Area'} *</label>
                          <select required value={formData.hallId} onChange={e => setFormData({...formData, hallId: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none text-xs font-bold">
                            <option value="">Select {formData.venuePreference === 'Indoor' ? 'Hall' : 'Area'}</option>
                            {halls
                              .filter(h => h.type === (formData.venuePreference === 'Indoor' ? 'Hall' : 'Event Area'))
                              .map(h => (
                                <option key={h._id} value={h._id}>{h.hallName} (Max: {h.capacity})</option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Guest Count *</label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <input required type="number" min="1" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-widest border-b border-slate-200/60 pb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#D4AF37]" /> Packages & Services
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Catering Package *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.keys(packagePrices)
                            .filter(pkg => {
                              if (formData.bookingCategory !== 'Wedding') return true;
                              const selectedHall = halls.find(h => h._id === formData.hallId);
                              const maxCapacity = selectedHall ? selectedHall.capacity : 9999;
                              const match = pkg.match(/(\d+)/);
                              if (!match) return true;
                              return parseInt(match[0], 10) <= maxCapacity;
                            })
                            .map(pkg => (
                            <div 
                              key={pkg}
                              onClick={() => setFormData({...formData, cateringPackage: pkg})}
                              className={`p-3.5 rounded-xl border-2 text-center cursor-pointer transition-all flex flex-col justify-center ${
                                formData.cateringPackage === pkg 
                                  ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg' 
                                  : 'bg-white border-slate-200/60 text-slate-600 hover:border-[#D4AF37]'
                              }`}
                            >
                              <div className="font-bold text-xs">{pkg}</div>
                              <div className={`text-[9px] mt-0.5 font-bold ${formData.cateringPackage === pkg ? 'text-[#D4AF37]' : 'text-slate-400'}`}>Rs. {packagePrices[pkg].toLocaleString()} / pax</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Special Requests / Menu Changes</label>
                        <textarea value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} rows="2" placeholder="e.g. Vegetarian counts, allergies, special menu adjustments..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none text-xs resize-none"></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <DollarSign className="w-16 h-16 text-[#D4AF37]" />
                    </div>
                    <div className="mb-4 pb-4 border-b border-white/10 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Estimated Total</p>
                        <h3 className="text-3xl font-black text-[#D4AF37] mt-0.5">
                          Rs. {calculateTotal().toLocaleString()}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 italic">Min. 20% Advance: Rs. {(calculateTotal() * 0.2).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase mb-1.5">Advance Payment *</label>
                        <input 
                          required 
                          type="number" 
                          min={calculateTotal() * 0.2}
                          value={formData.advancePaid} 
                          onChange={e => setFormData({...formData, advancePaid: e.target.value})} 
                          className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg focus:border-[#D4AF37] outline-none text-white font-bold text-xs" 
                          placeholder="Rs."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase mb-1.5">Balance Amount</label>
                        <div className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-xs">
                          Rs. {Math.max(0, calculateTotal() - (Number(formData.advancePaid) || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-xs uppercase tracking-wider">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-[#0F172A] text-[#D4AF37] rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 text-xs uppercase tracking-wider">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-2xl" />
              <div className="relative z-10">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "DM Serif Display, serif" }}>Add Payment</h2>
                <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mt-1">Transaction Entry</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Customer</span>
                  <span className="text-sm font-semibold text-slate-900">{selectedBooking.customerName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Amount</span>
                  <span className="text-sm font-bold text-slate-900">Rs. {selectedBooking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Paid So Far</span>
                  <span className="text-sm font-bold text-emerald-600">Rs. {(selectedBooking.advancePaid || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">Balance Due</span>
                  <span className="text-lg font-black text-red-600">Rs. {(selectedBooking.totalAmount - (selectedBooking.advancePaid || 0)).toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={submitPayment}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Payment Amount (Rs.)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      autoFocus
                      required 
                      type="number" 
                      value={paymentAmount} 
                      onChange={e => setPaymentAmount(e.target.value)} 
                      placeholder="Enter amount..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all text-lg font-bold"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                >
                  Confirm Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* GUEST COUNT MODAL */}
      {showGuestModal && editingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 overflow-hidden">
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-2xl" />
              <div className="relative z-10">
                <h2 className="text-xl font-semibold" style={{ fontFamily: "DM Serif Display, serif" }}>Update Guest Count</h2>
                <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest mt-1">Guest Finalization</p>
              </div>
              <button onClick={() => setShowGuestModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGuestCount} className="p-8">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Current Count: <span className="font-bold text-slate-900">{editingBooking.guestCount} Guests</span></p>
                <p className="text-[10px] text-slate-400">Updating this will automatically recalculate the total amount based on the selected package/meals.</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Guest Count *</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    autoFocus
                    required 
                    type="number" 
                    min="1"
                    value={newGuestCount} 
                    onChange={e => setNewGuestCount(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all text-lg font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
              >
                Update & Recalculate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
