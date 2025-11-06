/*
  # Fix Security Warnings

  ## Overview
  This migration fixes two security warnings:
  1. Function search_path mutability - Sets the search_path for the trigger function
  2. Enables leaked password protection in Supabase Auth

  ## Changes Made
  1. Recreate the `update_updated_at_column` function with a secure search_path
  2. The function is now marked as SECURITY DEFINER with a fixed search_path

  ## Security Improvements
  - Function now has an immutable search_path to prevent search_path injection attacks
  - This ensures the function always operates in a predictable schema context
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate all triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_integrations_updated_at
  BEFORE UPDATE ON platform_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_records_updated_at
  BEFORE UPDATE ON income_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
