// import_place_ids.js
// Script to import Google Place IDs from a CSV file to Supabase

// Usage: node import_place_ids.js businesses_rows.csv

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Debug logging
console.log('Debug: Script started');
console.log(`Debug: Looking for environment variables in: ${path.resolve(__dirname, '../.env.local')}`);

// Get the Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Required environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

console.log(`Debug: Supabase URL found: ${supabaseUrl ? 'Yes' : 'No'}`);
console.log(`Debug: Supabase Key found: ${supabaseKey ? 'Yes' : 'No'}`);
console.log('Debug: Creating Supabase client');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Get CSV file path from command line arguments
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Usage: node import_place_ids.js path/to/your/csv_file.csv');
  process.exit(1);
}

// Function to parse CSV file and upload data to Supabase
async function importPlaceIds(csvFilePath) {
  try {
    // Resolve path relative to project root if it's not absolute
    if (!path.isAbsolute(csvFilePath)) {
      csvFilePath = path.resolve(__dirname, '..', csvFilePath);
    }
    
    console.log(`Debug: Full CSV path: ${csvFilePath}`);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`File not found: ${csvFilePath}`);
      process.exit(1);
    }

    console.log(`Reading data from ${csvFilePath}`);

    const results = [];
    
    // Read the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('error', (error) => {
          reject(error);
        })
        .on('end', () => {
          resolve();
        });
    });

    // Log the first few rows to understand the structure
    if (results.length > 0) {
      console.log('Sample CSV data:');
      console.log(results[0]);
    } else {
      console.error('No data found in the CSV file');
      process.exit(1);
    }
    
    console.log(`Found ${results.length} records in CSV file`);
    
    let processed = 0;
    let updated = 0;
    let errors = 0;

    // Process each row
    for (const row of results) {
      processed++;
      
      // Check for required fields
      if (!row.business_id && !row.name) {
        console.error(`Row ${processed}: Missing business identifier (business_id or name)`);
        errors++;
        continue;
      }
      
      if (!row.google_place_id) {
        console.error(`Row ${processed}: Missing Google Place ID`);
        errors++;
        continue;
      }

      try {
        let updateResult;
        
        if (row.business_id) {
          // Try to update by business_id
          updateResult = await supabase
            .from('businesses')
            .update({ google_place_id: row.google_place_id })
            .eq('id', row.business_id);
        } else {
          // Try to update by name
          updateResult = await supabase
            .from('businesses')
            .update({ google_place_id: row.google_place_id })
            .eq('name', row.name);
        }
        
        // Check for errors
        if (updateResult.error) {
          console.error(`Row ${processed}: Error updating business: ${updateResult.error.message}`);
          errors++;
          continue;
        }
        
        console.log(`✓ Updated business ${row.business_id || row.name} with Place ID: ${row.google_place_id}`);
        updated++;
      } catch (err) {
        console.error(`Row ${processed}: Exception: ${err.message}`);
        errors++;
      }

      // Add a small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Summary
    console.log('\nImport Summary:');
    console.log(`Total records processed: ${processed}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Errors: ${errors}`);

    if (updated === 0) {
      console.log('\nTip: Make sure your CSV has the correct column headers:');
      console.log('- business_id or name (to identify the business)');
      console.log('- google_place_id (the Google Place ID to import)');
    }
    
    return { processed, updated, errors };
  } catch (mainError) {
    console.error('Fatal error:', mainError);
    process.exit(1);
  }
}

console.log('Debug: Starting import process');
importPlaceIds(csvFilePath)
  .then(({ processed, updated, errors }) => {
    console.log('Import process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during import process:', error);
    process.exit(1);
  });