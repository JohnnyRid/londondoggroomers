'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function DebugAreas() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    async function fetchAreas() {
      try {
        const { data, error } = await supabase.from('areas').select('*');
        
        if (error) throw error;
        setAreas(data || []);
      } catch (err: any) {
        console.error('Error fetching areas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAreas();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Areas</h1>
      
      {loading && <p>Loading areas data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <h2 className="text-xl font-semibold mt-4 mb-2">Available Areas in Database:</h2>
      <ul>
        {areas.map((area, i) => (
          <li key={i} className="mb-4">
            <strong>ID:</strong> {area.id}<br />
            <strong>Name:</strong> {area.name}<br />
            <strong>Slug:</strong> {area.slug}<br />
          </li>
        ))}
      </ul>
      
      <p className="mt-4">Check if "north-london" exists in the list above with the exact spelling and casing.</p>
    </div>
  );
}