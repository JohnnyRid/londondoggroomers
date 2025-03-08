import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_SPECIALIZATIONS = [
  {
    name: "Basic Grooming",
    description: "Full grooming service including bath, brush, trim, and nail clipping.",
    icon_type: "scissors"
  },
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

export async function GET() {
  try {
    // Check if table exists and has data
    const { count: existingCount } = await supabase
      .from('specializations')
      .select('*', { count: 'exact', head: true });

    if (existingCount && existingCount > 0) {
      return NextResponse.json({
        status: 'warning',
        message: 'Specializations table already contains data.',
        table_exists: true,
        data_count: existingCount,
        specializations_added: 0,
        details: []
      });
    }

    // Insert default specializations
    const { error: insertError } = await supabase
      .from('specializations')
      .insert(DEFAULT_SPECIALIZATIONS);

    if (insertError) {
      console.error('Error inserting specializations:', insertError);
      return NextResponse.json({
        status: 'error',
        message: 'Failed to insert specializations.',
        details: [insertError.message]
      });
    }

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Successfully initialized specializations.',
      table_exists: true,
      data_count: DEFAULT_SPECIALIZATIONS.length,
      specializations_added: DEFAULT_SPECIALIZATIONS.length,
      details: DEFAULT_SPECIALIZATIONS
    });

  } catch (error) {
    console.error('Error in initialization:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An unexpected error occurred.',
      details: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
}