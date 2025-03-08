import { supabase } from './supabase';

async function fetchTableInfo() {
  try {
    // Fetch list of tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) throw tablesError;
    
    console.log('Available tables:');
    console.log(tables.map(t => t.tablename));
    
    // For each table, fetch its columns
    for (const table of tables) {
      const tableName = table.tablename;
      
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.error(`Error fetching columns for ${tableName}:`, columnsError);
        continue;
      }
      
      console.log(`\nTable: ${tableName}`);
      console.log('Columns:');
      console.log(columns.map(c => `${c.column_name} (${c.data_type})`));
      
      // Fetch sample data
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(2);
      
      if (sampleError) {
        console.error(`Error fetching sample data for ${tableName}:`, sampleError);
        continue;
      }
      
      console.log('Sample data:');
      console.log(sampleData);
    }
    
  } catch (error) {
    console.error('Error fetching database schema:', error);
  }
}

// Run the function
fetchTableInfo();