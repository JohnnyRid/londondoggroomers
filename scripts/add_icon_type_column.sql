-- Script to add icon_type column to existing specializations table
-- Run this in the Supabase SQL Editor

-- Add icon_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'specializations' AND column_name = 'icon_type'
  ) THEN
    -- Add the icon_type column to the specializations table
    ALTER TABLE specializations ADD COLUMN icon_type TEXT;
    
    -- Update existing records with appropriate icon_type values
    UPDATE specializations SET icon_type = 'puppy' WHERE name ILIKE '%puppy%' OR name ILIKE '%young%';
    UPDATE specializations SET icon_type = 'breed' WHERE name ILIKE '%breed%' OR name ILIKE '%specific%';
    UPDATE specializations SET icon_type = 'medical' WHERE name ILIKE '%medic%' OR name ILIKE '%health%' OR name ILIKE '%skin%';
    UPDATE specializations SET icon_type = 'mobile' WHERE name ILIKE '%mobile%' OR name ILIKE '%home%';
    UPDATE specializations SET icon_type = 'styling' WHERE name ILIKE '%style%' OR name ILIKE '%show%' OR name ILIKE '%cut%';
    UPDATE specializations SET icon_type = 'sensitive' WHERE name ILIKE '%sensitive%' OR name ILIKE '%nervous%' OR name ILIKE '%anxious%';
    UPDATE specializations SET icon_type = 'spa' WHERE name ILIKE '%spa%' OR name ILIKE '%massage%' OR name ILIKE '%relax%';
    UPDATE specializations SET icon_type = 'grooming' WHERE name ILIKE '%groom%' OR name ILIKE '%full%' OR name ILIKE '%basic%';
    
    -- Set a default for any rows that didn't match the above patterns
    UPDATE specializations SET icon_type = 'default' WHERE icon_type IS NULL;
    
    RAISE NOTICE 'Added icon_type column to specializations table';
  ELSE
    RAISE NOTICE 'icon_type column already exists in specializations table';
  END IF;
END $$;