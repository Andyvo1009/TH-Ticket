export interface Booking {
  booking_id: number;
  event_id: number;
  user_id: number;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: string | number;
  event?: {
    name: string;
    description: string;
    category: string;
    start_time: string;
    venue?: {
      name: string;
      address: string;
    };
    image_url: string;
  };
  booking_details?: BookingDetail[];
}

export interface BookingDetail {
  detail_id: number;
  price: string | number;
  seat?: {
    seat_id: number;
    seat_number: string;
    seat_type: string;
  };
}
