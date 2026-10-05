export type StudentRole = 'offer' | 'need' | 'both';
export type VehicleType = 'two_wheeler' | 'car';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type RequestStatus = 
  | 'created' 
  | 'searching' 
  | 'match_found' 
  | 'contacted' 
  | 'accepted' 
  | 'declined' 
  | 'completed' 
  | 'no_match';

export interface Vehicle {
  id: string;
  student_id: string;
  vehicle_type: VehicleType;
  model_name: string;
  plate_number: string;
  total_seats: number;
  available_seats: number;
}

export interface Student {
  id: string;
  college_email: string;
  full_name: string;
  phone_number: string;
  department: string;
  year: string; // 'FE' | 'SE' | 'TE' | 'BE'
  enrollment_no: string;
  role: StudentRole;
  is_verified: boolean;
  avatar_url?: string;
  is_admin?: boolean;
  rating?: number;
  total_rides?: number;
  co2_saved_kg?: number;
  vehicle?: Vehicle;
}

export interface VerificationRequest {
  id: string;
  student_id: string;
  student?: Student;
  id_card_image_url: string;
  enrollment_no: string;
  department: string;
  year: string;
  status: VerificationStatus;
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface GeoLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  id: string;
  student_id: string;
  student_name?: string;
  student_department?: string;
  student_year?: string;
  student_is_verified?: boolean;
  student_avatar?: string;
  role: StudentRole;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  polyline_coords: [number, number][]; // [lat, lng][]
  distance_km: number;
  duration_min: number;
  arrival_time: string; // 'HH:mm'
  arrival_window_min: number;
  days_of_week: string[]; // ['M', 'T', 'W', 'T', 'F', 'S']
  vehicle_type?: VehicleType | 'any';
  vehicle_model?: string;
  seats_available?: number;
  is_active: boolean;
  created_at?: string;
}

export interface MatchResult {
  id: string;
  offer_route_id: string;
  need_route_id: string;
  offer_student: Student;
  need_student: Student;
  offer_route: Route;
  need_route: Route;
  route_match_pct: number;
  time_diff_min: number;
  shared_days: string[];
}

export interface RideRequest {
  id: string;
  match_id?: string;
  rider_id: string;
  driver_id: string;
  rider: Student;
  driver: Student;
  route: Route;
  scheduled_date: string;
  scheduled_time: string;
  approx_pickup_area: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  request_id: string;
  driver: Student;
  rider: Student;
  status: 'in_progress' | 'completed' | 'cancelled';
  distance_km: number;
  co2_saved_kg: number;
  started_at: string;
  completed_at?: string;
}

export interface NotificationItem {
  id: string;
  student_id: string;
  title: string;
  message: string;
  type: 'match_found' | 'request_received' | 'request_accepted' | 'request_declined' | 'ride_completed' | 'verification_status';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface RatingReview {
  id: string;
  ride_id: string;
  rater_id: string;
  rated_student_id: string;
  rating: number; // 1-5
  review?: string;
  co2_saved_kg: number;
  created_at: string;
}

export interface PrivacySettings {
  student_id: string;
  share_live_location_accepted_only: boolean;
  show_approx_pickup_only: boolean;
  mask_phone_until_accepted: boolean;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_student_id: string;
  reported_student_name: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}
