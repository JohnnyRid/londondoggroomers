import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // Fetch all specializations from Supabase
    const { data: specializations, error } = await supabase
      .from('specializations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching specializations:', error);
      return NextResponse.json({
        status: 'error',
        message: `Error fetching specializations: ${error.message}`,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: `Successfully retrieved ${specializations?.length || 0} specializations`,
      specializations: specializations || []
    });
  } catch (err) {
    const error = err as Error;
    console.error('Unexpected error fetching specializations:', error);
    
    return NextResponse.json({
      status: 'error',
      message: `Unexpected error: ${error.message}`,
      specializations: []
    }, { status: 500 });
  }
}