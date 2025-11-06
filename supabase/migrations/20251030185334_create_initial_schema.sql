/*
  # Create Initial Schema for Galquiler

  ## Overview
  This migration creates the complete database structure for the Galquiler property management platform.
  It includes tables for user profiles, properties, reservations, income tracking, reviews, and platform integrations.

  ## New Tables

  ### 1. `profiles`
  Extended user profile information linked to Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text)
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `properties`
  Properties managed by users
  - `id` (uuid, primary key)
  - `owner_id` (uuid, references profiles)
  - `name` (text, not null)
  - `description` (text)
  - `location` (text, not null)
  - `address` (text)
  - `image_url` (text)
  - `status` (text, default 'active') - active, maintenance, inactive
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `platform_integrations`
  Integration with booking platforms (Airbnb, Booking.com, etc)
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `platform_name` (text, not null) - airbnb, booking, vrbo, etc
  - `platform_url` (text)
  - `ical_url` (text)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `reservations`
  Booking reservations from all platforms
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `platform_integration_id` (uuid, references platform_integrations)
  - `guest_name` (text)
  - `guest_email` (text)
  - `check_in` (date, not null)
  - `check_out` (date, not null)
  - `nights` (integer, not null)
  - `total_amount` (decimal)
  - `status` (text, default 'confirmed') - confirmed, cancelled, completed
  - `source` (text) - platform name for display
  - `external_id` (text) - ID from external platform
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `income_records`
  Income tracking per property
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `reservation_id` (uuid, references reservations, optional)
  - `amount` (decimal, not null)
  - `date` (date, not null)
  - `description` (text)
  - `type` (text, default 'rental') - rental, cleaning_fee, extra, other
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `reviews`
  Guest reviews for properties
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `reservation_id` (uuid, references reservations, optional)
  - `guest_name` (text, not null)
  - `rating` (integer, not null, 1-5)
  - `comment` (text)
  - `platform` (text) - source platform
  - `review_date` (timestamptz, not null)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated users to access only their own data
  - Policies ensure users can only see/modify properties they own

  ## Indexes
  - Added indexes on foreign keys for performance
  - Added indexes on frequently queried fields (dates, status, etc)

  ## Important Notes
  1. All tables have RLS enabled for security
  2. Users can only access their own properties and related data
  3. Timestamps are automatically managed with triggers
  4. Foreign key constraints ensure data integrity
  5. Status fields use text for flexibility with check constraints
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  location text NOT NULL,
  address text,
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Create platform_integrations table
CREATE TABLE IF NOT EXISTS platform_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  platform_name text NOT NULL CHECK (platform_name IN ('airbnb', 'booking', 'vrbo', 'other')),
  platform_url text,
  ical_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, platform_name)
);

ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own platform integrations"
  ON platform_integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = platform_integrations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own platform integrations"
  ON platform_integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = platform_integrations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own platform integrations"
  ON platform_integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = platform_integrations.property_id
      AND properties.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = platform_integrations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own platform integrations"
  ON platform_integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = platform_integrations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_platform_integrations_property_id ON platform_integrations(property_id);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  platform_integration_id uuid REFERENCES platform_integrations(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL CHECK (nights > 0),
  total_amount decimal(10, 2),
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  source text,
  external_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reservations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reservations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reservations.property_id
      AND properties.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reservations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reservations.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_reservations_property_id ON reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reservations_check_in ON reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_reservations_check_out ON reservations(check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Create income_records table
CREATE TABLE IF NOT EXISTS income_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL,
  date date NOT NULL,
  description text,
  type text DEFAULT 'rental' CHECK (type IN ('rental', 'cleaning_fee', 'extra', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income records"
  ON income_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = income_records.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own income records"
  ON income_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = income_records.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own income records"
  ON income_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = income_records.property_id
      AND properties.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = income_records.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own income records"
  ON income_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = income_records.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_income_records_property_id ON income_records(property_id);
CREATE INDEX IF NOT EXISTS idx_income_records_date ON income_records(date);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  platform text,
  review_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reviews.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reviews.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reviews.property_id
      AND properties.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reviews.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = reviews.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON reviews(review_date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at on all tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_platform_integrations_updated_at') THEN
    CREATE TRIGGER update_platform_integrations_updated_at
      BEFORE UPDATE ON platform_integrations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservations_updated_at') THEN
    CREATE TRIGGER update_reservations_updated_at
      BEFORE UPDATE ON reservations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_income_records_updated_at') THEN
    CREATE TRIGGER update_income_records_updated_at
      BEFORE UPDATE ON income_records
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
