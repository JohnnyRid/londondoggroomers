// This file is a script to run the fetchSchema.ts file with Node.js
// By using ts-node, we can execute TypeScript files directly

console.log('Fetching Supabase database schema...');
require('ts-node').register();
require('../lib/fetchSchema.ts');