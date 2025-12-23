import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL+'/admin' || '/admin';
// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== USER MANAGEMENT ====================

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'organizer' | 'admin';
  gender: string;
  birthDate: string | null;
  createdAt: string;
  statistics?: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalSpent: number;
  };
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllUsers = async (params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> => {
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: getAuthHeader(),
    params,
  });
  return response.data;
};

export const getUserById = async (userId: number): Promise<{ success: boolean; user: User }> => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateUser = async (
  userId: number,
  data: Partial<User>
): Promise<{ success: boolean; message: string; user: User }> => {
  const response = await axios.put(`${API_BASE_URL}/users/${userId}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// ==================== EVENT MANAGEMENT ====================

export interface AdminEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  address: string;
  image: string;
  createdAt: string;
  organizerId: number;
  approved?: string; // 'approved', 'pending', 'rejected'
  statistics: {
    totalBookings: number;
    confirmedBookings: number;
    ticketsSold: number;
    revenue: number;
  };
}

export interface EventsResponse {
  success: boolean;
  events: AdminEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllAdminEvents = async (params?: {
  category?: string;
  status?: 'upcoming' | 'past' | 'today';
  search?: string;
  page?: number;
  limit?: number;
}): Promise<EventsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/events`, {
    headers: getAuthHeader(),
    params,
  });
  return response.data;
};

export const deleteAdminEvent = async (eventId: number): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateEventApproval = async (eventId: number, status: 'approved' | 'pending' | 'rejected'): Promise<{
  success: boolean;
  message: string;
  event?: { id: number; name: string; approved: string };
}> => {
  const response = await axios.put(
    `${API_BASE_URL}/events/${eventId}/approval`,
    { status },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ==================== BOOKING MANAGEMENT ====================

export interface BookingLine {
  ticketId: number;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface AdminBooking {
  id: number;
  userId: number;
  userName?: string;
  eventId: number;
  eventName: string;
  eventDate?: string;
  fullName: string;
  email: string;
  phone: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  bookingLines: BookingLine[];
  payment?: {
    id: number;
    method: string;
    status: string;
    amount: number;
    transactionId: string;
    createdAt: string;
  };
}

export interface BookingsResponse {
  success: boolean;
  bookings: AdminBooking[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllBookings = async (params?: {
  status?: string;
  event_id?: number;
  user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<BookingsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/bookings`, {
    headers: getAuthHeader(),
    params,
  });
  return response.data;
};

export const getBookingById = async (bookingId: number): Promise<{ success: boolean; booking: AdminBooking }> => {
  const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateBookingStatus = async (
  bookingId: number,
  status: string,
  reason?: string
): Promise<{ success: boolean; message: string; booking: AdminBooking }> => {
  const response = await axios.put(
    `${API_BASE_URL}/bookings/${bookingId}/status`,
    { status, reason },
    {
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

// ==================== STATISTICS & DASHBOARD ====================

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalTicketsSold: number;
}

export const getDashboardStats = async (): Promise<{ success: boolean; stats: DashboardStats }> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export interface RecentBooking {
  id: number;
  eventName: string;
  fullName: string;
  bookingDate: string;
  status: string;
  totalAmount: number;
}

export const getRecentBookings = async (limit?: number): Promise<{ success: boolean; bookings: RecentBooking[] }> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/recent-bookings`, {
    headers: getAuthHeader(),
    params: { limit },
  });
  return response.data;
};

export interface TopEvent {
  id: number;
  title: string;
  category: string;
  date: string;
  ticketsSold: number;
  revenue: number;
}

export const getTopEvents = async (limit?: number): Promise<{ success: boolean; events: TopEvent[] }> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/top-events`, {
    headers: getAuthHeader(),
    params: { limit },
  });
  return response.data;
};

// ==================== PAYMENTS ====================

export interface AdminPayment {
  id: number;
  bookingId: number;
  eventName: string;
  customerName: string;
  method: string;
  status: string;
  amount: number;
  transactionId: string;
  createdAt: string;
}

export interface PaymentsResponse {
  success: boolean;
  payments: AdminPayment[];
  total: number;
  page: number;
  totalPages: number;
}

export const getAllPayments = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PaymentsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/payments`, {
    headers: getAuthHeader(),
    params,
  });
  return response.data;
};
