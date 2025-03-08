-- Setup script for dog grooming specializations tables
-- Run this in the Supabase SQL Editor

-- 1. Create the specializations table if it doesn't exist
CREATE TABLE IF NOT EXISTS specializations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_type TEXT, -- Stores the icon type identifier (puppy, breed, medical, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'specializations_name_key'
  ) THEN
    ALTER TABLE specializations ADD CONSTRAINT specializations_name_key UNIQUE (name);
  END IF;
END $$;

-- If the table already exists but doesn't have the icon_type column, add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'specializations' AND column_name = 'icon_type'
  ) THEN
    ALTER TABLE specializations ADD COLUMN icon_type TEXT;
  END IF;
END $$;

-- 2. Temporarily disable Row Level Security to allow inserts
-- Store the current state of RLS for this table
DO $$ 
DECLARE
  is_rls_enabled BOOLEAN;
BEGIN
  -- Check if RLS is enabled for the specializations table
  SELECT relrowsecurity INTO is_rls_enabled 
  FROM pg_class 
  WHERE oid = 'specializations'::regclass;
  
  IF is_rls_enabled THEN
    -- Temporarily disable RLS for specializations table
    ALTER TABLE specializations DISABLE ROW LEVEL SECURITY;
    
    -- Insert the data
    -- Check if we need to insert Puppy Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Puppy Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Puppy Grooming', 'Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.', 'puppy');
    ELSE
      UPDATE specializations 
      SET description = 'Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.',
          icon_type = 'puppy'
      WHERE name = 'Puppy Grooming';
    END IF;

    -- Check if we need to insert Breed-Specific Styling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Breed-Specific Styling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Breed-Specific Styling', 'Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed''s coat type and style.', 'breed');
    ELSE
      UPDATE specializations 
      SET description = 'Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed''s coat type and style.',
          icon_type = 'breed'
      WHERE name = 'Breed-Specific Styling';
    END IF;

    -- Check if we need to insert Medical Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Medical Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Medical Grooming', 'Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.', 'medical');
    ELSE
      UPDATE specializations 
      SET description = 'Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.',
          icon_type = 'medical'
      WHERE name = 'Medical Grooming';
    END IF;

    -- Check if we need to insert Mobile Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Mobile Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Mobile Grooming', 'Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.', 'mobile');
    ELSE
      UPDATE specializations 
      SET description = 'Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.',
          icon_type = 'mobile'
      WHERE name = 'Mobile Grooming';
    END IF;

    -- Check if we need to insert Show Dog Styling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Show Dog Styling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Show Dog Styling', 'Professional grooming for show dogs following breed-specific standards to ensure they look their best in competition.', 'styling');
    ELSE
      UPDATE specializations 
      SET description = 'Professional grooming for show dogs following breed-specific standards to ensure they look their best in competition.',
          icon_type = 'styling'
      WHERE name = 'Show Dog Styling';
    END IF;

    -- Check if we need to insert Sensitive Dog Handling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Sensitive Dog Handling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Sensitive Dog Handling', 'Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.', 'sensitive');
    ELSE
      UPDATE specializations 
      SET description = 'Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.',
          icon_type = 'sensitive'
      WHERE name = 'Sensitive Dog Handling';
    END IF;

    -- Check if we need to insert Spa Treatments
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Spa Treatments') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Spa Treatments', 'Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.', 'spa');
    ELSE
      UPDATE specializations 
      SET description = 'Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.',
          icon_type = 'spa'
      WHERE name = 'Spa Treatments';
    END IF;

    -- Check if we need to insert Full Grooming Service
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Full Grooming Service') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Full Grooming Service', 'Complete grooming package including bath, haircut, nail trimming, ear cleaning, and more for a comprehensive care experience.', 'grooming');
    ELSE
      UPDATE specializations 
      SET description = 'Complete grooming package including bath, haircut, nail trimming, ear cleaning, and more for a comprehensive care experience.',
          icon_type = 'grooming'
      WHERE name = 'Full Grooming Service';
    END IF;
    
    -- Re-enable RLS after insertion
    ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
  ELSE
    -- If RLS is not enabled, we can just insert normally
    -- Check if we need to insert Puppy Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Puppy Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Puppy Grooming', 'Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.', 'puppy');
    ELSE
      UPDATE specializations 
      SET description = 'Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.',
          icon_type = 'puppy'
      WHERE name = 'Puppy Grooming';
    END IF;

    -- Check if we need to insert Breed-Specific Styling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Breed-Specific Styling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Breed-Specific Styling', 'Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed''s coat type and style.', 'breed');
    ELSE
      UPDATE specializations 
      SET description = 'Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed''s coat type and style.',
          icon_type = 'breed'
      WHERE name = 'Breed-Specific Styling';
    END IF;

    -- Check if we need to insert Medical Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Medical Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Medical Grooming', 'Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.', 'medical');
    ELSE
      UPDATE specializations 
      SET description = 'Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.',
          icon_type = 'medical'
      WHERE name = 'Medical Grooming';
    END IF;

    -- Check if we need to insert Mobile Grooming
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Mobile Grooming') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Mobile Grooming', 'Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.', 'mobile');
    ELSE
      UPDATE specializations 
      SET description = 'Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.',
          icon_type = 'mobile'
      WHERE name = 'Mobile Grooming';
    END IF;

    -- Check if we need to insert Show Dog Styling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Show Dog Styling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Show Dog Styling', 'Professional grooming for show dogs following breed-specific standards to ensure they look their best in competition.', 'styling');
    ELSE
      UPDATE specializations 
      SET description = 'Professional grooming for show dogs following breed-specific standards to ensure they look their best in competition.',
          icon_type = 'styling'
      WHERE name = 'Show Dog Styling';
    END IF;

    -- Check if we need to insert Sensitive Dog Handling
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Sensitive Dog Handling') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Sensitive Dog Handling', 'Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.', 'sensitive');
    ELSE
      UPDATE specializations 
      SET description = 'Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.',
          icon_type = 'sensitive'
      WHERE name = 'Sensitive Dog Handling';
    END IF;

    -- Check if we need to insert Spa Treatments
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Spa Treatments') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Spa Treatments', 'Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.', 'spa');
    ELSE
      UPDATE specializations 
      SET description = 'Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.',
          icon_type = 'spa'
      WHERE name = 'Spa Treatments';
    END IF;

    -- Check if we need to insert Full Grooming Service
    IF NOT EXISTS (SELECT 1 FROM specializations WHERE name = 'Full Grooming Service') THEN
      INSERT INTO specializations (name, description, icon_type)
      VALUES ('Full Grooming Service', 'Complete grooming package including bath, haircut, nail trimming, ear cleaning, and more for a comprehensive care experience.', 'grooming');
    ELSE
      UPDATE specializations 
      SET description = 'Complete grooming package including bath, haircut, nail trimming, ear cleaning, and more for a comprehensive care experience.',
          icon_type = 'grooming'
      WHERE name = 'Full Grooming Service';
    END IF;
  END IF;
END $$;

-- 3. Add a specialization_id column to business_service_offerings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'business_service_offerings' AND column_name = 'specialization_id'
  ) THEN
    ALTER TABLE business_service_offerings ADD COLUMN specialization_id INTEGER REFERENCES specializations(id);
    RAISE NOTICE 'Added specialization_id column to business_service_offerings table';
  ELSE
    RAISE NOTICE 'specialization_id column already exists in business_service_offerings table';
  END IF;
END $$;

-- 4. Create RLS policy for read access if it doesn't exist already
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'specializations' AND policyname = 'Allow public read access to specializations'
  ) THEN
    -- Create the policy for public read access
    CREATE POLICY "Allow public read access to specializations" 
      ON specializations FOR SELECT USING (true);
    
    RAISE NOTICE 'Created RLS policy for public read access to specializations table';
  ELSE
    RAISE NOTICE 'RLS policy for public read access to specializations table already exists';
  END IF;
END $$;

-- Done! Your specializations table is now set up.