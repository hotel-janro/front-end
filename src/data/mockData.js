// mockData.js - Dashboard mock data

export const dashboardStats = {
  totalRevenue: 125430,
  monthlyRevenue: 18750,
  totalRooms: 10,
  occupiedRooms: 5,
  availableRooms: 5,
  todayCheckIns: 3,
  todayCheckOuts: 2,
};

export const revenueData = [
  { month: 'Jan', revenue: 18000 },
  { month: 'Feb', revenue: 22000 },
  { month: 'Mar', revenue: 19500 },
  { month: 'Apr', revenue: 25000 },
  { month: 'May', revenue: 21000 },
  { month: 'Jun', revenue: 28000 },
  { month: 'Jul', revenue: 24000 },
  { month: 'Aug', revenue: 26500 },
  { month: 'Sep', revenue: 23000 },
  { month: 'Oct', revenue: 27000 },
  { month: 'Nov', revenue: 29000 },
  { month: 'Dec', revenue: 31000 },
];

export const occupancyData = [
  { day: 'Mon', occupancy: 6 },
  { day: 'Tue', occupancy: 7 },
  { day: 'Wed', occupancy: 5 },
  { day: 'Thu', occupancy: 8 },
  { day: 'Fri', occupancy: 9 },
  { day: 'Sat', occupancy: 10 },
  { day: 'Sun', occupancy: 8 },
];

export const bookings = [
  {
    id: 'b-001',
    guestName: 'Liam Carter',
    roomNumber: '201',
    roomType: 'Deluxe',
    guests: 2,
    status: 'Confirmed',
    totalAmount: 420,
    checkOut: '2026-03-15',
  },
  {
    id: 'b-002',
    guestName: 'Ava Thompson',
    roomNumber: '305',
    roomType: 'Suite',
    guests: 3,
    status: 'Checked-In',
    totalAmount: 780,
    checkOut: '2026-03-13',
  },
  {
    id: 'b-003',
    guestName: 'Noah Wilson',
    roomNumber: '109',
    roomType: 'Standard',
    guests: 1,
    status: 'Confirmed',
    totalAmount: 240,
    checkOut: '2026-03-16',
  },
];

export const rooms = [
  { id: 'r-101', number: '101', status: 'Available' },
  { id: 'r-102', number: '102', status: 'Occupied' },
  { id: 'r-103', number: '103', status: 'Reserved' },
  { id: 'r-104', number: '104', status: 'Maintenance' },
  { id: 'r-105', number: '105', status: 'Occupied' },
  { id: 'r-106', number: '106', status: 'Available' },
];
