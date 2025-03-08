-- Add featured column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

COMMENT ON COLUMN businesses.featured IS 'Indicates if this business should be featured at the top of location pages';