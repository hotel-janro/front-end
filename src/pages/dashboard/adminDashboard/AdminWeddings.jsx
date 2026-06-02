import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Users, DollarSign, Plus, Search, X, Edit, Trash2, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { apiFetch, getImageUrl } from '../../../api';

export function AdminWedding() {
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
    groomName: '',
    brideName: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '16:00',
    eventType: 'Wedding',
    guestCount: '',
    hallId: '',
    cateringPackage: 'Silver',
    customPackagePrice: '',
    customPackageNotes: '',
    selectedMeals: [],
    optionalServices: [],
    specialRequests: '',
    advancePaid: '',
    bookingCategory: 'Wedding',
    venuePreference: 'Indoor',
    timeSlot: 'Day',
    seatingStyle: 'Round Tables',
    dietaryNotes: '',
    corkageIncluded: false,
    customerNIC: '',
    customerAddress: '',
    discountPercentage: 0,
    complimentaryItems: [],
    nekathTimes: {
      poruwa: '',
      teaTime: '',
      lunchDinner: ''
    }
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const handleEditBooking = (booking) => {
    setEditingId(booking._id);
    setFormData({
      customerName: booking.customerName || '',
      customerPhone: booking.customerPhone || '',
      customerEmail: booking.customerEmail || '',
      groomName: booking.groomName || '',
      brideName: booking.brideName || '',
      eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
      startTime: booking.startTime || '09:00',
      endTime: booking.endTime || '16:00',
      eventType: booking.eventType || 'Wedding',
      guestCount: booking.guestCount || '',
      hallId: booking.hallId?._id || booking.hallId || '',
      cateringPackage: booking.cateringPackage || 'Silver',
      customPackagePrice: booking.customPackagePrice || '',
      customPackageNotes: booking.customPackageNotes || '',
      selectedMeals: booking.selectedMeals || [],
      optionalServices: booking.optionalServices || [],
      specialRequests: booking.specialRequests || '',
      advancePaid: booking.advancePaid || '',
      bookingCategory: booking.bookingCategory || 'Wedding',
      venuePreference: booking.venuePreference || 'Indoor',
      timeSlot: booking.timeSlot || 'Day',
      seatingStyle: booking.seatingStyle || 'Round Tables',
      dietaryNotes: booking.dietaryNotes || '',
      corkageIncluded: booking.corkageIncluded || false,
      customerNIC: booking.customerNIC || '',
      customerAddress: booking.customerAddress || '',
      discountPercentage: booking.discountPercentage || 0,
      complimentaryItems: booking.complimentaryItems || [],
      nekathTimes: booking.nekathTimes || { poruwa: '', teaTime: '', lunchDinner: '' }
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  // Hall Management State
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);
  const [hallFormData, setHallFormData] = useState({
    hallName: '',
    capacity: '',
    price: '',
    type: 'Hall',
    status: 'available',
    image: ''
  });

  // Edit Guest Count State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newGuestCount, setNewGuestCount] = useState('');

  // Image Upload State
  const fileInputRef = React.useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenuPkg, setSelectedMenuPkg] = useState(null);

  const packageDetails = {
    Silver: {
      price: 2500,
      highlights: ['2 Meats', '3 Desserts', 'Standard Buffet'],
      fullMenu: {
        WelcomeDrinks: ['1 Standard Option (Fruit Juice / Iced Coffee)'],
        Appetizers: ['None'],
        MainCourse: ['2 Rice/Noodles', '2 Meats (Chicken, Fish)', '3-4 Vegetables & Salads'],
        LiveStations: ['None'],
        Desserts: ['3 Options (Ice Cream, Watalappan, Fruits)']
      }
    },
    Gold: {
      price: 4000,
      highlights: ['3 Meats', '5 Desserts', '1 Live Station'],
      fullMenu: {
        WelcomeDrinks: ['2 Options (Mocktail, Iced Coffee)'],
        Appetizers: ['1 Soup', '2 Appetizers'],
        MainCourse: ['3-4 Rice/Noodles/Pasta', '3 Meats (Chicken, Fish, Pork/Beef/Cuttlefish)', '5-6 Vegetables & Salads'],
        LiveStations: ['1 Live Action Station (e.g. Hopper or Pasta)'],
        Desserts: ['5 Options (Cakes, Puddings, Fruits)']
      }
    },
    Platinum: {
      price: 6500,
      highlights: ['5 Premium Meats', '7 Desserts', '2 Live Stations'],
      fullMenu: {
        WelcomeDrinks: ['3 Premium Options (Fresh Juices, Mocktails)'],
        Appetizers: ['2 Soups', 'Passed around Appetizers'],
        MainCourse: ['5+ Rice/Noodles (Biryani, Nasi Goreng)', '4-5 Premium Meats (Duck, Prawns, Mutton)', 'Extensive Salad Bar & Hot Vegetables'],
        LiveStations: ['2-3 Live Action Stations (Mongolian, Sushi, Carvery)'],
        Desserts: ['7+ Premium Options (Chocolate Fountain, French Pastries)']
      }
    }
  };
  const mealPrices = {
    'Breakfast': 800,
    'Lunch': 1500,
    'Tea Time': 600,
    'Dinner': 1800
  };
  const weddingServicePrices = {
    'Decorations': 35000,
    'DJ/Music': 25000,
    'Photography': 40000,
    'Videography': 30000,
    'Wedding Cake': 20000,
    'Lighting System': 20000,
    'Flower Arrangements': 15000
  };
  const eventServicePrices = {
    'Decorations': 10000,
    'DJ/Music': 7500,
    'Photography': 10000,
    'Videography': 8000,
    'Celebration Cake': 5000,
    'Lighting System': 5000,
    'Floral Decor': 3500
  };

  const weddingComplimentaryOptions = [
    'Honeymoon Room (1 Night)',
    'Anniversary Dinner Voucher',
    'Changing Room (Free)',
    'Welcome Drinks (Standard)',
    'Wedding Cake (1.5kg)',
    'Anniversary Breakfast'
  ];

  const eventComplimentaryOptions = [
    'Welcome Drinks (Standard)',
    'Changing Room (Free)',
    'Podium & Wired Mic (Free)',
    'Cake Table Decoration',
    'Projector & Screen (Free)'
  ];

  useEffect(() => {
    fetchData();
  }, []);

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

  const calculateSubtotal = () => {
    let subtotal = 0;
    const selectedHall = halls.find(h => h._id === formData.hallId);
    if (selectedHall) subtotal += selectedHall.price;

    if (formData.guestCount) {
      if (formData.bookingCategory === 'Wedding') {
        if (formData.cateringPackage && packageDetails[formData.cateringPackage]) {
          subtotal += packageDetails[formData.cateringPackage].price * Number(formData.guestCount);
        } else if (formData.cateringPackage === 'Custom') {
          subtotal += Number(formData.customPackagePrice || 0) * Number(formData.guestCount);
        }
      } else {
        formData.selectedMeals?.forEach(meal => {
          subtotal += (mealPrices[meal] || 0) * Number(formData.guestCount);
        });
      }
    }

    const servicePrices = formData.bookingCategory === 'Wedding' ? weddingServicePrices : eventServicePrices;
    formData.optionalServices.forEach(s => {
      subtotal += servicePrices[s] || 0;
    });

    // Extra Hour Calculation
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
        subtotal += extraHours * extraHourPrice;
      }
    }

    return subtotal;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let total = subtotal;

    // Apply Discount Percentage
    if (formData.discountPercentage && Number(formData.discountPercentage) > 0) {
      total -= (subtotal * Number(formData.discountPercentage) / 100);
    }

    return total;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Maximum size is 5MB.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setIsUploading(true);
      const res = await apiFetch('/upload', {
        method: 'POST',
        body: uploadData
      });
      
      if (res.success) {
        setHallFormData(prev => ({ ...prev, image: res.url }));
      }
    } catch (error) {
      alert("Image upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
   
    // Phone Number Validation
    const cleanPhone = formData.customerPhone.replace(/\s+/g, '');
    if (!/^(0\d{9}|\+94\d{9})$/.test(cleanPhone)) {
      alert("Invalid Phone Number. Please enter a valid 10-digit Sri Lankan number (e.g., 0712345678).");
      return;
    }

    // NIC Validation
    const cleanNIC = formData.customerNIC.replace(/\s+/g, '').toUpperCase();
    if (!/^(\d{9}[VX]|\d{12})$/.test(cleanNIC)) {
      alert("Invalid NIC Number. Please enter a valid Sri Lankan NIC.");
      return;
    }

    // Time Validation
    if (formData.startTime && formData.endTime) {
      const startParts = formData.startTime.split(':');
      const endParts = formData.endTime.split(':');
      const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      if (endMins <= startMins && formData.timeSlot === 'Day') {
         alert("Invalid Time Range: 'End Time' must be after 'Start Time' for Day events.");
         return;
      }
      
      if (endMins <= startMins && formData.timeSlot === 'Night') {
         if (!window.confirm("Warning: 'End Time' is before 'Start Time'. We assume this is an overnight event continuing to the next day. Proceed?")) {
           return;
         }
      }
    }
    
    //

    try {
      const url = editingId ? `/wedding/bookings/${editingId}` : '/wedding/bookings';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify(formData)
      });
      if (res.success) {
        alert(editingId ? "Booking updated successfully!" : "Booking created successfully!");
        setShowModal(false);
        setEditingId(null);
        setFormData({
          customerName: '', customerPhone: '', customerEmail: '',
          groomName: '', brideName: '',
          eventDate: '', startTime: '09:00', endTime: '16:00', eventType: 'Wedding',
          guestCount: '', hallId: '', cateringPackage: 'Silver',
          selectedMeals: [], optionalServices: [], specialRequests: '', 
          advancePaid: '', bookingCategory: 'Wedding', venuePreference: 'Indoor', timeSlot: 'Day',
          seatingStyle: 'Round Tables', dietaryNotes: '', corkageIncluded: false,
          customerNIC: '', customerAddress: '', discountPercentage: 0, complimentaryItems: [],
          nekathTimes: { poruwa: '', teaTime: '', lunchDinner: '' }
        });
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmitHall = async (e) => {
    e.preventDefault();
    try {
      const method = editingHallId ? 'PUT' : 'POST';
      const url = editingHallId ? `/wedding/halls/${editingHallId}` : '/wedding/halls';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(hallFormData)
      });
      
      if (res.success) {
        alert(`Venue ${editingHallId ? 'updated' : 'created'} successfully!`);
        setShowHallModal(false);
        fetchData();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteHall = async (id) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) return;
    try {
      const res = await apiFetch(`/wedding/halls/${id}`, { method: 'DELETE' });
      if (res.success) {
        alert("Venue deleted successfully!");
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
          <h1 className="text-3xl font-semibold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Wedding & Event Management</h1>
          <p className="text-slate-500 mt-1">Manage luxury venues, hall bookings and event scheduling</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'halls' && (
            <button 
              onClick={() => {
                setEditingHallId(null);
                setHallFormData({ hallName: '', capacity: '', price: '', type: 'Hall', status: 'available', image: '' });
                setShowHallModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F172A] rounded-xl hover:bg-[#B8962D] transition-colors shadow-lg shadow-[#D4AF37]/20 font-bold"
            >
              <Plus className="w-5 h-5" />
              Add Venue
            </button>
          )}
          {activeTab === 'bookings' && (
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({
                  customerName: '', customerPhone: '', customerEmail: '',
                  groomName: '', brideName: '',
                  eventDate: '', startTime: '09:00', endTime: '16:00', eventType: 'Wedding',
                  guestCount: '', hallId: '', cateringPackage: 'Silver',
                  selectedMeals: [], optionalServices: [], specialRequests: '', 
                  advancePaid: '', bookingCategory: 'Wedding', venuePreference: 'Indoor', timeSlot: 'Day',
                  seatingStyle: 'Round Tables', dietaryNotes: '', corkageIncluded: false,
                  customerNIC: '', customerAddress: '', discountPercentage: 0, complimentaryItems: [],
                  nekathTimes: { poruwa: '', teaTime: '', lunchDinner: '' }
                });
                setCurrentStep(0);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20"
            >
              <Plus className="w-5 h-5 text-[#D4AF37]" />
              New Booking
            </button>
          )}
        </div>
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
                              <button onClick={() => handleEditBooking(booking)} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold">Edit</button>
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
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={getImageUrl(hall.image) || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"} 
                        alt={hall.hallName}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D4AF37] text-[#0F172A] px-2 py-1 rounded-md shadow-lg">{hall.type || 'Hall'}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>{hall.hallName}</h3>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${getHallStatusColor(hall.status)}`}>{hall.status}</span>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><Users className="w-4 h-4 text-[#D4AF37]" />Capacity: {hall.capacity} guests</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><DollarSign className="w-4 h-4 text-[#D4AF37]" />Rs. {hall.price?.toLocaleString()} base price</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingHallId(hall._id);
                            setHallFormData({
                              hallName: hall.hallName,
                              capacity: hall.capacity,
                             price: hall.price,
                              type: hall.type || 'Hall',
                              status: hall.status,
                              image: hall.image || ''
                            });
                            setShowHallModal(true);
                          }}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteHall(hall._id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <select 
                          value={hall.status}
                          onChange={(e) => handleHallStatusChange(hall._id, e.target.value)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider outline-none border-2 transition-all cursor-pointer ${
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#0F172A] text-white p-8 flex justify-between items-center relative shrink-0">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#0F172A]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ fontFamily: "DM Serif Display, serif" }}>New Premium Booking</h2>
                    <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold">
                      {currentStep === 0 ? 'Select Booking Type' : `Step ${currentStep} of 4: ${
                        currentStep === 1 ? 'General Information' :
                        currentStep === 2 ? 'Venue & Schedule' :
                        currentStep === 3 ? 'Catering & Services' : 'Summary & Payment'
                      }`}
                      {currentStep > 0 && ` — ${formData.bookingCategory}`}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
              {[0, 1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step ? 'bg-[#0F172A] text-[#D4AF37] scale-110 shadow-lg' : 
                    currentStep > step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStep > step ? '✓' : step === 0 ? '?' : step}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${currentStep === step ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step === 0 ? 'Type' : step === 1 ? 'General' : step === 2 ? 'Venue' : step === 3 ? 'Menu' : 'Confirm'}
                  </span>
                  {step < 4 && <div className="w-8 sm:w-16 h-[2px] bg-slate-200 mx-2" />}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                {currentStep === 0 && (
                  <div className="space-y-8 animate-in fade-in zoom-in-95 py-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold text-slate-900 mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>Select Booking Type</h3>
                      <p className="text-slate-500 text-sm">Choose a category to continue with specialized options.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <button
                        onClick={() => { setFormData({...formData, bookingCategory: 'Wedding'}); setCurrentStep(1); }}
                        className="group relative bg-[#0F172A] p-6 rounded-[2rem] border-2 border-slate-800 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all text-left overflow-hidden"
                      >
                        <div className="absolute right-[-10%] top-[-10%] p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Heart className="w-24 h-24 text-[#D4AF37]" />
                        </div>
                        <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#D4AF37]/20">
                          <Heart className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Wedding Booking</h4>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">Couple details, nekath times & premium catering packages.</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Select Wedding <Plus className="w-3 h-3" /></span>
                          <div className="w-6 h-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all">
                            <Plus className="w-3 h-3 text-[#D4AF37] group-hover:text-[#0F172A]" />
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setFormData({...formData, bookingCategory: 'Event'}); setCurrentStep(1); }}
                        className="group relative bg-[#0F172A] p-6 rounded-[2rem] border-2 border-slate-800 hover:border-[#D4AF37] hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all text-left overflow-hidden"
                      >
                        <div className="absolute right-[-10%] top-[-10%] p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Calendar className="w-24 h-24 text-[#D4AF37]" />
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
                          <Calendar className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">General Event</h4>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">Birthdays, meetings & anniversaries with meal selections.</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Select Event <Plus className="w-3 h-3" /></span>
                          <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-all">
                            <Plus className="w-3 h-3 text-white group-hover:text-[#0F172A]" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#D4AF37]" /> Primary Contact
                        </h4>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Customer Name *</label>
                          <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="Mr. John Doe" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Phone Number *</label>
                          <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="+94 7X XXX XXXX" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                          <input type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="john@example.com" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Customer NIC *</label>
                            <input required type="text" value={formData.customerNIC} onChange={e => setFormData({...formData, customerNIC: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="XXXX-XXXX-XXXX" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Permanent Address *</label>
                            <textarea required value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} rows="2" className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="Current Billing Address" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {formData.bookingCategory === 'Wedding' ? (
                          <>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Heart className="w-4 h-4 text-[#D4AF37]" /> The Happy Couple
                            </h4>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Groom's Name</label>
                              <input type="text" value={formData.groomName} onChange={e => setFormData({...formData, groomName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="Groom's Full Name" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Bride's Name</label>
                              <input type="text" value={formData.brideName} onChange={e => setFormData({...formData, brideName: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-semibold" placeholder="Bride's Full Name" />
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#D4AF37]" /> Event Details
                            </h4>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Event Type *</label>
                              <select required value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold">
                                {['Wedding Reception', 'Homecoming', 'Engagement Ceremony', 'Birthday Celebration', 'Anniversary Party', 'Puberty Ceremony', 'Corporate Meeting / Seminar', 'Conference / Workshop', 'Company Annual Party', 'Product Launch', 'Graduation Ceremony', 'School / Alumni Reunion', 'Musical Show / Concert', 'Other'].map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Venue Preference</label>
                              <div className="flex gap-4">
                                {['Indoor', 'Outdoor'].map(pref => (
                                  <button key={pref} onClick={() => setFormData({...formData, venuePreference: pref})} type="button" className={`flex-1 py-3.5 rounded-2xl border-2 font-bold transition-all ${formData.venuePreference === pref ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    {pref}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="pt-2">
                          <div className="p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20">
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Selected Path</p>
                            <p className="text-xs font-bold text-slate-700">{formData.bookingCategory} Booking</p>
                            <button onClick={() => setCurrentStep(0)} className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 transition-colors mt-2 underline">Change Type</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Venue Details</h4>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Select Hall / Area *</label>
                          <select required value={formData.hallId} onChange={e => setFormData({...formData, hallId: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold">
                            <option value="">Choose a Venue</option>
                            {halls
                              .filter(hall => formData.bookingCategory === 'Wedding' ? hall.type === 'Hall' : hall.type === 'Event Area')
                              .map(hall => <option key={hall._id} value={hall._id}>{hall.hallName} (Max: {hall.capacity})</option>)
                            }
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Guest Count *</label>
                            <input required type="number" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Seating Style</label>
                            <select value={formData.seatingStyle} onChange={e => setFormData({...formData, seatingStyle: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold">
                              {['Round Tables', 'Theater', 'U-Shape', 'Classroom', 'Cocktail'].map(style => <option key={style} value={style}>{style}</option>)}
                            </select>
                          </div>
                        </div>
                        {formData.bookingCategory === 'Wedding' && (
                          <div className="p-5 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ceremony & Event Milestones</h5>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Main Ceremony</span>
                                <input type="time" value={formData.nekathTimes.poruwa} onChange={e => setFormData({...formData, nekathTimes: {...formData.nekathTimes, poruwa: e.target.value}})} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Tea Time</span>
                                <input type="time" value={formData.nekathTimes.teaTime} onChange={e => setFormData({...formData, nekathTimes: {...formData.nekathTimes, teaTime: e.target.value}})} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Lunch / Dinner</span>
                                <input type="time" value={formData.nekathTimes.lunchDinner} onChange={e => setFormData({...formData, nekathTimes: {...formData.nekathTimes, lunchDinner: e.target.value}})} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Schedule</h4>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Event Date *</label>
                          <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Start Time *</label>
                            <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">End Time *</label>
                            <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-bold" />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {['Day', 'Night'].map(slot => (
                            <button key={slot} onClick={() => setFormData({...formData, timeSlot: slot})} type="button" className={`flex-1 py-3.5 rounded-2xl border-2 font-bold transition-all ${formData.timeSlot === slot ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]' : 'border-slate-100 text-slate-400'}`}>
                              {slot} Time
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Catering Selection</h4>
                        {formData.bookingCategory === 'Wedding' ? (
                          <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Wedding Package</label>
                            {Object.keys(packageDetails).map(pkg => (
                              <div key={pkg} className={`w-full rounded-2xl border-2 transition-all ${formData.cateringPackage === pkg ? 'border-[#0F172A] bg-slate-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                                <div className="flex justify-between items-start p-4 cursor-pointer" onClick={() => setFormData({...formData, cateringPackage: pkg})}>
                                  <div className="flex-1">
                                    <span className={`font-bold block ${formData.cateringPackage === pkg ? 'text-slate-900' : 'text-slate-500'}`}>{pkg} Package</span>
                                    <span className="text-[10px] text-[#D4AF37] font-bold block mb-3">Rs. {packageDetails[pkg].price.toLocaleString()} per plate</span>
                                    <ul className="text-[10px] text-slate-500 space-y-1.5">
                                      {packageDetails[pkg].highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-center gap-1.5">
                                          <div className="w-1 h-1 bg-slate-300 rounded-full" /> {highlight}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex flex-col items-end justify-between h-full">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors mb-4 ${formData.cateringPackage === pkg ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-slate-100 text-transparent border border-slate-200'}`}>
                                      <Plus className="w-3 h-3" />
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); setSelectedMenuPkg(pkg); setShowMenuModal(true); }}
                                      className="text-[10px] font-bold text-[#0F172A] underline hover:text-[#D4AF37] transition-colors mt-auto"
                                    >
                                      View Menu
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className={`w-full rounded-2xl border-2 transition-all ${formData.cateringPackage === 'Custom' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md' : 'border-slate-100 hover:border-[#D4AF37]/30'}`}>
                              <div className="flex justify-between items-start p-4 cursor-pointer" onClick={() => setFormData({...formData, cateringPackage: 'Custom'})}>
                                <div className="flex-1">
                                  <span className={`font-bold block ${formData.cateringPackage === 'Custom' ? 'text-[#0F172A]' : 'text-slate-500'}`}>Custom Package</span>
                                  <span className="text-[10px] text-slate-500 block mb-1">Tailor-made menu for specific requirements.</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${formData.cateringPackage === 'Custom' ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-slate-100 text-transparent border border-slate-200'}`}>
                                  <Plus className="w-3 h-3" />
                                </div>
                              </div>
                              
                              {formData.cateringPackage === 'Custom' && (
                                <div className="p-4 border-t border-[#D4AF37]/20 bg-white/50 rounded-b-2xl space-y-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Agreed Price Per Plate *</label>
                                    <input 
                                      type="number" 
                                      required
                                      value={formData.customPackagePrice}
                                      onChange={e => setFormData({...formData, customPackagePrice: e.target.value})}
                                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none text-sm font-bold"
                                      placeholder="Rs. 3800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Menu Notes / Details</label>
                                    <textarea 
                                      rows="2"
                                      value={formData.customPackageNotes}
                                      onChange={e => setFormData({...formData, customPackageNotes: e.target.value})}
                                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none text-xs"
                                      placeholder="e.g. Gold package with Mutton instead of Pork."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            {Object.keys(mealPrices).map(meal => (
                              <button key={meal} type="button" onClick={() => setFormData(prev => ({...prev, selectedMeals: prev.selectedMeals.includes(meal) ? prev.selectedMeals.filter(m => m !== meal) : [...prev.selectedMeals, meal]}))} className={`p-4 rounded-2xl border-2 transition-all ${formData.selectedMeals.includes(meal) ? 'border-[#0F172A] bg-slate-50' : 'border-slate-100 text-slate-400'}`}>
                                <span className="text-xs font-bold block mb-1">{meal}</span>
                                <span className="text-[10px] font-bold text-[#D4AF37]">Rs. {mealPrices[meal].toLocaleString()}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="pt-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Dietary Notes / Corkage</label>
                          <textarea value={formData.dietaryNotes} onChange={e => setFormData({...formData, dietaryNotes: e.target.value})} rows="3" placeholder="Vegetarian counts, Allergies, Special requests..." className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] outline-none transition-all font-medium text-sm"></textarea>
                          <label className="mt-4 flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-[#D4AF37]/30 transition-all">
                            <input type="checkbox" checked={formData.corkageIncluded} onChange={e => setFormData({...formData, corkageIncluded: e.target.checked})} className="w-5 h-5 rounded-lg accent-[#0F172A]" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Corkage Included (Liquor allowed)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Optional Services</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {Object.keys(formData.bookingCategory === 'Wedding' ? weddingServicePrices : eventServicePrices).map(service => (
                            <label key={service} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.optionalServices.includes(service) ? 'border-[#0F172A] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
                              <div className="flex items-center gap-3">
                                <input type="checkbox" checked={formData.optionalServices.includes(service)} onChange={() => handleServiceToggle(service)} className="w-5 h-5 rounded-lg accent-[#0F172A]" />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{service}</p>
                                  <p className="text-[10px] text-[#D4AF37] font-bold">Rs. {(formData.bookingCategory === 'Wedding' ? weddingServicePrices[service] : eventServicePrices[service]).toLocaleString()}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Complimentary Items</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {(formData.bookingCategory === 'Wedding' ? weddingComplimentaryOptions : eventComplimentaryOptions).map(option => (
                              <label key={option} className="flex items-center gap-3 cursor-pointer p-3 bg-white border border-slate-100 rounded-xl hover:border-[#D4AF37]/30 transition-all">
                                <input 
                                  type="checkbox" 
                                  checked={formData.complimentaryItems.includes(option)}
                                  onChange={() => {
                                    const items = formData.complimentaryItems.includes(option)
                                      ? formData.complimentaryItems.filter(i => i !== option)
                                      : [...formData.complimentaryItems, option];
                                    setFormData({...formData, complimentaryItems: items});
                                  }}
                                  className="w-4 h-4 rounded accent-[#0F172A]"
                                />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8 animate-in fade-in zoom-in-95">
                    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-8">
                        <DollarSign className="w-24 h-24 text-[#D4AF37] opacity-10" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-4xl font-semibold mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
                          Rs. {calculateTotal().toLocaleString()}
                        </h3>
                        <div className="grid grid-cols-2 gap-8 text-sm border-t border-white/10 pt-6">
                          <div>
                            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-2">Booking Summary</p>
                            <p className="text-white/70">{formData.bookingCategory}: {formData.customerName}</p>
                            <p className="text-white/70 text-xs">{formData.eventDate} ({formData.timeSlot})</p>
                            <p className="text-white/70 text-xs">{formData.guestCount} Guests in {halls.find(h => h._id === formData.hallId)?.hallName}</p>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                              <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold tracking-widest">
                                <span>Gross Subtotal</span>
                                <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                              </div>
                              {formData.discountPercentage > 0 && (
                                <div className="flex justify-between text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">
                                  <span>Offer Discount ({formData.discountPercentage}%)</span>
                                  <span>- Rs. {(calculateSubtotal() * Number(formData.discountPercentage) / 100).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-white/50 uppercase mb-2">Discount (%)</label>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    value={formData.discountPercentage} 
                                    onChange={e => {
                                      const val = e.target.value.replace(/[^0-9]/g, '');
                                      if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                                        setFormData({...formData, discountPercentage: val});
                                      }
                                    }} 
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-[#D4AF37] outline-none text-white font-bold pr-8" 
                                    placeholder="0" 
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37] pointer-events-none">%</div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-white/50 uppercase mb-2">Advance (20% Min) *</label>
                                <input required type="number" min={calculateTotal() * 0.2} value={formData.advancePaid} onChange={e => setFormData({...formData, advancePaid: e.target.value})} className="w-full px-4 py-2 bg-white/10 border border-[#D4AF37]/50 rounded-xl focus:border-[#D4AF37] outline-none text-white font-bold" />
                              </div>
                            </div>
                            <p className="text-[10px] text-white/40 italic text-right">Remaining Balance: Rs. {Math.max(0, calculateTotal() - (Number(formData.advancePaid) || 0)).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Complimentary Items</h5>
                        {formData.complimentaryItems.length > 0 ? (
                          <ul className="space-y-2">
                            {formData.complimentaryItems.map(item => (
                              <li key={item} className="text-xs font-bold text-green-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No complimentary items selected</p>
                        )}
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Special Requests</h5>
                        <p className="text-sm text-slate-600 italic">"{formData.specialRequests || 'No special requests provided'}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Navigation */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button 
                type="button" 
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowModal(false)}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous Step'}
              </button>
              
              <div className="flex gap-4">
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-10 py-4 bg-[#D4AF37] text-[#0F172A] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#B8962D] transition-all shadow-xl shadow-[#D4AF37]/20"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmitBooking}
                    type="button"
                    className="px-10 py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                  >
                    Confirm & Create Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* VENUE MANAGEMENT MODAL */}
      {showHallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20">
            <div className="bg-[#0F172A] text-white p-6 rounded-t-[2rem] flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>{editingHallId ? 'Edit Venue' : 'Add New Venue'}</h2>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mt-1">Venue Management</p>
              </div>
              <button onClick={() => setShowHallModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitHall} className="p-8 space-y-6">
              {/* Image Upload Section */}
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-48 bg-slate-50 border-2 border-dashed rounded-[2rem] overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    isUploading ? 'border-[#D4AF37] bg-slate-100' : 
                    hallFormData.image ? 'border-transparent' : 'border-slate-200 hover:border-[#D4AF37]/50 hover:bg-slate-100/50'
                  }`}
                >
                  {isUploading ? (
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploading Photo...</p>
                    </div>
                  ) : hallFormData.image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={getImageUrl(hallFormData.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-white" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-[#D4AF37]" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upload Venue Photo</p>
                      <p className="text-[9px] text-slate-300 mt-2 italic">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                
                {hallFormData.image && !isUploading && (
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setHallFormData({...hallFormData, image: ''});
                    }}
                    className="absolute top-4 right-4 p-2.5 bg-white/90 text-red-500 rounded-xl shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Venue Name *</label>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                    <input 
                      required 
                      type="text" 
                      value={hallFormData.hallName} 
                      onChange={e => setHallFormData({...hallFormData, hallName: e.target.value})} 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-semibold text-slate-900" 
                      placeholder="e.g. Royal Grand Hall" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Venue Type *</label>
                    <select 
                      required 
                      value={hallFormData.type} 
                      onChange={e => setHallFormData({...hallFormData, type: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-bold text-slate-700"
                    >
                      <option value="Hall">Hall</option>
                      <option value="Event Area">Event Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Initial Status *</label>
                    <select 
                      required 
                      value={hallFormData.status} 
                      onChange={e => setHallFormData({...hallFormData, status: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-bold text-slate-700"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Capacity *</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required 
                        type="number" 
                        min="1" 
                        value={hallFormData.capacity} 
                        onChange={e => setHallFormData({...hallFormData, capacity: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-bold" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Base Price (Rs.) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required 
                        type="number" 
                        min="0" 
                        value={hallFormData.price} 
                        onChange={e => setHallFormData({...hallFormData, price: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-bold" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowHallModal(false)} 
                  className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-[#0F172A] text-[#D4AF37] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                >
                  {editingHallId ? 'Update Premium Venue' : 'Create Premium Venue'}
                </button>
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
      {/* MENU DETAILS MODAL */}
      {showMenuModal && selectedMenuPkg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setShowMenuModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>{selectedMenuPkg} Package</h2>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-widest mt-1">Full Catering Menu Details</p>
              </div>
              <button onClick={() => setShowMenuModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {Object.entries(packageDetails[selectedMenuPkg].fullMenu).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-1.5 shrink-0" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price: Rs. {packageDetails[selectedMenuPkg].price.toLocaleString()} per plate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
