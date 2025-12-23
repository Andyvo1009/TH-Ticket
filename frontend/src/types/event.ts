export interface TicketType {
  id: number;
  typeName: string;
  price: number;
  quantity: number;
  availableQuantity?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  address: string;
  image: string;
  ticket_types?: TicketType[];
  createdAt?: string;
  
  // Optional fields that might come from backend
  price?: string;
  organizer?: string;
  fullDescription?: string;
  venue?: string;
  duration?: string;
  totalSeats?: number;
  availableSeats?: number;
}
