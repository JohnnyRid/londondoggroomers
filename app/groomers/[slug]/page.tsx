import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateLocationUrl, generateSlug } from '@/lib/urlUtils';

// Define groomer interface
interface Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  locations?: { name: string };
  locationName?: string;
  slug?: string;
}

interface PageParams {
  slug: string;
}

// Fetch groomer by slug
async function getGroomerBySlug(slug: string): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .eq('slug', slug)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return {
      ...data,
      locationName: data.locations?.name || "London"
    };
  } catch (error) {
    console.error('Error fetching groomer by slug:', error);
    return null;
  }
}

// Generate metadata
export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const slug = params.slug;
  const groomer = await getGroomerBySlug(slug);
  
  if (!groomer) {
    return {
      title: 'Groomer Not Found',
      description: 'The requested dog groomer could not be found.'
    };
  }
  
  return {
    title: `${groomer.name} - Dog Groomer in ${groomer.locationName || 'London'}`,
    description: groomer.description || 
      `${groomer.name} offers professional dog grooming services in ${groomer.locationName || 'London'}. Book appointments and read reviews.`
  };
}

// Page component
export default async function GroomerPage({ params }: { params: PageParams }) {
  const { slug } = params;
  const groomer = await getGroomerBySlug(slug);
  
  if (!groomer) {
    notFound();
    return null;
  }
  
  // Current path for the breadcrumb
  const currentPath = `/groomers/${slug}`;
  
  // Generate location name for breadcrumb
  const locationName = groomer.locations?.name || groomer.locationName || null;
  
  // Generate breadcrumb JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://london-dog-groomers.vercel.app';
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${siteUrl}`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Dog Groomers',
        'item': `${siteUrl}/groomers`
      },
      ...(locationName ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': `${locationName} Dog Groomers`,
        'item': `${siteUrl}${generateLocationUrl(locationName)}`
      }] : []),
      {
        '@type': 'ListItem',
        'position': locationName ? 4 : 3,
        'name': groomer.name,
        'item': `${siteUrl}${currentPath}`
      }
    ]
  };
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
        />
        
        {/* Breadcrumbs UI */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/groomers" className="hover:text-blue-600">Dog Groomers</Link>
            {locationName && (
              <>
                <span className="mx-2">›</span>
                <Link href={generateLocationUrl(locationName)} className="hover:text-blue-600">
                  {locationName} Dog Groomers
                </Link>
              </>
            )}
            <span className="mx-2">›</span>
            <span className="text-gray-900">{groomer.name}</span>
          </div>
        </div>
        
        {/* Groomer details placeholder - to be expanded */}
        <h1 className="text-3xl font-bold mb-4">{groomer.name}</h1>
        {locationName && <p className="text-lg text-gray-700 mb-4">Location: {locationName}</p>}
        
        {/* Groomer content will be added here */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-700">
            {groomer.description || `${groomer.name} is a professional dog groomer located in ${locationName || 'London'}.`}
          </p>
        </div>
      </div>
    </div>
  );
}