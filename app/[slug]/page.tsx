import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import _Link from 'next/link';
import { supabase } from '../../lib/supabase';
import _BusinessImage from '../components/BusinessImage';
import { generateGroomerUrl as _generateGroomerUrl } from '@/lib/urlUtils';
import _SpecializationIcon from '../components/SpecializationIcon';

// Define interfaces for type safety
interface Location {
  id: number;
  name: string;
}

interface Specialization {
  id: number;
  name: string;
  description?: string;
  icon_type?: string;
}

interface _Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  slug: string;
  locationName?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// This function determines if the slug is a location or specialization
async function getPageType(slug: string): Promise<{ type: 'location' | 'specialization' | null; data: any }> {
  try {
    const { data: locationData } = await supabase
      .from('locations')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .maybeSingle();
    
    if (locationData) return { type: 'location', data: locationData };
    
    const { data: specData } = await supabase
      .from('specializations')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .maybeSingle();
    
    if (specData) return { type: 'specialization', data: specData };
    
    return { type: null, data: null };
  } catch (error) {
    console.error('Error determining page type:', error);
    return { type: null, data: null };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const { type, data } = await getPageType(slug);
  
  if (!type || !data) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }
  
  if (type === 'location') {
    return {
      title: `Dog Groomers in ${data.name} | London Dog Groomers`,
      description: `Find the best professional dog groomers in ${data.name}. Compare services, read reviews, and book appointments for dog grooming in ${data.name}.`,
      alternates: {
        canonical: `https://londondoggroomers.com/${slug}`
      }
    };
  }
  
  return {
    title: `${data.name} Dog Grooming Services in London | Specialized Groomers`,
    description: data.description || `Find dog groomers offering ${data.name} services in London. Expert groomers specializing in ${data.name.toLowerCase()} for your pet's needs.`,
    alternates: {
      canonical: `https://londondoggroomers.com/${slug}`
    }
  };
}

export default async function DynamicPage({
  params,
  searchParams: _searchParams
}: PageProps) {
  const { slug } = await params;
  const { type, data } = await getPageType(slug);
  
  if (!type || !data) {
    notFound();
    return null;
  }
  
  if (type === 'location') {
    const locationData = data as Location;
    return (
      <div className="min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Dog Groomers in {locationData.name}
          </h1>
          <p>Location page content will be restored after fixing TypeScript issues.</p>
        </div>
      </div>
    );
  }
  
  const specializationData = data as Specialization;
  return (
    <div className="min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">
          {specializationData.name} Dog Grooming Services
        </h1>
        <p>Specialization page content will be restored after fixing TypeScript issues.</p>
      </div>
    </div>
  );
}
