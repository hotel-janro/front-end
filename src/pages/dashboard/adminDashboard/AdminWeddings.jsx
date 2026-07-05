import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Users, DollarSign, Plus, Search, X, Edit, Trash2, Upload, ImageIcon, Loader2, Eye, Info, Phone, Mail, MapPin, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch, getImageUrl } from '../../../api';

// Helper to convert 12-hour components back to 24-hour "HH:MM"
const to24Hour = (h, m, period) => {
  let hr = parseInt(h, 10);
  if (period === 'PM' && hr < 12) hr += 12;
  if (period === 'AM' && hr === 12) hr = 0;
  return `${String(hr).padStart(2, '0')}:${m}`;
};

// Helper to parse 24-hour "HH:MM" to 12-hour components
const from24Hour = (timeStr) => {
  if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };
  const [hStr, mStr] = timeStr.split(':');
  let hr = parseInt(hStr, 10);
  let period = 'AM';
  if (hr >= 12) {
    period = 'PM';
    if (hr > 12) hr -= 12;
  }
  if (hr === 0) hr = 12;
  return {
    hour: String(hr).padStart(2, '0'),
    minute: mStr || '00',
    period
  };
};

// Custom Dropdown Time Picker Component
const TimeDropdownPicker = ({ value, onChange, className = "", showIcon = false }) => {
  const { hour, minute, period } = from24Hour(value);

  const handleSelectChange = (newHour, newMin, newPeriod) => {
    onChange(to24Hour(newHour, newMin, newPeriod));
  };

  return (
    <div className={`flex items-center justify-center gap-0.5 bg-white px-2 py-2 rounded-xl border border-slate-200 w-fit ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-0.5" />}
      <select 
        value={hour} 
        onChange={e => handleSelectChange(e.target.value, minute, period)}
        className="appearance-none bg-transparent outline-none cursor-pointer text-slate-800 font-bold text-xs w-6 text-center hover:bg-slate-100 rounded transition-colors"
      >
        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-xs font-bold text-slate-400 px-0.5">:</span>
      <select 
        value={minute} 
        onChange={e => handleSelectChange(hour, e.target.value, period)}
        className="appearance-none bg-transparent outline-none cursor-pointer text-slate-800 font-bold text-xs w-6 text-center hover:bg-slate-100 rounded transition-colors"
      >
        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select 
        value={period} 
        onChange={e => handleSelectChange(hour, minute, e.target.value)}
        className="appearance-none bg-transparent outline-none cursor-pointer text-[#D4AF37] font-extrabold text-xs w-8 text-center ml-0.5 hover:bg-amber-50 rounded transition-colors"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export function AdminWedding() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Package management state
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [viewingPackage, setViewingPackage] = useState(null);
  const [showViewPackageModal, setShowViewPackageModal] = useState(false);
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    price: '',
    bites: '',
    inclusions: ''
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    groomName: '',
    groomPhone: '',
    brideName: '',
    bridePhone: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '16:00',
    eventType: 'Wedding',
    guestCount: '',
    hallId: '',
    cateringPackage: '100 Pax Package',
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
  const [bookingFormError, setBookingFormError] = useState('');

  const handleEditBooking = (booking) => {
    setEditingId(booking._id);
    setFormData({
      customerName: booking.customerName || '',
      customerPhone: booking.customerPhone || '',
      customerEmail: booking.customerEmail || '',
      groomName: booking.groomName || '',
      groomPhone: booking.groomPhone || '',
      brideName: booking.brideName || '',
      bridePhone: booking.bridePhone || '',
      eventDate: booking.eventDate ? booking.eventDate.split('T')[0] : '',
      startTime: booking.startTime || '09:00',
      endTime: booking.endTime || '16:00',
      eventType: booking.eventType || 'Wedding',
      guestCount: booking.guestCount || '',
      hallId: booking.hallId?._id || booking.hallId || '',
      cateringPackage: booking.cateringPackage || (booking.bookingCategory === 'Wedding' ? '100 Pax Package' : 'Menu I'),
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
    setBookingFormError('');
    setShowModal(true);
  };

  // Hall Management State
  const [showHallModal, setShowHallModal] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);
  const [hallFormData, setHallFormData] = useState({
    hallName: '',
    description: '',
    capacity: '',
    price: '',
    type: 'Hall',
    status: 'available',
    image: ''
  });



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

  const eventPackageDetails = {
    'Lunch With Pool': {
      price: 2415,
      highlights: ['Egg Rice', 'Devilled Chicken', 'Vegetable Chopsy', 'Hot Butter Mushroom', 'Yoghurt & Chilly Paste'],
      fullMenu: {
        WelcomeDrinks: ['None'],
        Appetizers: ['None'],
        MainCourse: ['Egg Rice', 'Devilled Chicken', 'Vegetable Chopsy', 'Hot Butter mushroom', 'Chilly Paste'],
        LiveStations: ['None'],
        Desserts: ['Yoghurt']
      }
    },
    'Menu I': {
      price: 2900,
      highlights: ['Chicken Curry', 'Fish Ambultiyal', 'Brinjall Moju', 'Dessert (Ice Cream & Jelly)'],
      fullMenu: {
        WelcomeDrinks: ['Welcome Drink'],
        Appetizers: ['Vegetable Salad'],
        MainCourse: ['Vegetable Rice', 'White Rice', 'Chicken Curry', 'Fish Ambultiyal', 'Dhal Curry', 'Brinjall Moju', 'Dry Fish', 'Dry chilli Kankun'],
        LiveStations: ['None'],
        Desserts: ['Ice Cream', 'Jelly']
      }
    },
    'Menu II': {
      price: 2750,
      highlights: ['Chilli Chicken', 'Devilled Fish', 'Hot Butter Mushroom', 'Dessert (Ice Cream & Jelly)'],
      fullMenu: {
        WelcomeDrinks: ['Welcome Drink'],
        Appetizers: ['None'],
        MainCourse: ['Vegetable Rice', 'Egg Noodles', 'Chilli Chicken', 'Devilled Fish', 'Vegetable Chopsy', 'Hot Butter Mushroom', 'Dry chilli Kankun'],
        LiveStations: ['None'],
        Desserts: ['Ice Cream', 'Jelly']
      }
    }
  };

  const packageDetails = formData.bookingCategory === 'Wedding' ? weddingPackageDetails : eventPackageDetails;
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
      const [bookingsRes, hallsRes, packagesRes] = await Promise.all([
        apiFetch('/wedding/bookings'),
        apiFetch('/wedding/halls'),
        apiFetch('/wedding/packages')
      ]);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (hallsRes.success) setHalls(hallsRes.data);
      if (packagesRes.success) setPackages(packagesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load wedding data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditingPackageId(pkg._id);
    setPackageFormData({
      name: pkg.name,
      type: pkg.type || 'wedding',
      price: pkg.price,
      bites: pkg.bites || '',
      inclusions: pkg.inclusions ? pkg.inclusions.join(', ') : ''
    });
    setShowPackageModal(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!packageFormData.name || packageFormData.name.trim().length < 3) {
      alert("Package Name must be at least 3 characters long");
      return;
    }

    const priceNum = Number(packageFormData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Price per plate must be a valid positive number greater than 0");
      return;
    }

    const formattedInclusions = packageFormData.inclusions
      ? packageFormData.inclusions.split(',').map(i => i.trim()).filter(Boolean)
      : [];

    if (formattedInclusions.length === 0) {
      alert("Please enter at least one menu inclusion");
      return;
    }

    try {
      setIsSavingPackage(true);
      const url = editingPackageId 
        ? `/wedding/packages/${editingPackageId}`
        : '/wedding/packages';
      
      const method = editingPackageId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          name: packageFormData.name.trim(),
          type: packageFormData.type || 'wedding',
          price: priceNum,
          bites: packageFormData.bites.trim(),
          inclusions: formattedInclusions
        })
      });

      if (res.success) {
        setShowPackageModal(false);
        fetchData();
      }
    } catch (error) {
      alert(error.message || "Failed to save package");
    } finally {
      setIsSavingPackage(false);
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

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this booking? This action cannot be undone.")) return;
    try {
      const res = await apiFetch(`/wedding/bookings/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchData();
      }
    } catch (error) {
      alert("Failed to delete booking: " + error.message);
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
      if (formData.cateringPackage && packageDetails[formData.cateringPackage]) {
        subtotal += packageDetails[formData.cateringPackage].price * Number(formData.guestCount);
      } else if (formData.cateringPackage === 'Custom') {
        subtotal += Number(formData.customPackagePrice || 0) * Number(formData.guestCount);
      } else if (formData.bookingCategory !== 'Wedding') {
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
  /* ─────────── Step-by-step validation helper ─────────── */
  const validateStep = (step) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (step === 1) {
      // Customer details
      if (!formData.customerName || formData.customerName.trim().length < 2) return 'Please enter the Customer Full Name.';

      const cleanPhone = formData.customerPhone.replace(/\s+/g, '');
      if (!/^(0\d{9}|\+94\d{9})$/.test(cleanPhone)) return 'Invalid Customer Phone. Enter a valid 10-digit Sri Lankan number (e.g. 0712345678).';

      if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) return 'Invalid Customer Email address.';

      const cleanNIC = formData.customerNIC.replace(/\s+/g, '').toUpperCase();
      if (!cleanNIC) return 'Please enter the Customer NIC Number.';
      if (!/^(\d{9}[VX]|\d{12})$/.test(cleanNIC)) return 'Invalid NIC. Use old format (123456789V) or new 12-digit format.';

      if (formData.groomPhone && !/^(0\d{9}|\+94\d{9})$/.test(formData.groomPhone.replace(/\s+/g, ''))) {
        return "Invalid Groom's Phone Number.";
      }
      if (formData.bridePhone && !/^(0\d{9}|\+94\d{9})$/.test(formData.bridePhone.replace(/\s+/g, ''))) {
        return "Invalid Bride's Phone Number.";
      }

      return null;
    }

    if (step === 2) {
      // Event date & time & hall
      if (!formData.eventDate) return 'Please select an Event Date.';

      const selectedDate = new Date(formData.eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) return 'Event date cannot be in the past. Please choose a future date.';

      if (!formData.hallId) return 'Please select a Venue / Hall.';
      if (!formData.guestCount || Number(formData.guestCount) < 1) return 'Please enter a valid Guest Count (at least 1).';
      if (!formData.startTime || !formData.endTime) return 'Please set both Start Time and End Time.';

      const [sH, sM] = formData.startTime.split(':').map(Number);
      const [eH, eM] = formData.endTime.split(':').map(Number);
      const startMins = sH * 60 + sM;
      const endMins = eH * 60 + eM;
      if (formData.timeSlot === 'Day' && endMins <= startMins) {
        return 'End Time must be after Start Time for Day events.';
      }

      // Guest Capacity Check
      const selectedHall = halls.find(h => h._id === formData.hallId);
      if (selectedHall && Number(formData.guestCount) > selectedHall.capacity) {
        return `Guest count (${formData.guestCount}) exceeds the maximum capacity of ${selectedHall.hallName} (${selectedHall.capacity}).`;
      }

      // Check for overlapping bookings
      const overlappingBooking = bookings.find(b => {
        if (editingId && b._id === editingId) return false;
        if (b.bookingStatus === 'Cancelled' || b.bookingStatus === 'CANCELLED') return false;
        
        // Use hallId instead of hall
        const existingHallId = b.hallId?._id || b.hallId;
        if (existingHallId !== formData.hallId) return false;

        if (!b.eventDate) return false;
        
        // Comparing dates locally to avoid timezone mismatches
        const existingDateStr = new Date(b.eventDate).toLocaleDateString('en-CA');
        const formDateStr = new Date(formData.eventDate).toLocaleDateString('en-CA');
        if (existingDateStr !== formDateStr) return false;

        if (!b.startTime || !b.endTime) return true; 
        
        const parseMins = (t) => {
          if (!t) return 0;
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };
        const existStart = parseMins(b.startTime);
        const existEnd = parseMins(b.endTime);

        return (startMins < existEnd && existStart < endMins);
      });

      if (overlappingBooking) {
        const formatTime = (t) => {
          if (!t) return '';
          const [h, m] = t.split(':');
          let hr = parseInt(h);
          const p = hr >= 12 ? 'PM' : 'AM';
          if (hr > 12) hr -= 12;
          if (hr === 0) hr = 12;
          return `${hr}:${m} ${p}`;
        };
        const sTime = formatTime(overlappingBooking.startTime);
        const eTime = formatTime(overlappingBooking.endTime);
        const hallName = halls.find(h => h._id === formData.hallId)?.hallName || 'This hall';
        return `OVERBOOKING PREVENTED: ${hallName} is already booked on this date from ${sTime} to ${eTime}. Please select a different time, hall, or date.`;
      }

      return null;
    }

    if (step === 3) {
      // Catering/package
      if (formData.bookingCategory === 'Wedding' && !formData.cateringPackage) {
        return 'Please select a Catering Package for the Wedding.';
      }
      return null;
    }

    if (step === 4) {
      // Advance payment
      if (!formData.advancePaid || isNaN(Number(formData.advancePaid)) || Number(formData.advancePaid) < 0) {
        return 'Please enter a valid Advance Paid amount.';
      }
      return null;
    }

    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setBookingFormError(error);
      return;
    }
    setBookingFormError('');
    setCurrentStep(currentStep + 1);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingFormError('');

    // Final validations before submit
    for (let step = 1; step <= 4; step++) {
      const error = validateStep(step);
      if (error) {
        setBookingFormError(error);
        setCurrentStep(step);
        return;
      }
    }

    // Past date check (second safety net)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.eventDate);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setBookingFormError('Event date cannot be in the past. Please choose a future date.');
      setCurrentStep(1);
      return;
    }

    try {
      const url = editingId ? `/wedding/bookings/${editingId}` : '/wedding/bookings';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setShowModal(false);
        setEditingId(null);
        setBookingFormError('');
        setFormData({
          customerName: '', customerPhone: '', customerEmail: '',
          groomName: '', groomPhone: '', brideName: '', bridePhone: '',
          eventDate: '', startTime: '09:00', endTime: '16:00', eventType: 'Wedding',
          guestCount: '', hallId: '', cateringPackage: '100 Pax Package',
          selectedMeals: [], optionalServices: [], specialRequests: '', 
          advancePaid: '', bookingCategory: 'Wedding', venuePreference: 'Indoor', timeSlot: 'Day',
          seatingStyle: 'Round Tables', dietaryNotes: '', corkageIncluded: false,
          customerNIC: '', customerAddress: '', discountPercentage: 0, complimentaryItems: [],
          nekathTimes: { poruwa: '', teaTime: '', lunchDinner: '' }
        });
        setSearchTerm(''); // Clear search term to prevent lingering searches
        fetchData();
      }
    } catch (error) {
      // Show backend errors inline (e.g. hall already booked on that date)
      setBookingFormError(error.message || 'Failed to save booking. Please try again.');
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

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await apiFetch(`/wedding/packages/${id}`, { method: 'DELETE' });
      if (res.success) {
        alert("Package deleted successfully!");
        fetchData();
      }
    } catch (error) {
      alert(error.message || "Failed to delete package");
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

  const filteredPackages = (packages || []).filter((pkg) =>
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          {activeTab === 'packages' && (
            <button 
              onClick={() => {
                setEditingPackageId(null);
                setPackageFormData({ name: '', price: '', bites: '', inclusions: '', type: 'wedding' });
                setShowPackageModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F172A] rounded-xl hover:bg-[#B8962D] transition-colors shadow-lg shadow-[#D4AF37]/20 font-bold cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Package
            </button>
          )}
          {activeTab === 'halls' && (
            <button 
              onClick={() => {
                setEditingHallId(null);
                setHallFormData({ hallName: '', description: '', capacity: '', price: '', type: 'Hall', status: 'available', image: '' });
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
                setBookingFormError('');
                setFormData({
                  customerName: '', customerPhone: '', customerEmail: '',
                  groomName: '', groomPhone: '', brideName: '', bridePhone: '',
                  eventDate: '', startTime: '09:00', endTime: '16:00', eventType: 'Wedding',
                  guestCount: '', hallId: '', cateringPackage: '100 Pax Package',
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
            <button 
              onClick={() => setActiveTab('packages')} 
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'packages' ? 'text-[#D4AF37] border-[#D4AF37] bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
              Package Management
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
                  name="adminWeddingSearch"
                  autoComplete="off"
                  placeholder={
                    activeTab === 'bookings' ? 'Search bookings by customer name...' : 
                    activeTab === 'halls' ? 'Search halls...' : 'Search packages...'
                  } 
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

        {activeTab === 'bookings' && (
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
                        <div className="flex flex-wrap gap-2 items-center">
                          <button 
                            onClick={() => {
                              setViewingBooking(booking);
                              setShowViewModal(true);
                            }} 
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          {booking.bookingStatus === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(booking._id, 'confirmed')} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Confirm</button>
                              <button onClick={() => handleStatusChange(booking._id, 'rejected')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                            </>
                          )}
                          {booking.bookingStatus === 'confirmed' && (
                            <>
                              <button onClick={() => handleEditBooking(booking)} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center gap-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
                              {booking.paymentStatus !== 'Fully Paid' && (
                                <button onClick={() => handleAddPayment(booking)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-semibold flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Pay</button>
                              )}
                              <button onClick={() => handleStatusChange(booking._id, 'cancelled')} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>
                            </>
                          )}
                          <button onClick={() => handleDeleteBooking(booking._id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-semibold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'halls' && (
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
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><Users className="w-4 h-4 text-[#D4AF37]" />Capacity: {hall.capacity} guests</div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl"><DollarSign className="w-4 h-4 text-[#D4AF37]" />Rs. {hall.price?.toLocaleString()} base price</div>
                      </div>
                      {hall.description && (
                        <details className="mb-4 group">
                          <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 hover:text-[#D4AF37] transition-colors select-none">
                            <Info className="w-3.5 h-3.5" />
                            <span>View Venue Details</span>
                          </summary>
                          <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <ul className="space-y-2">
                              {hall.description.split(/[.,]|\band\b/i).map(p => p.trim()).filter(p => p.length > 5).map((point, idx) => (
                                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-1.5 shrink-0" />
                                  <span className="leading-relaxed">{point.charAt(0).toUpperCase() + point.slice(1)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      )}
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingHallId(hall._id);
                            setHallFormData({
                              hallName: hall.hallName,
                              description: hall.description || '',
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

        {activeTab === 'packages' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price / Plate</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bites Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inclusions Count</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading packages...</td></tr>
                ) : filteredPackages.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">No packages found</td></tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{pkg.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${
                          pkg.type === 'wedding' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {pkg.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">Rs. {pkg.price?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{pkg.bites || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-600">{pkg.inclusions?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setViewingPackage(pkg);
                              setShowViewPackageModal(true);
                            }}
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                          </button>
                          <button 
                            onClick={() => handleEditPackage(pkg)}
                            className="text-xs bg-[#0F172A] text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D4AF37]" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePackage(pkg._id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                            title="Delete Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                        onClick={() => { setFormData({...formData, bookingCategory: 'Wedding', cateringPackage: '100 Pax Package'}); setCurrentStep(1); }}
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
                        onClick={() => { setFormData({...formData, bookingCategory: 'Event', cateringPackage: 'Menu I'}); setCurrentStep(1); }}
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
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                          <Users className="w-4 h-4 text-[#D4AF37]" /> Primary Contact Info
                        </h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Customer Name *</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-sm" placeholder="Mr. John Doe" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number *</label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Phone className="w-4 h-4" />
                              </div>
                              <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-sm" placeholder="+94 7X XXX XXXX" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Customer NIC *</label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Info className="w-4 h-4" />
                              </div>
                              <input required type="text" value={formData.customerNIC} onChange={e => setFormData({...formData, customerNIC: e.target.value})} className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-sm" placeholder="XXXX-XXXX-XXXX" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input type="email" value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-sm" placeholder="john@example.com" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Permanent Address *</label>
                          <div className="relative">
                            <div className="absolute left-4 top-4 text-slate-400">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <textarea required value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} rows="2" className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-semibold text-sm" placeholder="Current Billing Address" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        {formData.bookingCategory === 'Wedding' ? (
                          <>
                            <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                              <Heart className="w-4 h-4 text-[#D4AF37]" /> The Happy Couple
                            </h4>
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-2xl border border-slate-200/60 space-y-3">
                                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Groom Details</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-3.5 h-3.5" /></div>
                                    <input type="text" value={formData.groomName} onChange={e => setFormData({...formData, groomName: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold" placeholder="Name" />
                                  </div>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-3.5 h-3.5" /></div>
                                    <input type="tel" value={formData.groomPhone} onChange={e => setFormData({...formData, groomPhone: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold" placeholder="Phone" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-white rounded-2xl border border-slate-200/60 space-y-3">
                                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Bride Details</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-3.5 h-3.5" /></div>
                                    <input type="text" value={formData.brideName} onChange={e => setFormData({...formData, brideName: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold" placeholder="Name" />
                                  </div>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-3.5 h-3.5" /></div>
                                    <input type="tel" value={formData.bridePhone} onChange={e => setFormData({...formData, bridePhone: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-semibold" placeholder="Phone" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                              <Calendar className="w-4 h-4 text-[#D4AF37]" /> Event Details
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Event Type *</label>
                                <select required value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-sm">
                                  {['Wedding Reception', 'Homecoming', 'Engagement Ceremony', 'Birthday Celebration', 'Anniversary Party', 'Puberty Ceremony', 'Corporate Meeting / Seminar', 'Conference / Workshop', 'Company Annual Party', 'Product Launch', 'Graduation Ceremony', 'School / Alumni Reunion', 'Musical Show / Concert', 'Other'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Venue Preference</label>
                                <div className="flex gap-4">
                                  {['Indoor', 'Outdoor'].map(pref => (
                                    <button key={pref} onClick={() => setFormData({...formData, venuePreference: pref})} type="button" className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all text-xs uppercase tracking-wider ${formData.venuePreference === pref ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                                      {pref}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        <div className="pt-4">
                          <div className="p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-0.5">Booking Path</p>
                              <p className="text-xs font-bold text-slate-700">{formData.bookingCategory} Booking</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                          <Users className="w-4 h-4 text-[#D4AF37]" /> Venue Details
                        </h4>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Select Hall / Area *</label>
                          <select required value={formData.hallId} onChange={e => setFormData({...formData, hallId: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-sm">
                            <option value="">Choose a Venue</option>
                            {halls
                              .filter(hall => formData.bookingCategory === 'Wedding' ? hall.type === 'Hall' : hall.type === 'Event Area')
                              .map(hall => <option key={hall._id} value={hall._id}>{hall.hallName} (Max: {hall.capacity})</option>)
                            }
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Guest Count *</label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Users className="w-3.5 h-3.5" />
                              </div>
                              <input required type="number" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-bold" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Seating Style</label>
                            <select value={formData.seatingStyle} onChange={e => setFormData({...formData, seatingStyle: e.target.value})} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none transition-all text-xs font-bold">
                              {['Round Tables', 'Theater', 'U-Shape', 'Classroom', 'Cocktail'].map(style => <option key={style} value={style}>{style}</option>)}
                            </select>
                          </div>
                        </div>
                        {formData.bookingCategory === 'Wedding' && (
                          <div className="p-4 bg-white rounded-2xl border border-slate-200/60">
                            <h5 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Ceremony & Event Milestones</h5>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Main Ceremony</span>
                                <TimeDropdownPicker value={formData.nekathTimes.poruwa} onChange={newVal => setFormData({...formData, nekathTimes: {...formData.nekathTimes, poruwa: newVal}})} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Tea Time</span>
                                <TimeDropdownPicker value={formData.nekathTimes.teaTime} onChange={newVal => setFormData({...formData, nekathTimes: {...formData.nekathTimes, teaTime: newVal}})} />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Lunch / Dinner</span>
                                <TimeDropdownPicker value={formData.nekathTimes.lunchDinner} onChange={newVal => setFormData({...formData, nekathTimes: {...formData.nekathTimes, lunchDinner: newVal}})} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" /> Schedule Details
                        </h4>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Event Date *</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <input 
                              required 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              value={formData.eventDate} 
                              onChange={e => { setFormData({...formData, eventDate: e.target.value}); setBookingFormError(''); }} 
                              className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-bold text-sm" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Start Time *</label>
                            <TimeDropdownPicker showIcon={true} value={formData.startTime} onChange={newVal => setFormData({...formData, startTime: newVal})} className="w-full" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">End Time *</label>
                            <TimeDropdownPicker showIcon={true} value={formData.endTime} onChange={newVal => setFormData({...formData, endTime: newVal})} className="w-full" />
                          </div>
                        </div>
                        <div className="pt-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Time Slot</label>
                          <div className="flex gap-4">
                            {['Day', 'Night'].map(slot => (
                              <button key={slot} onClick={() => setFormData({...formData, timeSlot: slot})} type="button" className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all text-xs uppercase tracking-wider ${formData.timeSlot === slot ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-lg' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                                {slot} Time
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                      <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-2 border-b border-slate-200/60 pb-3">
                        <Heart className="w-4 h-4 text-[#D4AF37]" /> Catering Package Selection
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(packageDetails)
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
                            className={`group relative rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                              formData.cateringPackage === pkg 
                                ? 'border-[#0F172A] bg-white shadow-xl shadow-slate-900/5 scale-[1.02]' 
                                : 'border-slate-200/60 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className={`font-bold text-sm block ${formData.cateringPackage === pkg ? 'text-slate-900' : 'text-slate-600'}`}>{pkg}</span>
                                  <span className="text-[11px] text-[#D4AF37] font-black block mt-0.5">Rs. {packageDetails[pkg].price.toLocaleString()} / plate</span>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                  formData.cateringPackage === pkg ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-slate-100 text-transparent border border-slate-200'
                                }`}>
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <ul className="text-[10px] text-slate-500 space-y-1.5 mb-4">
                                {packageDetails[pkg].highlights.map((highlight, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-[#D4AF37] font-bold mt-0.5">•</span>
                                    <span>{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setSelectedMenuPkg(pkg); setShowMenuModal(true); }}
                              className="text-[10px] font-bold text-[#0F172A] underline hover:text-[#D4AF37] transition-colors mt-auto self-start"
                            >
                              View Full Menu
                            </button>
                          </div>
                        ))}

                        <div 
                          onClick={() => setFormData({...formData, cateringPackage: 'Custom'})}
                          className={`rounded-2xl border-2 p-5 cursor-pointer transition-all flex flex-col justify-between ${
                            formData.cateringPackage === 'Custom' 
                              ? 'border-[#D4AF37] bg-white shadow-xl shadow-[#D4AF37]/5 scale-[1.02]' 
                              : 'border-slate-200/60 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className={`font-bold text-sm block ${formData.cateringPackage === 'Custom' ? 'text-[#0F172A]' : 'text-slate-600'}`}>Custom Package</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Tailor-made menu for specific requirements.</span>
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                formData.cateringPackage === 'Custom' ? 'bg-[#D4AF37] text-[#0F172A]' : 'bg-slate-100 text-transparent border border-slate-200'
                              }`}>
                                <Plus className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                          
                          {formData.cateringPackage === 'Custom' && (
                            <div className="mt-3 space-y-3 pt-3 border-t border-[#D4AF37]/20">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Agreed Price Per Plate *</label>
                                <input 
                                  type="number" 
                                  required
                                  value={formData.customPackagePrice}
                                  onChange={e => setFormData({...formData, customPackagePrice: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none text-xs font-bold"
                                  placeholder="Rs. 3800"
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Menu Notes / Details</label>
                                <textarea 
                                  rows="2"
                                  value={formData.customPackageNotes}
                                  onChange={e => setFormData({...formData, customPackageNotes: e.target.value})}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#D4AF37] outline-none text-[10px]"
                                  placeholder="e.g. Special menu with specific modifications."
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Dietary Notes / Corkage</label>
                          <textarea value={formData.dietaryNotes} onChange={e => setFormData({...formData, dietaryNotes: e.target.value})} rows="3" placeholder="Vegetarian counts, Allergies, Special requests..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#D4AF37] outline-none transition-all font-medium text-xs resize-none"></textarea>
                        </div>
                        <div className="flex flex-col justify-center">
                          <label className="flex items-center gap-3 cursor-pointer p-4 bg-white rounded-2xl border border-slate-200/60 hover:border-[#D4AF37]/30 transition-all">
                            <input type="checkbox" checked={formData.corkageIncluded} onChange={e => setFormData({...formData, corkageIncluded: e.target.checked})} className="w-5 h-5 rounded-lg accent-[#0F172A]" />
                            <div>
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Corkage Included</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Allow customer to bring their own liquor.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95">
                    <div className="bg-[#0F172A] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <DollarSign className="w-24 h-24 text-[#D4AF37]" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                          <div>
                            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Booking Invoice</p>
                            <h3 className="text-xl font-bold text-white">{formData.customerName}</h3>
                            <p className="text-white/60 text-xs mt-1">{formData.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Estimated Total</p>
                            <h3 className="text-2xl font-black text-[#D4AF37] mt-0.5">Rs. {calculateTotal().toLocaleString()}</h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">Details</span>
                            <div className="space-y-1.5 text-white/70">
                              <p><span className="font-semibold text-white/90">Type:</span> {formData.bookingCategory} Booking ({formData.eventType})</p>
                              {formData.bookingCategory === 'Wedding' && (
                                <>
                                  <p><span className="font-semibold text-white/90">Groom:</span> {formData.groomName || 'N/A'}</p>
                                  <p><span className="font-semibold text-white/90">Bride:</span> {formData.brideName || 'N/A'}</p>
                                </>
                              )}
                              <p><span className="font-semibold text-white/90">Date & Slot:</span> {formData.eventDate} ({formData.timeSlot} Time)</p>
                              <p><span className="font-semibold text-white/90">Venue:</span> {halls.find(h => h._id === formData.hallId)?.hallName} ({formData.guestCount} Guests)</p>
                              <p><span className="font-semibold text-white/90">Package:</span> {formData.cateringPackage}</p>
                            </div>
                          </div>

                          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
                            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Pricing & Payment</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">Discount (%)</label>
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
                                    className="w-full px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg focus:border-[#D4AF37] outline-none text-white font-bold text-xs pr-7" 
                                    placeholder="0" 
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#D4AF37] pointer-events-none">%</div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-white/50 uppercase mb-1">Advance (20% Min) *</label>
                                <input required type="number" min={calculateTotal() * 0.2} value={formData.advancePaid} onChange={e => setFormData({...formData, advancePaid: e.target.value})} className="w-full px-3 py-1.5 bg-white/10 border border-[#D4AF37]/50 rounded-lg focus:border-[#D4AF37] outline-none text-white font-bold text-xs" />
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-3 space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-white/60">
                                <span>Gross Subtotal:</span>
                                <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                              </div>
                              {formData.discountPercentage > 0 && (
                                <div className="flex justify-between text-[#D4AF37] font-semibold">
                                  <span>Discount ({formData.discountPercentage}%):</span>
                                  <span>- Rs. {(calculateSubtotal() * Number(formData.discountPercentage) / 100).toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-white/90 font-bold border-t border-white/5 pt-1.5">
                                <span>Net Total:</span>
                                <span className="text-[#D4AF37]">Rs. {calculateTotal().toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-emerald-400 font-bold">
                                <span>Advance Paid:</span>
                                <span>Rs. {Number(formData.advancePaid || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-red-400 font-bold border-t border-white/5 pt-1.5">
                                <span>Balance Due:</span>
                                <span>Rs. {Math.max(0, calculateTotal() - (Number(formData.advancePaid) || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/60 space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Requests & Dietary Notes</h5>
                      <p className="text-xs text-slate-600 italic">
                        {formData.specialRequests || formData.dietaryNotes 
                          ? `"${[formData.specialRequests, formData.dietaryNotes].filter(Boolean).join(' | ')}"` 
                          : 'No special requests or dietary notes provided'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Navigation */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4 shrink-0">
              {/* Inline Error Banner */}
              {bookingFormError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  <p className="text-xs font-semibold leading-relaxed">{bookingFormError}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  onClick={() => { 
                    if (currentStep > 0) { 
                      setBookingFormError(''); 
                      setCurrentStep(currentStep - 1); 
                    } else { 
                      setShowModal(false); 
                    }
                  }}
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
                >
                  {currentStep === 0 ? 'Cancel' : 'Previous Step'}
                </button>
                
                <div className="flex gap-4">
                  {currentStep < 4 ? (
                    <button 
                      type="button" 
                      onClick={handleNextStep}
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
                      Confirm &amp; Create Booking
                    </button>
                  )}
                </div>
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
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Description</label>
                  <textarea 
                    value={hallFormData.description} 
                    onChange={e => setHallFormData({...hallFormData, description: e.target.value})} 
                    rows="3"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all font-medium text-slate-700 text-sm" 
                    placeholder="e.g. Fully air-conditioned with LED lighting, wireless sound system, and dedicated bridal stage." 
                  />
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
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">Rs.</span>
                    <input 
                      autoFocus
                      required 
                      type="number" 
                      min="1"
                      value={paymentAmount} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || Number(val) >= 0) {
                          setPaymentAmount(val);
                        }
                      }} 
                      placeholder="Enter amount..."
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#D4AF37] focus:bg-white outline-none transition-all text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

      {/* VIEW BOOKING MODAL */}
      {showViewModal && viewingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F172A] text-white p-6 md:p-8 flex justify-between items-center relative shrink-0">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#0F172A]" />
                </div>
                <div>
                  <h2 className="text-2xl" style={{ fontFamily: "DM Serif Display, serif" }}>Booking Details</h2>
                  <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Ref: {viewingBooking._id}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Status Badges */}
                  <div className="flex gap-2">
                    <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${getStatusColor(viewingBooking.bookingStatus)}`}>
                      {viewingBooking.bookingStatus}
                    </span>
                    <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                      viewingBooking.paymentStatus === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      viewingBooking.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {viewingBooking.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#D4AF37]" /> Customer Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Name:</span> <span className="font-bold text-slate-900">{viewingBooking.customerName}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Phone:</span> <span className="font-bold text-slate-900">{viewingBooking.customerPhone}</span></div>
                      {viewingBooking.customerEmail && <div className="flex justify-between"><span className="text-slate-500 font-medium">Email:</span> <span className="font-bold text-slate-900">{viewingBooking.customerEmail}</span></div>}
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">NIC:</span> <span className="font-bold text-slate-900">{viewingBooking.customerNIC || 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Address:</span> <span className="font-bold text-slate-900 text-right w-1/2">{viewingBooking.customerAddress || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Couple Info */}
                  {viewingBooking.bookingCategory === 'Wedding' && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-[#D4AF37]" /> The Happy Couple</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Groom</p>
                          <p className="text-sm font-bold text-slate-900">{viewingBooking.groomName || 'N/A'} {viewingBooking.groomPhone ? `(${viewingBooking.groomPhone})` : ''}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Bride</p>
                          <p className="text-sm font-bold text-slate-900">{viewingBooking.brideName || 'N/A'} {viewingBooking.bridePhone ? `(${viewingBooking.bridePhone})` : ''}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#D4AF37]" /> Event Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Type:</span> <span className="font-bold text-slate-900">{viewingBooking.eventType} ({viewingBooking.bookingCategory})</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Date:</span> <span className="font-bold text-[#0F172A]">{new Date(viewingBooking.eventDate).toLocaleDateString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Time:</span> <span className="font-bold text-slate-900">{viewingBooking.startTime} - {viewingBooking.endTime} ({viewingBooking.timeSlot})</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Venue Pref:</span> <span className="font-bold text-slate-900">{viewingBooking.venuePreference}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Hall & Catering */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Venue & Catering</h3>
                    <div className="p-4 bg-slate-50 rounded-xl mb-4 text-center">
                      <p className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>{viewingBooking.hallId?.hallName || 'Unknown Hall'}</p>
                      <p className="text-sm font-bold text-[#D4AF37] mt-1">{viewingBooking.guestCount} Guests</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Package:</span> <span className="font-bold text-slate-900">{viewingBooking.cateringPackage}</span></div>
                      {viewingBooking.cateringPackage === 'Custom' && (
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Custom Price:</span> <span className="font-bold text-slate-900">Rs. {viewingBooking.customPackagePrice?.toLocaleString()}</span></div>
                      )}
                      {viewingBooking.selectedMeals && viewingBooking.selectedMeals.length > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500 font-medium">Meals:</span> <span className="font-bold text-slate-900">{viewingBooking.selectedMeals.join(', ')}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Seating:</span> <span className="font-bold text-slate-900">{viewingBooking.seatingStyle}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Corkage Included:</span> <span className="font-bold text-slate-900">{viewingBooking.corkageIncluded ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>

                  {/* Extras */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Extras & Notes</h3>
                    
                    {viewingBooking.optionalServices && viewingBooking.optionalServices.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Optional Services</p>
                        <div className="flex flex-wrap gap-2">
                          {viewingBooking.optionalServices.map(s => (
                            <span key={s} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingBooking.complimentaryItems && viewingBooking.complimentaryItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Complimentary Items</p>
                        <div className="flex flex-wrap gap-2">
                          {viewingBooking.complimentaryItems.map(s => (
                            <span key={s} className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8962D] border border-[#D4AF37]/20 text-xs rounded-md font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingBooking.specialRequests && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Special Requests</p>
                        <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"{viewingBooking.specialRequests}"</p>
                      </div>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="bg-[#0F172A] p-6 rounded-2xl text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <DollarSign className="w-20 h-20 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-widest mb-4 relative z-10">Financial Summary</h3>
                    
                    <div className="space-y-2 text-sm relative z-10">
                      <div className="flex justify-between text-white/70"><span>Total Amount:</span> <span>Rs. {viewingBooking.totalAmount?.toLocaleString() || 0}</span></div>
                      <div className="flex justify-between text-emerald-400"><span>Advance Paid:</span> <span>Rs. {viewingBooking.advancePaid?.toLocaleString() || 0}</span></div>
                      <div className="pt-3 mt-3 border-t border-white/10 flex justify-between font-bold text-lg">
                        <span className="text-white">Balance Due:</span> 
                        <span className="text-[#D4AF37]">Rs. {Math.max(0, (viewingBooking.totalAmount || 0) - (viewingBooking.advancePaid || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* EDIT PACKAGE MODAL */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0F172A] text-white p-8 flex justify-between items-center relative shrink-0">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/10 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {editingPackageId ? 'Edit Package' : 'Add New Package'}
                </h2>
                <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold">Update package pricing, bites, and inclusions</p>
              </div>
              <button 
                onClick={() => setShowPackageModal(false)} 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePackageSubmit} className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Package Name *</label>
                <input 
                  type="text" 
                  required
                  value={packageFormData.name} 
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Package Type *</label>
                <select 
                  value={packageFormData.type || 'wedding'} 
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm font-semibold"
                >
                  <option value="wedding">Wedding Package</option>
                  <option value="event">Other Event Package</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Price per plate (Rs.) *</label>
                <input 
                  type="number" 
                  required
                  value={packageFormData.price} 
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Free Bites Details</label>
                <input 
                  type="text" 
                  value={packageFormData.bites} 
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, bites: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm font-semibold"
                  placeholder="e.g. Free Bites: Chicken 15Kg, Sausages 5Kg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Menu Inclusions (Comma Separated)</label>
                <textarea 
                  rows="6"
                  value={packageFormData.inclusions} 
                  onChange={(e) => setPackageFormData(prev => ({ ...prev, inclusions: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm font-semibold"
                  placeholder="Welcome Drink, Rice, Chicken Curry, Fish Red Curry..."
                />
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Separate each item with a comma (e.g. Item 1, Item 2, Item 3)</p>
              </div>

              <div className="flex gap-4 justify-end pt-4 shrink-0">
                <button 
                  type="button" 
                  disabled={isSavingPackage}
                  onClick={() => setShowPackageModal(false)}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingPackage}
                  className="px-6 py-3 bg-[#0F172A] text-white hover:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingPackage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PACKAGE DETAILS MODAL */}
      {showViewPackageModal && viewingPackage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setShowViewPackageModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-white/20 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>{viewingPackage.name}</h2>
                <span className={`inline-flex px-3.5 py-1 mt-2 text-[9px] font-bold uppercase tracking-widest rounded-full border ${
                  viewingPackage.type === 'wedding' 
                    ? 'bg-purple-500/20 text-[#D4AF37] border-purple-500/30' 
                    : 'bg-indigo-500/20 text-[#D4AF37] border-indigo-500/30'
                }`}>
                  {viewingPackage.type === 'wedding' ? 'Wedding Package' : 'Other Event Package'}
                </span>
              </div>
              <button onClick={() => setShowViewPackageModal(false)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Pricing</h4>
                <p className="text-lg font-bold text-slate-950">Rs. {viewingPackage.price?.toLocaleString()} / per plate</p>
              </div>

              {viewingPackage.bites && (
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Bites & Highlights</h4>
                  <p className="text-sm text-[#B8962D] font-bold bg-[#D4AF37]/5 p-3 rounded-xl border border-[#D4AF37]/10">{viewingPackage.bites}</p>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Menu Inclusions ({viewingPackage.inclusions?.length || 0} Items)</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingPackage.inclusions?.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-1.5 shrink-0" />
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowViewPackageModal(false)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
