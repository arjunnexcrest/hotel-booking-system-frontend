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
  star_rating?: number;
  amenities?: string[];
  check_in_time?: string;
  check_out_time?: string;
  status: HotelStatus;
  status_display?: string;
  is_active: boolean;
  images: HotelImage[];
  documents?: HotelDocument[];
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface HotelSummary {
  id: number;
  name: string;
  slug: string;
  status: HotelStatus;
  status_display: string;
  is_active: boolean;
  total_restaurants: number;
  total_tables: number;
  total_capacity: number;
  active_bookings_today: number;
  staff_count: number;
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

export interface ReviewDecisionPayload {
  decision: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  notes?: string;
  rejection_reason?: string;
  document_updates?: { id: number; status: DocumentVerificationStatus; notes?: string }[];
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
  dress_code?: string;
  dress_code_display?: string;
  price_tier?: string;
  price_tier_display?: string;
  phone_number?: string;
  email?: string;
  table_count?: number;
  is_active: boolean;
  images: { id: number; image: string; caption?: string; is_primary: boolean }[];
  operating_hours: OperatingHours[];
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantStats {
  total_tables: number;
  total_capacity: number;
  available: number;
  occupied: number;
  awaiting_cleaning: number;
  cleaning_in_progress: number;
  service_required: number;
  maintenance: number;
  temporarily_blocked: number;
}

export interface RestaurantOpenStatus {
  is_open: boolean;
  reason?: string;
  opening_time?: string;
  closing_time?: string;
  day?: string;
}

export interface FloorPlanTable {
  id: number;
  table_number: string;
  capacity: number;
  min_capacity: number;
  table_type: TableType;
  shape: TableShape;
  pos_x: number;
  pos_y: number;
  operational_status: TableOperationalStatus;
  operational_status_display?: string;
}

export interface FloorPlanResponse {
  restaurant_id: number;
  restaurant_name: string;
  total_tables: number;
  zones: Record<string, FloorPlanTable[]>;
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

export type TableShape =
  | 'ROUND'
  | 'SQUARE'
  | 'RECTANGULAR'
  | 'OVAL';

export interface RestaurantTable {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  table_number: string;
  capacity: number;
  min_capacity: number;
  table_type: TableType;
  table_type_display?: string;
  shape?: TableShape;
  shape_display?: string;
  pos_x?: number;
  pos_y?: number;
  zone_name: string;
  description: string;
  operational_status: TableOperationalStatus;
  operational_status_display?: string;
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

export interface BookingHistoryItem {
  id: number;
  booking: number;
  changed_by?: number | null;
  changed_by_username?: string | null;
  previous_status: string;
  new_status: string;
  reason: string;
  created_at: string;
}

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
  table_zone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  special_requests?: string;
  booking_status: BookingStatus;
  booking_status_display?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  history?: BookingHistoryItem[];
  created_at: string;
  updated_at?: string;
}

export interface AvailableSlot {
  time: string;
  time_display: string;
  end_time: string;
  end_time_display: string;
  available_tables: number;
  is_peak: boolean;
}

export interface AvailableSlotsResponse {
  restaurant_id: number;
  date: string;
  guest_count: number;
  duration_minutes: number;
  total_slots: number;
  slots: AvailableSlot[];
}

export interface MyBookingsResponse {
  upcoming: Booking[];
  past: Booking[];
  total_bookings: number;
}

export interface AvailabilityResponse {
  date: string;
  start_time: string;
  end_time: string;
  guests: number;
  available_count: number;
  tables: RestaurantTable[];
}
