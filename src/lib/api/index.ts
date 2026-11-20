import { apiClient } from './client';
import {
  AuthTokens,
  User,
  Hotel,
  HotelSummary,
  Restaurant,
  RestaurantStats,
  RestaurantOpenStatus,
  FloorPlanResponse,
  RestaurantTable,
  TableOperationalStatus,
  TableType,
  TableShape,
  Booking,
  AvailabilityResponse,
  AvailableSlotsResponse,
  MyBookingsResponse,
  HotelRegistrationPayload,
  HotelApplication,
  HotelStatus,
  ReviewDecisionPayload,
} from '@/types';

export { apiClient };

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiClient<AuthTokens>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refreshToken: (refresh: string) =>
    apiClient<{ access: string; refresh?: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
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

  updateProfile: (data: Partial<User>) =>
    apiClient<User>('/accounts/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient<{ status: string }>('/accounts/users/change_password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  requestPasswordReset: (email: string) =>
    apiClient<{ status: string; message: string; reset_token?: string }>(
      '/accounts/users/password_reset/',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    ),

  confirmPasswordReset: (data: { token: string; new_password: string }) =>
    apiClient<{ status: string }>(
      '/accounts/users/password_reset_confirm/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  logout: (refresh: string) =>
    apiClient<{ status: string }>('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }),
};

const APPLICATIONS_STORE_KEY = 'hbs_hotel_applications_store';

function getDefaultApplications(): HotelApplication[] {
  const now = new Date().toISOString();
  return [
    {
      id: 101,
      application_number: 'HBS-APP-2026-9041',
      status: 'PENDING_APPROVAL',
      submitted_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      assigned_reviewer: 'Compliance Desk Alpha',
      hotel: {
        id: 101,
        name: 'The Grand Azure Palace & Spa',
        slug: 'the-grand-azure-palace-spa',
        owner: 2,
        owner_email: 'owner@grandazure.com',
        description:
          'Luxury seaside heritage property featuring 5-star hospitality, private cabana dining, and AI-assisted reservation management.',
        hotel_type: 'Luxury Hotel & Spa',
        email: 'concierge@grandazure.com',
        phone: '+91 22 2847 9000',
        website: 'https://www.grandazurepalace.com',
        address: 'Plot 42, Marine Drive, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400021',
        country: 'India',
        latitude: 18.922,
        longitude: 72.8258,
        status: 'PENDING_APPROVAL',
        is_active: false,
        images: [
          {
            id: 1,
            image:
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
            is_primary: true,
          },
        ],
        created_at: now,
      },
      documents: [
        {
          id: 1,
          document_type: 'TRADE_LICENSE',
          document_name: 'Municipal_Trade_License_2026.pdf',
          file_url: 'https://example.com/docs/trade-license.pdf',
          file_size: '2.4 MB',
          status: 'PENDING',
          uploaded_at: now,
        },
        {
          id: 2,
          document_type: 'FOOD_SAFETY',
          document_name: 'FSSAI_Hygiene_Certificate.pdf',
          file_url: 'https://example.com/docs/fssai.pdf',
          file_size: '1.8 MB',
          status: 'PENDING',
          uploaded_at: now,
        },
        {
          id: 3,
          document_type: 'TAX_ID',
          document_name: 'GSTIN_Registration_Certificate.pdf',
          file_url: 'https://example.com/docs/gstin.pdf',
          file_size: '850 KB',
          status: 'PENDING',
          uploaded_at: now,
        },
        {
          id: 4,
          document_type: 'OWNERSHIP_PROOF',
          document_name: 'Commercial_Lease_Deed_2026.pdf',
          file_url: 'https://example.com/docs/lease-deed.pdf',
          file_size: '4.2 MB',
          status: 'PENDING',
          uploaded_at: now,
        },
      ],
      timeline: [
        {
          stage: 'submission',
          title: 'Application Submitted',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
          description: 'Hotel registration dossier successfully submitted for verification.',
        },
        {
          stage: 'document_verification',
          title: 'Document & License Verification',
          status: 'in_progress',
          description: 'Awaiting Super Admin compliance desk review of trade and health licenses.',
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
    },
    {
      id: 102,
      application_number: 'HBS-APP-2026-8812',
      status: 'UNDER_REVIEW',
      submitted_at: new Date(Date.now() - 3600000 * 36).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      assigned_reviewer: 'Senior Auditor Verma',
      admin_notes: 'FSSAI and GSTIN validated. Verifying physical fire safety clearance certificate.',
      hotel: {
        id: 102,
        name: 'The Royal Pavilion & Skylounge',
        slug: 'the-royal-pavilion-skylounge',
        owner: 3,
        owner_email: 'director@royalpavilion.com',
        description:
          'Iconic rooftop dining haven showcasing contemporary European cuisine and automated table service.',
        hotel_type: 'Fine Dining Hotel & Suites',
        email: 'reservations@royalpavilion.com',
        phone: '+91 80 4912 3000',
        website: 'https://royalpavilion.com',
        address: '108 MG Road, Central Business District',
        city: 'Bangalore',
        state: 'Karnataka',
        postal_code: '560001',
        country: 'India',
        latitude: 12.9716,
        longitude: 77.5946,
        status: 'UNDER_REVIEW',
        is_active: false,
        images: [
          {
            id: 2,
            image:
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
            is_primary: true,
          },
        ],
        created_at: now,
      },
      documents: [
        {
          id: 5,
          document_type: 'TRADE_LICENSE',
          document_name: 'BBMP_Trade_License_2026.pdf',
          file_url: 'https://example.com/docs/bbmp-license.pdf',
          file_size: '2.1 MB',
          status: 'VERIFIED',
          uploaded_at: now,
        },
        {
          id: 6,
          document_type: 'FOOD_SAFETY',
          document_name: 'FSSAI_Central_License.pdf',
          file_url: 'https://example.com/docs/fssai-central.pdf',
          file_size: '3.0 MB',
          status: 'VERIFIED',
          uploaded_at: now,
        },
        {
          id: 7,
          document_type: 'TAX_ID',
          document_name: 'Karnataka_GST_Certificate.pdf',
          file_url: 'https://example.com/docs/ka-gst.pdf',
          file_size: '1.1 MB',
          status: 'VERIFIED',
          uploaded_at: now,
        },
        {
          id: 8,
          document_type: 'OWNERSHIP_PROOF',
          document_name: 'Registered_Commercial_Lease.pdf',
          file_url: 'https://example.com/docs/commercial-lease.pdf',
          file_size: '5.4 MB',
          status: 'PENDING',
          uploaded_at: now,
        },
      ],
      timeline: [
        {
          stage: 'submission',
          title: 'Application Submitted',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
          description: 'Application received and registered in review queue.',
        },
        {
          stage: 'document_verification',
          title: 'Document & License Verification',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          description: 'Trade license and food safety certificates validated.',
        },
        {
          stage: 'operational_review',
          title: 'Compliance & Dining Facility Review',
          status: 'in_progress',
          description: 'Auditing table layout parameters and emergency exit compliance.',
        },
        {
          stage: 'approval_activation',
          title: 'Platform Activation & Live Listing',
          status: 'pending',
          description: 'Pending final super admin sign-off.',
        },
      ],
    },
    {
      id: 103,
      application_number: 'HBS-APP-2026-7734',
      status: 'APPROVED',
      submitted_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      assigned_reviewer: 'Super Admin Directorate',
      admin_notes: 'All compliance certificates verified. Live listing certified.',
      hotel: {
        id: 103,
        name: 'The Heritage Haveli & Court',
        slug: 'the-heritage-haveli-court',
        owner: 4,
        owner_email: 'haveli@heritagehotels.com',
        description:
          'Restored 18th-century palatial estate offering royal Indian dining experiences with live availability.',
        hotel_type: 'Boutique Heritage Hotel',
        email: 'info@heritagehaveli.com',
        phone: '+91 141 262 0000',
        website: 'https://heritagehaveli.com',
        address: 'Amer Road, Pink City Zone',
        city: 'Jaipur',
        state: 'Rajasthan',
        postal_code: '302002',
        country: 'India',
        latitude: 26.9124,
        longitude: 75.7873,
        status: 'APPROVED',
        is_active: true,
        images: [
          {
            id: 3,
            image:
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            is_primary: true,
          },
        ],
        created_at: now,
      },
      documents: [
        {
          id: 9,
          document_type: 'TRADE_LICENSE',
          document_name: 'Heritage_Hospitality_License.pdf',
          file_url: 'https://example.com/docs/heritage-license.pdf',
          file_size: '1.9 MB',
          status: 'VERIFIED',
          uploaded_at: now,
        },
        {
          id: 10,
          document_type: 'FOOD_SAFETY',
          document_name: 'FSSAI_Five_Star_Hygiene.pdf',
          file_url: 'https://example.com/docs/fssai-5star.pdf',
          file_size: '2.5 MB',
          status: 'VERIFIED',
          uploaded_at: now,
        },
      ],
      timeline: [
        {
          stage: 'submission',
          title: 'Application Submitted',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
          description: 'Dossier submitted.',
        },
        {
          stage: 'document_verification',
          title: 'Document & License Verification',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          description: 'All documents verified.',
        },
        {
          stage: 'operational_review',
          title: 'Compliance & Dining Facility Review',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
          description: 'Dining facilities passed review.',
        },
        {
          stage: 'approval_activation',
          title: 'Platform Activation & Live Listing',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          description: 'Approved and active on customer portal.',
        },
      ],
    },
  ];
}

function getStoredApplications(): HotelApplication[] {
  if (typeof window === 'undefined') return getDefaultApplications();
  const raw = localStorage.getItem(APPLICATIONS_STORE_KEY);
  if (!raw) {
    const defaults = getDefaultApplications();
    localStorage.setItem(APPLICATIONS_STORE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(raw) as HotelApplication[];
  } catch {
    return getDefaultApplications();
  }
}

function saveStoredApplications(apps: HotelApplication[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPLICATIONS_STORE_KEY, JSON.stringify(apps));
  }
}

export const hotelsApi = {
  getHotels: (params?: {
    city?: string;
    state?: string;
    star_rating?: number;
    search?: string;
    status?: string;
    is_active?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.state) query.append('state', params.state);
    if (params?.star_rating) query.append('star_rating', String(params.star_rating));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<Hotel[] | { results: Hotel[] }>(`/hotels/hotels/${queryString}`);
  },

  getHotelBySlug: (slug: string) =>
    apiClient<Hotel>(`/hotels/hotels/${slug}/`),

  getHotelRestaurants: (slug: string) =>
    apiClient<Restaurant[] | { results: Restaurant[] }>(`/hotels/hotels/${slug}/restaurants/`),

  getMyHotels: () =>
    apiClient<Hotel[] | { results: Hotel[] }>('/hotels/hotels/my_hotels/'),

  updateHotelBySlug: (slug: string, data: Partial<Hotel>) =>
    apiClient<Hotel>(`/hotels/hotels/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getHotelSummary: (slug: string) =>
    apiClient<HotelSummary>(`/hotels/hotels/${slug}/summary/`),

  submitRegistration: async (
    payload: HotelRegistrationPayload
  ): Promise<HotelApplication> => {
    try {
      return await apiClient<HotelApplication>('/hotels/hotels/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const now = new Date().toISOString();
      const apps = getStoredApplications();
      const newAppId = Math.floor(1000 + Math.random() * 9000);
      const newApp: HotelApplication = {
        id: newAppId,
        application_number: `HBS-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: payload.status || 'PENDING_APPROVAL',
        hotel: {
          id: newAppId,
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

      apps.unshift(newApp);
      saveStoredApplications(apps);
      return newApp;
    }
  },

  getMyApplication: async (): Promise<HotelApplication | null> => {
    try {
      return await apiClient<HotelApplication>('/hotels/hotels/my_application/');
    } catch {
      const apps = getStoredApplications();
      return apps[0] || null;
    }
  },

  getAllApplications: async (status?: string): Promise<HotelApplication[]> => {
    try {
      const query = status && status !== 'ALL' ? `?status=${status}` : '';
      return await apiClient<HotelApplication[]>(`/hotels/hotels/applications/${query}`);
    } catch {
      const apps = getStoredApplications();
      if (!status || status === 'ALL') return apps;
      return apps.filter((a) => a.status === status);
    }
  },

  reviewApplication: async (
    applicationId: number,
    payload: ReviewDecisionPayload
  ): Promise<HotelApplication> => {
    try {
      return await apiClient<HotelApplication>(
        `/hotels/hotels/applications/${applicationId}/review/`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
    } catch {
      const apps = getStoredApplications();
      const appIndex = apps.findIndex((a) => a.id === applicationId);
      if (appIndex === -1) {
        throw new Error(`Application #${applicationId} not found`);
      }

      const app = apps[appIndex];
      const now = new Date().toISOString();
      app.status = payload.decision;
      app.updated_at = now;
      if (payload.notes) app.admin_notes = payload.notes;
      if (payload.rejection_reason) app.rejection_reason = payload.rejection_reason;

      // Update documents if passed
      if (payload.document_updates) {
        payload.document_updates.forEach((u) => {
          const doc = app.documents.find((d) => d.id === u.id);
          if (doc) {
            doc.status = u.status;
            if (u.notes) doc.notes = u.notes;
          }
        });
      }

      // Update timeline based on decision
      if (payload.decision === 'APPROVED') {
        app.hotel.status = 'APPROVED';
        app.hotel.is_active = true;
        app.documents.forEach((d) => (d.status = 'VERIFIED'));
        app.timeline.forEach((item) => {
          item.status = 'completed';
          if (!item.timestamp) item.timestamp = now;
        });
      } else if (payload.decision === 'REJECTED') {
        app.hotel.status = 'REJECTED';
        app.hotel.is_active = false;
        app.timeline[1].status = 'rejected';
        app.timeline[1].description =
          payload.rejection_reason || 'Compliance discrepancy identified by Super Admin.';
      } else if (payload.decision === 'UNDER_REVIEW') {
        app.hotel.status = 'UNDER_REVIEW';
        app.timeline[0].status = 'completed';
        app.timeline[1].status = 'in_progress';
        app.timeline[2].status = 'pending';
      }

      apps[appIndex] = app;
      saveStoredApplications(apps);
      return app;
    }
  },

  updateApplicationStatus: async (
    status: HotelStatus,
    rejectionReason?: string
  ): Promise<HotelApplication | null> => {
    const apps = getStoredApplications();
    if (apps.length === 0) return null;
    const decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' =
      status === 'APPROVED' ? 'APPROVED' : status === 'UNDER_REVIEW' ? 'UNDER_REVIEW' : 'REJECTED';
    return await hotelsApi.reviewApplication(apps[0].id, {
      decision,
      rejection_reason: rejectionReason,
      notes: `Status simulated to ${status}`,
    });
  },
};

export const restaurantsApi = {
  getRestaurants: (params?: {
    hotel?: number;
    is_active?: boolean;
    cuisine_type?: string;
    dress_code?: string;
    price_tier?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.hotel !== undefined) query.append('hotel', String(params.hotel));
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.cuisine_type) query.append('cuisine_type', params.cuisine_type);
    if (params?.dress_code) query.append('dress_code', params.dress_code);
    if (params?.price_tier) query.append('price_tier', params.price_tier);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<Restaurant[] | { results: Restaurant[] }>(`/restaurants/restaurants/${queryString}`);
  },

  getRestaurantsByHotel: (hotelId: number, activeOnly = true) => {
    const activeQuery = activeOnly ? '&is_active=true' : '';
    return apiClient<Restaurant[] | { results: Restaurant[] }>(
      `/restaurants/restaurants/?hotel=${hotelId}${activeQuery}`
    );
  },

  getRestaurant: (id: number) =>
    apiClient<Restaurant>(`/restaurants/restaurants/${id}/`),

  createRestaurant: (data: {
    hotel: number;
    name: string;
    cuisine_type: string;
    description?: string;
    dress_code?: string;
    price_tier?: string;
    phone_number?: string;
    email?: string;
    is_active?: boolean;
  }) =>
    apiClient<Restaurant>('/restaurants/restaurants/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRestaurant: (id: number, data: Partial<Restaurant>) =>
    apiClient<Restaurant>(`/restaurants/restaurants/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRestaurant: (id: number) =>
    apiClient<void>(`/restaurants/restaurants/${id}/`, {
      method: 'DELETE',
    }),

  getFloorPlan: (id: number) =>
    apiClient<FloorPlanResponse>(`/restaurants/restaurants/${id}/floor_plan/`),

  getStats: (id: number) =>
    apiClient<RestaurantStats>(`/restaurants/restaurants/${id}/stats/`),

  isOpen: (id: number, targetDatetime?: string) => {
    const query = targetDatetime ? `?datetime=${encodeURIComponent(targetDatetime)}` : '';
    return apiClient<RestaurantOpenStatus>(`/restaurants/restaurants/${id}/is_open/${query}`);
  },

  bulkOperatingHours: (
    id: number,
    schedules: {
      day_of_week: number;
      opening_time: string;
      closing_time: string;
      is_closed: boolean;
    }[]
  ) =>
    apiClient<{ status: string }>(`/restaurants/restaurants/${id}/bulk_operating_hours/`, {
      method: 'POST',
      body: JSON.stringify(schedules),
    }),
};

export const tablesApi = {
  getTables: (params?: {
    restaurant?: number;
    operational_status?: TableOperationalStatus;
    table_type?: TableType;
    is_active?: boolean;
    capacity?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.restaurant !== undefined) query.append('restaurant', String(params.restaurant));
    if (params?.operational_status) query.append('operational_status', params.operational_status);
    if (params?.table_type) query.append('table_type', params.table_type);
    if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
    if (params?.capacity !== undefined) query.append('capacity', String(params.capacity));
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<RestaurantTable[] | { results: RestaurantTable[] }>(`/tables/tables/${queryString}`);
  },

  getTable: (id: number) =>
    apiClient<RestaurantTable>(`/tables/tables/${id}/`),

  createTable: (data: {
    restaurant: number;
    table_number: string;
    capacity: number;
    min_capacity: number;
    table_type: TableType;
    shape?: TableShape;
    zone_name?: string;
    description?: string;
    operational_status?: TableOperationalStatus;
    is_active?: boolean;
  }) =>
    apiClient<RestaurantTable>('/tables/tables/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTable: (id: number, data: Partial<RestaurantTable>) =>
    apiClient<RestaurantTable>(`/tables/tables/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTable: (id: number) =>
    apiClient<void>(`/tables/tables/${id}/`, {
      method: 'DELETE',
    }),

  updateStatus: (id: number, operational_status: TableOperationalStatus, reason = 'Manual status update') =>
    apiClient<{ status: string; table_id: number; operational_status: TableOperationalStatus; event_id: number }>(
      `/tables/tables/${id}/update_status/`,
      {
        method: 'POST',
        body: JSON.stringify({ operational_status, reason }),
      }
    ),

  bulkCreate: (data: {
    restaurant: number;
    prefix?: string;
    start_number?: number;
    count: number;
    capacity: number;
    min_capacity?: number;
    table_type?: TableType;
    shape?: TableShape;
    zone_name?: string;
  }) =>
    apiClient<{ status: string; created_count: number; tables: RestaurantTable[] }>(
      '/tables/tables/bulk_create/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  bulkStatusUpdate: (data: {
    table_ids: number[];
    operational_status: TableOperationalStatus;
    reason?: string;
  }) =>
    apiClient<{ status: string; updated_count: number; target_status: TableOperationalStatus }>(
      '/tables/tables/bulk_status_update/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};

export const bookingsApi = {
  getAvailableSlots: (params: {
    restaurant: number;
    date: string;
    guests: number;
    duration_minutes?: number;
  }) => {
    const query = new URLSearchParams({
      restaurant: params.restaurant.toString(),
      date: params.date,
      guests: params.guests.toString(),
    });
    if (params.duration_minutes) {
      query.append('duration_minutes', params.duration_minutes.toString());
    }
    return apiClient<AvailableSlotsResponse>(
      `/bookings/bookings/available_slots/?${query.toString()}`
    );
  },

  checkAvailability: (params: {
    restaurant: number;
    date: string;
    start_time: string;
    end_time: string;
    guests: number;
    zone?: string;
  }) => {
    const query = new URLSearchParams({
      restaurant: params.restaurant.toString(),
      date: params.date,
      start_time: params.start_time,
      end_time: params.end_time,
      guests: params.guests.toString(),
    });
    if (params.zone) {
      query.append('zone', params.zone);
    }
    return apiClient<AvailabilityResponse>(
      `/bookings/bookings/check_availability/?${query.toString()}`
    );
  },

  createBooking: (data: {
    restaurant: number;
    hotel: number;
    table?: number | null;
    zone_name?: string;
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

  getMyBookings: async (): Promise<MyBookingsResponse> => {
    try {
      return await apiClient<MyBookingsResponse>('/bookings/bookings/my_bookings/');
    } catch {
      const raw = await apiClient<Booking[] | { results: Booking[] }>('/bookings/bookings/');
      const list = Array.isArray(raw) ? raw : raw.results || [];
      const today = new Date().toISOString().split('T')[0];
      const upcoming = list.filter(
        (b) =>
          b.booking_date >= today &&
          !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.booking_status)
      );
      const past = list.filter(
        (b) =>
          b.booking_date < today ||
          ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.booking_status)
      );
      return { upcoming, past, total_bookings: list.length };
    }
  },

  getBookingsList: (params?: {
    hotel?: number;
    restaurant?: number;
    booking_status?: string;
    booking_date?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.hotel !== undefined) query.append('hotel', String(params.hotel));
    if (params?.restaurant !== undefined) query.append('restaurant', String(params.restaurant));
    if (params?.booking_status) query.append('booking_status', params.booking_status);
    if (params?.booking_date) query.append('booking_date', params.booking_date);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<Booking[] | { results: Booking[] }>(`/bookings/bookings/${queryString}`);
  },

  getBookingById: (id: number | string) =>
    apiClient<Booking>(`/bookings/bookings/${id}/`),

  cancelBooking: (id: number, reason: string) =>
    apiClient<{ status: string; booking_reference: string; booking_status: string }>(
      `/bookings/bookings/${id}/cancel/`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    ),

  cancelByReference: (data: {
    booking_reference: string;
    customer_email: string;
    reason?: string;
  }) =>
    apiClient<{ status: string; booking_reference: string; booking_status: string }>(
      '/bookings/bookings/cancel_by_reference/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};
