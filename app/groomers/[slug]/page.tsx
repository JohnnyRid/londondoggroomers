import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateLocationUrl, generateSlug } from '@/lib/urlUtils';
import BusinessImage from '@/app/components/BusinessImage';
import GroomerFAQ from '@/components/groomer/GroomerFAQ';
import GroomerSidebar from '@/components/groomer/GroomerSidebar';
import type { Business, Service, FAQ, PageParams } from './types';
import { parseOpeningHours, parseServices } from '../../../components/groomer/groomerUtils';

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
    description: groomer.description || '',
    openGraph: {
      title: `${groomer.name} - Dog Groomer in ${groomer.locationName || 'London'}`,
      description: groomer.description || '',
      url: generateLocationUrl(slug),
      type: 'website',
      siteName: 'PetServices',
      images: groomer.image_url ? [
        {
          url: groomer.image_url,
          width: 1200,
          height: 630,
          alt: groomer.name
        }
      ] : undefined,
      locale: 'en_GB'
    }
  };
}

export default async function GroomerPage({ params }: { params: PageParams }) {
  const { slug } = params;
  const groomer = await getGroomerBySlug(slug);
  
  if (!groomer) {
    notFound();
    return null;
  }
  
  // Parse services and opening hours
  const services = parseServices(groomer.services);
  const openingHours = parseOpeningHours(groomer.opening_hours);
  
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
        'item': String(siteUrl)
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Dog Groomers',
        'item': String(`${siteUrl}/groomers`)
      },
      ...(locationName ? [{
        '@type': 'ListItem',
        'position': 3,
        'name': `${locationName} Dog Groomers`,
        'item': String(`${siteUrl}${generateLocationUrl(locationName)}`)
      }] : []),
      {
        '@type': 'ListItem',
        'position': locationName ? 4 : 3,
        'name': groomer.name,
        'item': String(`${siteUrl}${currentPath}`)
      }
    ]
  };
  
  // Business Schema markup for SEO
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': groomer.name,
    'description': groomer.description,
    'image': groomer.image_url || `${siteUrl}/images/default-business.jpg`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': locationName || 'London',
      'addressRegion': 'London',
      'addressCountry': 'UK'
    },
    'telephone': groomer.phone || '',
    'email': groomer.email || '',
    'url': groomer.website || `${siteUrl}${currentPath}`
  };
  
  return (
    <div className="min-h-screen">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      
      {/* Hero Section with Business Image */}
      <div className="relative">
        <div className="h-64 md:h-80 lg:h-96 w-full overflow-hidden">
          <BusinessImage 
            imageUrl={groomer.image_url}
            businessName={groomer.name}
            height="h-full" 
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-1">
              <div className="flex items-center text-sm">
                <Link href="/" className="hover:underline text-blue-100">Home</Link>
                <span className="mx-2">›</span>
                <Link href="/groomers" className="hover:underline text-blue-100">Dog Groomers</Link>
                {locationName && (
                  <>
                    <span className="mx-2">›</span>
                    <Link href={generateLocationUrl(locationName)} className="hover:underline text-blue-100">
                      {locationName}
                    </Link>
                  </>
                )}
                <span className="mx-2">›</span>
                <span className="text-white">{groomer.name}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{groomer.name}</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Rating Badge Section */}
            {groomer.rating && (
              <div className={`rounded-lg shadow-md p-6 mb-6 border ${
                groomer.rating >= 4.7 
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-100'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      groomer.rating >= 4.7 ? 'bg-amber-100' : 'bg-gray-100'
                    }`}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 ${
                          groomer.rating >= 4.7 ? 'text-amber-600' : 'text-gray-600'
                        }`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-800">{groomer.rating.toFixed(1)}</span>
                        {groomer.rating >= 4.7 && (
                          <span className="ml-2 text-amber-600 font-semibold">Preferred Groomer</span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {groomer.review_count} verified reviews on Google
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          i < Math.floor(groomer.rating || 0) 
                            ? (groomer.rating >= 4.7 ? 'text-amber-400' : 'text-blue-400')
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {groomer.name}</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{groomer.description || `${groomer.name} is a professional dog groomer located in ${locationName || 'London'}.`}</p>
              </div>
            </div>
            
            {/* Services Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Services</h2>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service: Service, index: number) => (
                    <div key={service.id || index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                      <h3 className="font-medium text-gray-800">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                      {(service.price_from || service.price_to) && (
                        <p className="mt-2 text-blue-600 font-medium">
                          {service.price_from && service.price_to ? 
                            `£${service.price_from} - £${service.price_to}` : 
                            `£${service.price_from || service.price_to}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-700">
                    Please contact {groomer.name} directly for a complete list of services and pricing.
                  </p>
                </div>
              )}
            </div>
            
            {/* FAQ Section */}
            <GroomerFAQ services={services} />
          </div>
          
          {/* Right Column - Contact Info & Map */}
          <div className="lg:col-span-1">
            <GroomerSidebar
              businessName={groomer.name}
              address={groomer.address || ''}
              latitude={groomer.latitude || 51.5074}
              longitude={groomer.longitude || -0.1278}
              placeId={groomer.place_id}
              phone={groomer.phone}
              website={groomer.website}
              email={groomer.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}