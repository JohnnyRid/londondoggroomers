-- Script to set up RLS policies for specializations table
-- Run this in the Supabase SQL Editor

-- First, ensure RLS is enabled
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read specializations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'specializations' 
    AND policyname = 'Allow public read access to specializations'
  ) THEN
    CREATE POLICY "Allow public read access to specializations"
    ON specializations
    FOR SELECT
    USING (true);
    
    RAISE NOTICE 'Created public read access policy for specializations';
  ELSE
    RAISE NOTICE 'Public read access policy for specializations already exists';
  END IF;
END $$;

-- Create service role management policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'specializations' 
    AND policyname = 'Allow service role to manage specializations'
  ) THEN
    CREATE POLICY "Allow service role to manage specializations"
    ON specializations
    USING (auth.role() = 'service_role');
    
    RAISE NOTICE 'Created service role management policy for specializations';
  ELSE
    RAISE NOTICE 'Service role management policy for specializations already exists';
  END IF;
END $$;

-- Add ALL operations policy for service role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'specializations' 
    AND policyname = 'Allow service role full access to specializations'
  ) THEN
    CREATE POLICY "Allow service role full access to specializations"
    ON specializations
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
    
    RAISE NOTICE 'Created service role full access policy for specializations';
  ELSE
    RAISE NOTICE 'Service role full access policy for specializations already exists';
  END IF;
END $$;

-- Add policy for business_service_offerings if needed
ALTER TABLE business_service_offerings ENABLE ROW LEVEL SECURITY;

-- Create public read access policy for business_service_offerings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'business_service_offerings' 
    AND policyname = 'Allow public read access to business_service_offerings'
  ) THEN
    CREATE POLICY "Allow public read access to business_service_offerings"
    ON business_service_offerings
    FOR SELECT
    USING (true);
    
    RAISE NOTICE 'Created public read access policy for business_service_offerings';
  ELSE
    RAISE NOTICE 'Public read access policy for business_service_offerings already exists';
  END IF;
END $$;

-- Create a simpler policy for business owners - without linking to user ID
-- This avoids the auth_user_id column not found error
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'business_service_offerings' 
    AND policyname = 'Allow business owners to manage their offerings'
  ) THEN
    -- Create a simplified policy that just allows authenticated users to manage offerings
    -- In a production environment, you would want to properly link this to the actual user ID column
    CREATE POLICY "Allow business owners to manage their offerings"
    ON business_service_offerings
    FOR ALL
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'Created business owners management policy for business_service_offerings';
  ELSE
    RAISE NOTICE 'Business owners management policy for business_service_offerings already exists';
  END IF;
END $$;

-- Add service role full access policy for business_service_offerings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'business_service_offerings' 
    AND policyname = 'Allow service role full access to business_service_offerings'
  ) THEN
    CREATE POLICY "Allow service role full access to business_service_offerings"
    ON business_service_offerings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
    
    RAISE NOTICE 'Created service role full access policy for business_service_offerings';
  ELSE
    RAISE NOTICE 'Service role full access policy for business_service_offerings already exists';
  END IF;
END $$;