export type UserRole =
  | 'customer'
  | 'hotel_owner'
  | 'hotel_admin'
  | 'staff'
  | 'super_admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  phone_number?: string;
  avatar?: string | null;
  is_verified?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export type HotelStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface HotelImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
}

export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type HotelDocumentType =
  | 'TRADE_LICENSE'
  | 'FOOD_SAFETY'
  | 'TAX_ID'
  | 'OWNERSHIP_PROOF'
  | 'OTHER';

export interface HotelDocument {
  id: number;
  document_type: HotelDocumentType;
  document_name: string;
  file_url: string;
  file_size?: string;
  status: DocumentVerificationStatus;
  notes?: string;
  uploaded_at: string;
}

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  owner?: number;
  owner_email?: string;
  description: string;
  hotel_type: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  status: HotelStatus;
  is_active: boolean;
  images: HotelImage[];
  documents?: HotelDocument[];
  rejection_reason?: string;
  created_at: string;
}

export interface HotelRegistrationPayload {
  name: string;
  hotel_type: string;
  description: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  primary_image_url?: string;
  gallery_images?: string[];
  initial_restaurant?: {
    name: string;
    cuisine_type: string;
    description?: string;
    opening_time: string;
    closing_time: string;
    estimated_tables?: number;
  };
  documents: {
    document_type: HotelDocumentType;
    document_name: string;
    file_url: string;
    file_size?: string;
  }[];
  status?: HotelStatus;
}

export interface ApplicationTimelineItem {
  stage: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'rejected';
  timestamp?: string;
  description: string;
}

export interface HotelApplication {
  id: number;
  application_number: string;
  hotel: Hotel;
  status: HotelStatus;
  rejection_reason?: string;
  admin_notes?: string;
  assigned_reviewer?: string;
  submitted_at: string;
  updated_at: string;
  documents: HotelDocument[];
  timeline: ApplicationTimelineItem[];
}

export interface OperatingHours {
  id: number;
  restaurant: number;
  day_of_week: number;
  day_name: string;
  opening_time: string;
  closing_time: string;
  is_closed: boolean;
}

export interface Restaurant {
  id: number;
  hotel: number;
  hotel_name?: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  is_active: boolean;
  images: { id: number; image: string; caption?: string; is_primary: boolean }[];
  operating_hours: OperatingHours[];
}

export type TableOperationalStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'AWAITING_CLEANING'
  | 'CLEANING_IN_PROGRESS'
  | 'SERVICE_REQUIRED'
  | 'MAINTENANCE'
  | 'TEMPORARILY_BLOCKED';

export type TableType =
  | 'STANDARD'
  | 'BOOTH'
  | 'OUTDOOR'
  | 'VIP'
  | 'BAR';

export interface RestaurantTable {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  table_number: string;
  capacity: number;
  min_capacity: number;
  table_type: TableType;
  zone_name: string;
  description: string;
  operational_status: TableOperationalStatus;
  is_active: boolean;
  qr_code_url?: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface Booking {
  id: number;
  booking_reference: string;
  customer?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  hotel: number;
  hotel_name: string;
  restaurant: number;
  restaurant_name: string;
  table: number;
  table_number: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  special_requests?: string;
  booking_status: BookingStatus;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at: string;
}

export interface AvailabilityResponse {
  date: string;
  start_time: string;
  end_time: string;
  guests: number;
  available_count: number;
  tables: RestaurantTable[];
}
