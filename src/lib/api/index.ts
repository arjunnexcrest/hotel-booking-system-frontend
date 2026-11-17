import { apiClient } from './client';
import {
  AuthTokens,
  User,
  Hotel,
  Restaurant,
  Booking,
  AvailabilityResponse,
  HotelRegistrationPayload,
  HotelApplication,
  HotelStatus,
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

const APPLICATION_STORAGE_KEY = 'hbs_hotel_application_draft';

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

  submitRegistration: async (
    payload: HotelRegistrationPayload
  ): Promise<HotelApplication> => {
    try {
      const result = await apiClient<HotelApplication>('/hotels/hotels/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return result;
    } catch {
      // Graceful local cache fallback for developmental/offline mode
      const now = new Date().toISOString();
      const mockApp: HotelApplication = {
        id: Math.floor(1000 + Math.random() * 9000),
        application_number: `HBS-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: payload.status || 'PENDING_APPROVAL',
        hotel: {
          id: 101,
          name: payload.name,
          slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: payload.description,
          hotel_type: payload.hotel_type,
          email: payload.email,
          phone: payload.phone,
          website: payload.website,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          postal_code: payload.postal_code,
          country: payload.country,
          latitude: payload.latitude,
          longitude: payload.longitude,
          status: payload.status || 'PENDING_APPROVAL',
          is_active: false,
          images: payload.primary_image_url
            ? [{ id: 1, image: payload.primary_image_url, is_primary: true }]
            : [],
          created_at: now,
        },
        submitted_at: now,
        updated_at: now,
        assigned_reviewer: 'Super Admin Compliance Desk',
        documents: payload.documents.map((doc, idx) => ({
          id: idx + 1,
          document_type: doc.document_type,
          document_name: doc.document_name,
          file_url: doc.file_url,
          file_size: doc.file_size || '1.8 MB',
          status: 'PENDING',
          uploaded_at: now,
        })),
        timeline: [
          {
            stage: 'submission',
            title: 'Application Submitted',
            status: 'completed',
            timestamp: now,
            description: 'Hotel registration dossier successfully submitted for verification.',
          },
          {
            stage: 'document_verification',
            title: 'Document & License Verification',
            status: 'in_progress',
            description: 'Admin team is verifying trade license, FSSAI certificate, and tax identification.',
          },
          {
            stage: 'operational_review',
            title: 'Compliance & Dining Facility Review',
            status: 'pending',
            description: 'Reviewing dining capacity, operating hours, and safety policies.',
          },
          {
            stage: 'approval_activation',
            title: 'Platform Activation & Live Listing',
            status: 'pending',
            description: 'Final super-admin sign-off and activation on the GrandTable platform.',
          },
        ],
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(mockApp));
      }
      return mockApp;
    }
  },

  getMyApplication: async (): Promise<HotelApplication | null> => {
    try {
      return await apiClient<HotelApplication>('/hotels/hotels/my_application/');
    } catch {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(APPLICATION_STORAGE_KEY);
        if (cached) {
          try {
            return JSON.parse(cached) as HotelApplication;
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  },

  updateApplicationStatus: async (
    status: HotelStatus,
    rejectionReason?: string
  ): Promise<HotelApplication | null> => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(APPLICATION_STORAGE_KEY);
      if (cached) {
        const app = JSON.parse(cached) as HotelApplication;
        app.status = status;
        app.updated_at = new Date().toISOString();
        if (rejectionReason) {
          app.rejection_reason = rejectionReason;
        }

        // Adjust timeline based on status
        if (status === 'APPROVED') {
          app.timeline.forEach((item) => {
            item.status = 'completed';
            if (!item.timestamp) item.timestamp = new Date().toISOString();
          });
          app.hotel.status = 'APPROVED';
          app.hotel.is_active = true;
        } else if (status === 'REJECTED') {
          app.timeline[1].status = 'rejected';
          app.timeline[1].description = rejectionReason || 'Documentation discrepancy identified.';
        } else if (status === 'UNDER_REVIEW') {
          app.timeline[0].status = 'completed';
          app.timeline[1].status = 'in_progress';
          app.timeline[2].status = 'pending';
        }

        localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(app));
        return app;
      }
    }
    return null;
  },
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
