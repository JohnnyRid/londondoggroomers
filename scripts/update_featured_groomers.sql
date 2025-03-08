-- Update featured column for high-rated businesses
UPDATE businesses
SET featured = true
WHERE rating > 4.4;

-- Count how many rows were updated
SELECT COUNT(*) as "Businesses marked as featured"
FROM businesses
WHERE featured = true;

-- Optional: Show the businesses that were marked as featured
SELECT id, name, rating, review_count, location_id
FROM businesses
WHERE featured = true
ORDER BY rating DESC, review_count DESC;