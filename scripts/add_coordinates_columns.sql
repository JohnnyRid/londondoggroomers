-- Add latitude and longitude columns to businesses table
ALTER TABLE businesses
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add geography column for spatial queries
ALTER TABLE businesses
ADD COLUMN location geography(POINT);

-- Create an index on the geography column for faster spatial queries
CREATE INDEX businesses_location_idx ON businesses USING GIST (location);

-- Create a trigger function to automatically update the geography column
CREATE OR REPLACE FUNCTION update_business_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_business_location_trigger
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_business_location();

-- Add comment explaining the columns
COMMENT ON COLUMN businesses.latitude IS 'Geographical latitude of the business location';
COMMENT ON COLUMN businesses.longitude IS 'Geographical longitude of the business location';
COMMENT ON COLUMN businesses.location IS 'Geography point representing the business location for spatial queries';
