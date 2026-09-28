export interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'organizer';
  created_at: string;
}

export interface Event {
  id: number;
  organizer_id: number;
  organizer_name?: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  address: string;
  ticket_price: number | string;
  total_seats: number;
  available_seats: number;
  created_at: string;
}

export interface EventFilters {
  search?: string;
  category?: string;
  date?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  user_name?: string;
  event_id: number;
  event_name?: string;
  event_date?: string;
  event_image?: string;
  start_time?: string;
  venue?: string;
  ticket_type: string;
  quantity: number;
  total_amount: number | string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  event_id: number;
  name: string;
  category: string;
  image?: string;
  date: string;
  venue: string;
  ticket_price: number | string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'organizer';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
