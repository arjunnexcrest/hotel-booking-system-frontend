// TODO: JWT storage, session helpers, role checks
export type UserRole =
  | 'customer'
  | 'hotel_owner'
  | 'hotel_admin'
  | 'staff'
  | 'super_admin';
