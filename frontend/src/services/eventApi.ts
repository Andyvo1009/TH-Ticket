const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Event Interfaces
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
  organizerId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  totalTickets: number;
  image?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  location?: string;
  address?: string;
  price?: number;
  totalTickets?: number;
  image?: string;
}

interface EventResponse {
  success: boolean;
  message: string;
  event?: Event;
}

interface EventsResponse {
  success: boolean;
  message: string;
  events?: Event[];
  total?: number;
  page?: number;
  totalPages?: number;
}

const eventApi = {
  // Get all events (with optional filters)
  getAllEvents: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EventsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${API_BASE_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (eventId: number): Promise<Event | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch event');
      }

      return data.event || null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Get events by category
  getEventsByCategory: async (category: string): Promise<EventsResponse> => {
    return eventApi.getAllEvents({ category });
  },

  // Create new event (requires authentication)
  createEvent: async (eventData: CreateEventData): Promise<EventResponse> => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create event');
      }

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event (requires authentication and ownership)
  updateEvent: async (eventId: number, eventData: UpdateEventData): Promise<EventResponse> => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update event');
      }

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event (requires authentication and ownership)
  deleteEvent: async (eventId: number): Promise<EventResponse> => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete event');
      }

      return data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get user's created events (requires authentication)
  getMyEvents: async (): Promise<EventsResponse> => {
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/my-events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch your events');
      }

      return data;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },

  // Search events
  searchEvents: async (searchTerm: string): Promise<EventsResponse> => {
    return eventApi.getAllEvents({ search: searchTerm });
  },

  // Get featured/popular events
  getFeaturedEvents: async (limit: number = 8): Promise<EventsResponse> => {
    return eventApi.getAllEvents({ limit });
  },
};

export default eventApi;
