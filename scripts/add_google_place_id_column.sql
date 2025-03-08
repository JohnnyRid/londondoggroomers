-- Add the google_place_id column to the businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Comment on the column to explain what it stores
COMMENT ON COLUMN businesses.google_place_id IS 'Google Places API unique identifier for this business';

-- Create an index to improve lookup performance
CREATE INDEX IF NOT EXISTS idx_businesses_google_place_id ON businesses(google_place_id);

-- Add a function to update the modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the updated_at column gets updated automatically
DROP TRIGGER IF EXISTS update_businesses_modtime ON businesses;
CREATE TRIGGER update_businesses_modtime
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();