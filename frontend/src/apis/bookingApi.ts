import api from './baseApi';

// Booking Interfaces
export interface BookingDetails { 
    booking_id: string;
    event_id: number;
    user_id: number;
    booking_date: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    total_amount: string | number;
    quantity?: number;
    event?: {
        id: number;
        title: string;
        date: string;
        time: string;
        location: string;
        image_url?: string;
    };
}
interface TicketType {
    type: string;
    quantity: number;
    ticket_id:number;
}
export interface CreateBookingData {
    event_id: number;
    booking_full_name: string;
    booking_email: string;
    booking_phone: string;
    ticket_types: TicketType[];
    total_amount?: number;
}

export interface UpdateBookingData {
    status?: 'pending' | 'confirmed' | 'cancelled';
    quantity?: number;
}

interface BookingResponse {
    success: boolean;
    message: string;
    booking_id?: string;
}

interface BookingsResponse {
    success: boolean;
    message: string;
    bookings?: BookingDetails[];
    total?: number;
}

const bookingApi = {
    // Create a new booking (requires authentication)
    createBooking: async (bookingData: CreateBookingData): Promise<BookingResponse> => {
        try {
            const token = localStorage.getItem('access_token') ;
            const response = await api.post('/bookings', bookingData,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data as BookingResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to create booking');
            }

            return data;
        } catch (error: any) {
            console.error('Error creating booking:', error);
            if (error.response.status===401){
                throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
            }
            if (error.response.status===400){
                throw new Error(error.response.data.message || 'Dữ liệu đặt chỗ không hợp lệ');
            }
            // throw error;
        }
        return {success:false,message:"Lỗi tạo đặt chỗ"};
    },

    // Get all user's bookings (requires authentication)
    getMyBookings: async (): Promise<BookingsResponse> => {
        const token = localStorage.getItem('access_token') ;
        try {
            const response = await api.get('/bookings/my-bookings', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data as BookingsResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to fetch bookings');
            }

            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    // Get booking by ID (requires authentication)
    getBookingById: async (bookingId: number): Promise<BookingDetails | null> => {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            const data = response.data as { success: boolean; message: string; booking?: BookingDetails };

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to fetch booking');
            }

            return data.booking || null;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    // Update booking (requires authentication and ownership)
    updateBooking: async (bookingId: number, bookingData: UpdateBookingData): Promise<BookingResponse> => {
        try {
            const response = await api.put(`/bookings/${bookingId}`, bookingData);
            const data = response.data as BookingResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to update booking');
            }

            return data;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    // Cancel booking (requires authentication and ownership)
    cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
        try {
            const response = await api.put(`/bookings/${bookingId}`, { status: 'cancelled' });
            const data = response.data as BookingResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to cancel booking');
            }

            return data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    // Delete booking (requires authentication and ownership)
    deleteBooking: async (bookingId: number): Promise<BookingResponse> => {
        try {
            const response = await api.delete(`/bookings/${bookingId}`);
            const data = response.data as BookingResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to delete booking');
            }

            return data;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    // Get bookings for a specific event (organizer only)
    getEventBookings: async (eventId: number): Promise<BookingsResponse> => {
        try {
            const response = await api.get(`/events/${eventId}/bookings`);
            const data = response.data as BookingsResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to fetch event bookings');
            }

            return data;
        } catch (error) {
            console.error('Error fetching event bookings:', error);
            throw error;
        }
    },

    // Confirm booking (organizer only)
    confirmBooking: async (bookingId: number): Promise<BookingResponse> => {
        try {
            const response = await api.put(`/bookings/${bookingId}`, { status: 'confirmed' });
            const data = response.data as BookingResponse;

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to confirm booking');
            }

            return data;
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    },
};

export default bookingApi;