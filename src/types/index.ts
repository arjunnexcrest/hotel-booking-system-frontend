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
  role: UserRole;
}

// TODO: add Hotel, Restaurant, Table, Booking, Alert types
