-- Script to add the slug column to businesses table for SEO-friendly URLs

-- First check if the column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'businesses' 
    AND column_name = 'slug'
  ) THEN
    -- Add the slug column if it doesn't exist
    ALTER TABLE businesses ADD COLUMN slug TEXT;
    RAISE NOTICE 'Added slug column to businesses table';
    
    -- Update the slug column for all existing businesses
    UPDATE businesses 
    SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'));
    RAISE NOTICE 'Updated slug values for all businesses';
    
    -- Remove extra hyphens at start and end
    UPDATE businesses 
    SET slug = REGEXP_REPLACE(REGEXP_REPLACE(slug, '^-+', ''), '-+$', '');
    RAISE NOTICE 'Cleaned up slug values';
    
    -- Create an index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
    RAISE NOTICE 'Created index on slug column';
    
    -- Add a comment explaining the purpose
    COMMENT ON COLUMN businesses.slug IS 'SEO-friendly URL slug derived from business name';
    RAISE NOTICE 'Added comment to slug column';
  ELSE
    RAISE NOTICE 'Slug column already exists in businesses table';
  END IF;
END $$;