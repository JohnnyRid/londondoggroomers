// Script to check and initialize specializations in the Supabase database
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure your .env file is properly configured.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define common grooming specializations
const specializations = [
  {
    name: 'Puppy Grooming',
    description: 'Gentle grooming services specially designed for puppies and young dogs. Our groomers are trained to make their first grooming experiences positive and stress-free.'
  },
  {
    name: 'Breed-Specific Styling',
    description: 'Specialized grooming techniques tailored to the specific needs of different dog breeds. Our groomers understand the unique requirements for each breed\'s coat type and style.'
  },
  {
    name: 'Medical Grooming',
    description: 'Special care for dogs with medical conditions, skin problems, or allergies. Our groomers work with gentle products and techniques suited for sensitive skin.'
  },
  {
    name: 'Mobile Grooming',
    description: 'Convenient grooming services brought directly to your doorstep. Ideal for busy owners or dogs that get stressed during travel.'
  },
  {
    name: 'Show Dog Styling',
    description: 'Professional grooming for show dogs following breed-specific standards to ensure they look their best in competition.'
  },
  {
    name: 'Sensitive Dog Handling',
    description: 'Specialized handling for anxious, nervous, or sensitive dogs. Our patient groomers create a calm environment and use gentle techniques for a stress-free experience.'
  },
  {
    name: 'Spa Treatments',
    description: 'Pamper your pet with our luxurious spa treatments. Including massages, aromatic baths, and conditioning treatments for a truly relaxing experience.'
  },
  {
    name: 'Full Grooming Service',
    description: 'Complete grooming package including bath, haircut, nail trimming, ear cleaning, and more for a comprehensive care experience.'
  }
];

async function checkAndCreateTables() {
  console.log('Checking Supabase connection and tables...');
  
  try {
    // Check if the specializations table exists by attempting to query it
    const { data, error } = await supabase
      .from('specializations')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // PostgreSQL error code for "relation does not exist"
        console.log('Specializations table does not exist. Creating it now...');
        await createSpecializationsTable();
      } else {
        console.error('Error checking specializations table:', error);
        return;
      }
    } else {
      console.log('Specializations table exists.');
      const count = await getSpecializationCount();
      
      if (count === 0) {
        console.log('Specializations table is empty. Adding sample specializations...');
        await insertSpecializations();
      } else {
        console.log(`Found ${count} specializations in the database.`);
        await listSpecializations();
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

async function createSpecializationsTable() {
  // Use SQL to create the table
  const { error } = await supabase.rpc('create_specializations_table');
  
  if (error) {
    console.error('Error creating specializations table:', error);
    
    // Fallback approach: Try to create it manually via SQL
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS specializations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (sqlError) {
      console.error('Failed to create table using SQL:', sqlError);
      return false;
    }
  }
  
  console.log('Specializations table created successfully!');
  await insertSpecializations();
  return true;
}

async function insertSpecializations() {
  const { data, error } = await supabase
    .from('specializations')
    .insert(specializations)
    .select();
  
  if (error) {
    console.error('Error inserting specializations:', error);
    return false;
  }
  
  console.log(`Successfully added ${data.length} specializations to the database.`);
  await listSpecializations();
  return true;
}

async function getSpecializationCount() {
  const { count, error } = await supabase
    .from('specializations')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting specialization count:', error);
    return 0;
  }
  
  return count || 0;
}

async function listSpecializations() {
  const { data, error } = await supabase
    .from('specializations')
    .select('*');
  
  if (error) {
    console.error('Error listing specializations:', error);
    return;
  }
  
  console.log('Current specializations in the database:');
  data.forEach((spec, index) => {
    console.log(`${index + 1}. ${spec.name} (ID: ${spec.id})`);
  });
}

// Execute the main function
checkAndCreateTables()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });