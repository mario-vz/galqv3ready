/*
  # Add guest phone number to reservations

  ## Changes
  - Add `guest_phone` column to `reservations` table to store guest phone numbers
  
  ## Details
  - Column: `guest_phone` (text, nullable)
  - This allows storing phone numbers for guests making reservations
  - Phone number is optional as not all booking sources provide this information
  - No RLS policy changes needed as phone access follows existing reservation policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'guest_phone'
  ) THEN
    ALTER TABLE reservations ADD COLUMN guest_phone text;
  END IF;
END $$;