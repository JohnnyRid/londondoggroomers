-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Set up RLS (Row Level Security) policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy for inserting messages - anyone can submit a contact form
CREATE POLICY "Anyone can insert contact messages" 
ON contact_messages FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- Policy for reading messages - only authenticated users can read
CREATE POLICY "Only authenticated users can read contact messages" 
ON contact_messages FOR SELECT 
TO authenticated
USING (true);

-- Comment on the table
COMMENT ON TABLE contact_messages IS 'Messages submitted through the contact form on the website';