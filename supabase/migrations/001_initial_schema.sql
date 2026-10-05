-- ============================================================================
-- CampusRide (Common Transportation Finder) — Database Schema
-- DY Patil College of Engineering (DYPCOE), Akurdi, Pune
-- Dept. of AI & Data Science
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE student_role AS ENUM ('offer', 'need', 'both');
CREATE TYPE vehicle_type AS ENUM ('two_wheeler', 'car');
CREATE TYPE vehicle_pref AS ENUM ('two_wheeler', 'car', 'any');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE request_status AS ENUM (
  'created', 
  'searching', 
  'match_found', 
  'contacted', 
  'accepted', 
  'declined', 
  'completed', 
  'no_match'
);
CREATE TYPE ride_status AS ENUM ('in_progress', 'completed', 'cancelled');
CREATE TYPE notif_type AS ENUM (
  'match_found', 
  'request_received', 
  'request_accepted', 
  'request_declined', 
  'ride_completed', 
  'verification_status'
);
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL, -- 'FE', 'SE', 'TE', 'BE', 'Faculty'
  enrollment_no VARCHAR(50) UNIQUE NOT NULL,
  role student_role NOT NULL DEFAULT 'need',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  total_rides INT DEFAULT 0,
  co2_saved_kg NUMERIC(6, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Restrict to college email domain
  CONSTRAINT check_college_email CHECK (college_email LIKE '%@dypcoeakurdi.ac.in')
);

-- 2. Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  id_card_image_url TEXT NOT NULL,
  enrollment_no VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  year VARCHAR(20) NOT NULL,
  status verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES students(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  plate_number VARCHAR(20) NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats >= 1),
  available_seats INT NOT NULL CHECK (available_seats >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  is_campus BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Routes Table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role student_role NOT NULL,
  origin_name VARCHAR(150) NOT NULL,
  origin_lat NUMERIC(10, 7) NOT NULL,
  origin_lng NUMERIC(10, 7) NOT NULL,
  destination_name VARCHAR(150) NOT NULL DEFAULT 'DY Patil College of Engg (DYPCOE)',
  destination_lat NUMERIC(10, 7) NOT NULL DEFAULT 18.6448,
  destination_lng NUMERIC(10, 7) NOT NULL DEFAULT 73.7580,
  polyline_coords JSONB NOT NULL, -- Array of [lat, lng] pairs
  distance_km NUMERIC(5, 2) NOT NULL,
  duration_min INT NOT NULL,
  arrival_time TIME NOT NULL,
  arrival_window_min INT DEFAULT 15,
  days_of_week TEXT[] NOT NULL, -- ['M', 'T', 'W', 'T', 'F', 'S']
  vehicle_type vehicle_pref DEFAULT 'any',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  need_route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  offer_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  need_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_match_pct NUMERIC(5, 2) NOT NULL CHECK (route_match_pct >= 60.0), -- minimum 60% threshold
  time_diff_min INT NOT NULL CHECK (time_diff_min <= 15), -- maximum 15 min window
  shared_days TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ride Requests Table
CREATE TABLE IF NOT EXISTS ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  rider_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  approx_pickup_area VARCHAR(150) NOT NULL,
  status request_status NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Rides Table (Active / Completed)
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  ride_status ride_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  distance_km NUMERIC(5, 2) NOT NULL,
  co2_saved_kg NUMERIC(5, 2) NOT NULL, -- computed as distance_km * 0.12 kg CO2
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type notif_type NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Ratings & Reviews Table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rated_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  co2_saved_kg NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. User Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reported_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  blocked_student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, blocked_student_id)
);

-- 13. Privacy Settings Table
CREATE TABLE IF NOT EXISTS privacy_settings (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  share_live_location_accepted_only BOOLEAN DEFAULT true,
  show_approx_pickup_only BOOLEAN DEFAULT true,
  mask_phone_until_accepted BOOLEAN DEFAULT true,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid corridor and schedule queries
CREATE INDEX IF NOT EXISTS idx_routes_arrival_time ON routes(arrival_time, is_active);
CREATE INDEX IF NOT EXISTS idx_routes_student_id ON routes(student_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id, is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Students can read public profiles of peers; can edit only their own
CREATE POLICY "Public profile view" ON students FOR SELECT USING (true);
CREATE POLICY "Edit own profile" ON students FOR UPDATE USING (auth.uid() = id);

-- Phone Number Masking Helper Function & View
CREATE OR REPLACE FUNCTION mask_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  IF length(phone) >= 10 THEN
    RETURN substring(phone from 1 for 4) || '••••••' || substring(phone from length(phone)-1 for 2);
  ELSE
    RETURN '••••••••••';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
