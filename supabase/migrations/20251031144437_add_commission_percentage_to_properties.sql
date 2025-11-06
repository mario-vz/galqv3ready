/*
  # Add Commission Percentage to Properties

  ## Overview
  This migration adds a commission percentage field to the properties table to track
  the percentage that Galquiler takes from each property's income.

  ## Changes
  1. New Columns
    - `commission_percentage` (decimal) - The percentage Galquiler takes from income
      - Default: 10.0
      - Constraint: Must be between 0 and 100
      - Allows custom percentages beyond predefined options (7%, 10%, 15%)

  ## Important Notes
  - Existing properties will default to 10% commission
  - Property owners can select from preset options or enter custom percentages
  - This will be used to calculate Galquiler's earnings in the income panel
*/

-- Add commission percentage column to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN commission_percentage decimal(5, 2) DEFAULT 10.0 
    CHECK (commission_percentage >= 0 AND commission_percentage <= 100);
  END IF;
END $$;