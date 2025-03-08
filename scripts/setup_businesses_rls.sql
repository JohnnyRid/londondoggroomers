-- Script to set up RLS policies for businesses table
-- First, ensure RLS is enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read businesses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'businesses' 
    AND policyname = 'Allow public read access to businesses'
  ) THEN
    CREATE POLICY "Allow public read access to businesses"
    ON businesses
    FOR SELECT
    USING (true);
    
    RAISE NOTICE 'Created public read access policy for businesses';
  ELSE
    RAISE NOTICE 'Public read access policy for businesses already exists';
  END IF;
END $$;

-- Create service role full access policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'businesses' 
    AND policyname = 'Allow service role full access to businesses'
  ) THEN
    CREATE POLICY "Allow service role full access to businesses"
    ON businesses
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
    
    RAISE NOTICE 'Created service role full access policy for businesses';
  ELSE
    RAISE NOTICE 'Service role full access policy for businesses already exists';
  END IF;
END $$;