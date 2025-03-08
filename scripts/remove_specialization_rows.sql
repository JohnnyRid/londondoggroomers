-- Script to remove specific rows from the specializations table
-- Run this in the Supabase SQL Editor

-- Temporarily disable Row Level Security to allow deletes
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
    
    -- Delete the specified rows
    DELETE FROM specializations 
    WHERE id IN (13, 14, 15, 16, 17, 18, 19, 20);
    
    -- Log the number of rows affected
    RAISE NOTICE 'Removed rows with IDs 13, 14, 15, 16, 17, 18, 19, 20 from specializations table';
    
    -- Re-enable RLS after deletion
    ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;
  ELSE
    -- If RLS is not enabled, we can just delete normally
    DELETE FROM specializations 
    WHERE id IN (13, 14, 15, 16, 17, 18, 19, 20);
    
    RAISE NOTICE 'Removed rows with IDs 13, 14, 15, 16, 17, 18, 19, 20 from specializations table';
  END IF;
END $$;