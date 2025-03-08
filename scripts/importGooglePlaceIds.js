// Script to import Google Place IDs from a spreadsheet to Supabase
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration - update these values
const SPREADSHEET_PATH = 'C:/path/to/your/spreadsheet.xlsx'; // Replace with your actual file path
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name
const BUSINESS_NAME_COLUMN = 'BusinessName'; // Column containing business names
const GOOGLE_PLACE_ID_COLUMN = 'GooglePlaceId'; // Column containing Google Place IDs

async function importGooglePlaceIds() {
  try {
    // Check if file exists
    if (!fs.existsSync(SPREADSHEET_PATH)) {
      console.error(`File not found: ${SPREADSHEET_PATH}`);
      process.exit(1);
    }

    // Read the spreadsheet
    console.log('Reading spreadsheet...');
    const workbook = xlsx.readFile(SPREADSHEET_PATH);
    
    // Check if sheet exists
    if (!workbook.SheetNames.includes(SHEET_NAME)) {
      console.error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
      process.exit(1);
    }
    
    // Get the worksheet
    const worksheet = workbook.Sheets[SHEET_NAME];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      console.error('No data found in the spreadsheet');
      process.exit(1);
    }
    
    console.log(`Found ${data.length} rows of data`);
    
    // Validate columns exist
    if (!data[0].hasOwnProperty(BUSINESS_NAME_COLUMN) || !data[0].hasOwnProperty(GOOGLE_PLACE_ID_COLUMN)) {
      console.error(`Required columns not found. Needed: ${BUSINESS_NAME_COLUMN}, ${GOOGLE_PLACE_ID_COLUMN}`);
      console.error(`Available columns: ${Object.keys(data[0]).join(', ')}`);
      process.exit(1);
    }
    
    // Process each row
    let updatedCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    console.log('Updating businesses in Supabase...');
    
    for (const row of data) {
      const businessName = row[BUSINESS_NAME_COLUMN];
      const googlePlaceId = row[GOOGLE_PLACE_ID_COLUMN];
      
      if (!businessName || !googlePlaceId) {
        console.warn(`Skipping row with missing data: ${JSON.stringify(row)}`);
        continue;
      }
      
      // Find the business in Supabase by name
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name')
        .ilike('name', businessName);
      
      if (fetchError) {
        console.error(`Error fetching business "${businessName}":`, fetchError.message);
        errorCount++;
        continue;
      }
      
      if (!businesses || businesses.length === 0) {
        console.warn(`Business not found: "${businessName}"`);
        notFoundCount++;
        continue;
      }
      
      // If multiple businesses found with similar names, ask for confirmation or use exact match
      const exactMatch = businesses.find(b => b.name.toLowerCase() === businessName.toLowerCase());
      const businessToUpdate = exactMatch || businesses[0];
      
      // Update the business with Google Place ID
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ google_place_id: googlePlaceId })
        .eq('id', businessToUpdate.id);
        
      if (updateError) {
        console.error(`Error updating business "${businessName}":`, updateError.message);
        errorCount++;
      } else {
        console.log(`✓ Updated "${businessToUpdate.name}" with Google Place ID: ${googlePlaceId}`);
        updatedCount++;
      }
    }
    
    // Print summary
    console.log('\n--- Import Summary ---');
    console.log(`Total rows processed: ${data.length}`);
    console.log(`Businesses updated: ${updatedCount}`);
    console.log(`Businesses not found: ${notFoundCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the import function
importGooglePlaceIds();