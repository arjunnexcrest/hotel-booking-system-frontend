import { apiClient } from './client';
import {
  AuthTokens,
  User,
  Hotel,
  Restaurant,
  Booking,
  AvailabilityResponse,
} from '@/types';

export { apiClient };

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiClient<AuthTokens>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
  }) =>
    apiClient<User>('/accounts/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    apiClient<User>('/accounts/users/me/'),
};

export const hotelsApi = {
  getHotels: (params?: { city?: string; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<Hotel[] | { results: Hotel[] }>(`/hotels/hotels/${queryString}`);
  },

  getHotelBySlug: (slug: string) =>
    apiClient<Hotel>(`/hotels/hotels/${slug}/`),
};

export const restaurantsApi = {
  getRestaurantsByHotel: (hotelId: number) =>
    apiClient<Restaurant[] | { results: Restaurant[] }>(
      `/restaurants/restaurants/?hotel=${hotelId}&is_active=true`
    ),

  getRestaurant: (id: number) =>
    apiClient<Restaurant>(`/restaurants/restaurants/${id}/`),
};

export const bookingsApi = {
  checkAvailability: (params: {
    restaurant: number;
    date: string;
    start_time: string;
    end_time: string;
    guests: number;
  }) => {
    const query = new URLSearchParams({
      restaurant: params.restaurant.toString(),
      date: params.date,
      start_time: params.start_time,
      end_time: params.end_time,
      guests: params.guests.toString(),
    });
    return apiClient<AvailabilityResponse>(
      `/bookings/bookings/check_availability/?${query.toString()}`
    );
  },

  createBooking: (data: {
    restaurant: number;
    hotel: number;
    table: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    special_requests?: string;
  }) =>
    apiClient<Booking>('/bookings/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyBookings: () =>
    apiClient<Booking[] | { results: Booking[] }>('/bookings/bookings/'),

  cancelBooking: (id: number, reason: string) =>
    apiClient<{ status: string; booking_reference: string }>(
      `/bookings/bookings/${id}/cancel/`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),
};
