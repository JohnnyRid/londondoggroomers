import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { generateGroomerUrl, buildCanonicalUrl, generateLocationUrl } from '@/lib/urlUtils';
import BusinessImage from '@/app/components/BusinessImage';
import GroomerContactForm from '@/app/components/GroomerContactForm';
import FAQAccordion from '@/app/components/FAQAccordion';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Business, Service, BusinessJsonLd } from './types';

// Type definitions for Next.js page props
interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface PageProps {
  params: { slug: string };
  searchParams?: SearchParams;
}

// For Next.js internal use
export type GenerateMetadataProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

/**
 * Mock data for development/debugging purposes when the database connection fails
 */
const MOCK_BUSINESS: Business = {
  id: 1,
  name: "Sample Dog Groomer",
  description: "This is a sample groomer for development purposes. You're seeing this because there was an issue connecting to the database.",
  location_id: 1,
  image_url: "/images/default-business.jpg",
  rating: 4.5,
  review_count: 25,
  phone: "0123456789",
  website: "https://example.com",
  email: "contact@example.com",
  slug: "sample-dog-groomer",
  services: [
    {
      id: "1",
      name: "Full Groom",
      description: "Complete grooming service",
      price_from: 35,
      price_to: 65,
      duration_minutes: 90
    },
    {
      id: "2",
      name: "Bath and Brush",
      description: "Wash and brush only",
      price_from: 25,
      duration_minutes: 45
    }
  ],
  locations: {
    name: "London"
  }
};

/**
 * Check if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Fetch a business by its URL slug with enhanced error handling and fallbacks
 */
async function getBusiness(slug: string): Promise<Business | null> {
  try {
    console.log('🔍 Getting business for slug:', slug);
    
    // Verify Supabase connection and configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration');
      if (isDevelopment) return { ...MOCK_BUSINESS, slug };
      return null;
    }
    
    // First try - query directly by slug
    console.log('🔄 Attempting query by slug:', slug);
    const { data: slugData, error: slugError } = await supabase
      .from('businesses')
      .select(`
        *,
        locations(name)
      `)
      .eq('slug', slug)
      .maybeSingle();
      
    // If direct slug query fails, try with debugging
    if (slugError) {
      console.error('❌ Slug query error:', slugError);
      if (isDevelopment) return { ...MOCK_BUSINESS, slug };
      return null;
    }
    
    // If no error, but no data found
    if (!slugData) {
      console.log('⚠️ No business found with slug:', slug);
      if (isDevelopment) return { ...MOCK_BUSINESS, slug };
      return null;
    }
    
    // Found business by slug, enrich with related data
    console.log('✅ Found business by slug:', { 
      id: slugData.id, 
      name: slugData.name 
    });

    // Process services before enriching
    const processedData = { ...slugData };
    
    // Don't process services here, let enrichBusinessData handle it
    return await enrichBusinessData(processedData);
  } catch (error) {
    console.error('❌ Unexpected error in getBusiness:', error);
    if (isDevelopment) return { ...MOCK_BUSINESS, slug };
    return null;
  }
}

/**
 * Helper function to enrich basic business data with services and location
 */
async function enrichBusinessData(businessData: any): Promise<Business> {
  // Create base business object
  const business: Business = {
    ...businessData,
    services: [],  // Initialize empty array
    locations: undefined
  };
  
  // Handle missing slug if needed
  if (!business.slug) {
    business.slug = generateSlugFromName(business.name);
  }

  try {
    console.log('🔍 Processing services for business:', business.name);

    // Initialize services as empty array if undefined
    business.services = business.services || [];
    
    // Process services data
    if (businessData.services) {
      if (typeof businessData.services === 'string') {
        try {
          // Try to parse as JSON
          const parsedServices = JSON.parse(businessData.services);
          if (Array.isArray(parsedServices)) {
            // Handle array of strings or objects
            business.services = parsedServices.map((service: any, index: number) => {
              if (typeof service === 'string') {
                return {
                  id: `service-${index}`,
                  name: service.trim(),
                  business_id: business.id
                };
              }
              return {
                id: service.id || `service-${index}`,
                name: typeof service === 'string' ? service : service.name || service,
                description: service.description || '',
                price_from: service.price_from || service.price || null,
                price_to: service.price_to || null,
                duration_minutes: service.duration_minutes || null,
                business_id: business.id
              };
            });
            console.log('Processed JSON array services:', business.services);
          } else if (typeof parsedServices === 'string') {
            // Single service as string
            business.services = [{
              id: 'service-1',
              name: parsedServices.trim(),
              business_id: business.id
            }];
            console.log('Processed single JSON string service:', business.services);
          }
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
          console.log("JSON parse failed, trying alternate parsing");
          
          // Split by commas if it contains commas
          if (businessData.services.includes(',')) {
            business.services = businessData.services.split(',').map((service: string, index: number) => ({
              id: `service-${index}`,
              name: service.trim(),
              business_id: business.id
            }));
            console.log('Processed comma-separated services:', business.services);
          } else {
            // Single string service
            business.services = [{
              id: 'service-1',
              name: businessData.services.trim(),
              business_id: business.id
            }];
            console.log('Processed single string service:', business.services);
          }
        }
      } else if (Array.isArray(businessData.services)) {
        // Services is already an array
        business.services = businessData.services.map((service: any, index: number) => ({
          id: service.id || `service-${index}`,
          name: typeof service === 'string' ? service : service.name || service,
          description: service.description || '',
          price_from: service.price_from || service.price || null,
          price_to: service.price_to || null,
          duration_minutes: service.duration_minutes || null,
          business_id: business.id
        }));
        console.log('Processed existing array services:', business.services ?? []);
      }
    }
    
    // Fetch location if we have location_id
    if (business.location_id) {
      const { data: locationData } = await supabase
        .from('locations')
        .select('name')
        .eq('id', business.location_id)
        .maybeSingle();
        
      if (locationData) {
        business.locations = locationData;
      }
    }

    console.log('Final enriched business data:', {
      id: business.id,
      name: business.name,
      serviceCount: business.services?.length ?? 0,
      hasLocation: !!business.locations,
      services: business.services ?? []
    });
  } catch (enrichError) {
    console.error('❌ Error enriching business data:', enrichError);
    // Continue with what we have
  }
  
  return business;
}

/**
 * Helper function to generate a slug from a business name
 */
function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    // First replace & with 'and'
    .replace(/&/g, 'and')
    // Then replace any non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/(^-|-$)/g, '');
}

/**
 * Helper function to calculate Levenshtein distance between strings
 * Used for fuzzy matching of slugs
 */
function _levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Helper to fetch related business data (services, location)
 */
async function _fetchRelatedData(business: Business, businessId: string): Promise<void> {
  // Attempt to fetch services (as a separate operation)
  try {
    console.log('🔄 Fetching services for business ID:', businessId);
    
    const servicesQuery = await supabase
      .from('business_services')
      .select('id, name, description, price_from, price_to, duration_minutes')
      .eq('business_id', businessId);
      
    if (servicesQuery.error) {
      console.error('❌ Error fetching services:', servicesQuery.error);
    } else if (servicesQuery.data) {
      business.services = servicesQuery.data;
    }
  } catch (servicesError) {
    console.error('❌ Exception in services query:', servicesError);
  }
  
  // If there's a location ID, get the location name
  if (business.location_id) {
    try {
      console.log('🔄 Fetching location for location ID:', business.location_id);
      const locationQuery = await supabase
        .from('locations')
        .select('name')
        .eq('id', business.location_id)
        .limit(1);
        
      if (locationQuery.error) {
        console.error('❌ Error fetching location:', locationQuery.error);
      } else if (locationQuery.data?.[0]) {
        business.locations = locationQuery.data[0];
      }
    } catch (locationError) {
      console.error('❌ Exception in location query:', locationError);
    }
  }
  
  console.log('✅ Complete business data assembled:', {
    id: business.id,
    name: business.name,
    serviceCount: business.services?.length ?? 0,
    hasLocation: !!business.locations
  });
}

/**
 * Fetch a location name by its ID - simplified to avoid errors
 */
async function _getLocationName(locationId?: number): Promise<string | null> {
  if (!locationId) {
    return null;
  }
  
  try {
    console.log('🔄 Fetching location name for ID:', locationId);
    const locationQuery = await supabase
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .limit(1);
    
    if (locationQuery.error) {
      console.error('❌ Error fetching location name:', locationQuery.error);
      return null;
    }
    
    return locationQuery.data?.[0]?.name || null;
  } catch (error) {
    console.error('❌ Exception in getLocationName:', error);
    return null;
  }
}

/**
 * Generate FAQs for a groomer
 */
function generateGroomerFAQs(groomer: Business, locationName: string | null): { question: string; answer: string }[] {
  let serviceNames: string[] = [];
  if (typeof groomer.services === 'string') {
    try {
      const parsed = JSON.parse(groomer.services);
      if (Array.isArray(parsed)) {
        serviceNames = parsed.map((s: any) => s.name || '');
      } else {
        serviceNames = groomer.services.split(',').map((s: string) => s.trim());
      }
    } catch {
      serviceNames = groomer.services.split(',').map((s: string) => s.trim());
    }
  } else if (Array.isArray(groomer.services)) {
    serviceNames = groomer.services.map(s => s.name);
  }

  return [
    {
      question: `What services does ${groomer.name} offer?`,
      answer: serviceNames.length > 0
        ? `${groomer.name} offers ${serviceNames.join(', ')} for dogs in ${locationName || 'London'}.`
        : `${groomer.name} offers professional dog grooming services in ${locationName || 'London'}. Please contact them directly for service details.`
    },
    {
      question: `How can I book an appointment with ${groomer.name}?`,
      answer: `You can book an appointment with ${groomer.name} by ${
        groomer.phone ? `calling them at ${groomer.phone}` : ''
      }${
        groomer.phone && groomer.email ? ' or ' : ''
      }${
        groomer.email ? `sending an email to ${groomer.email}` : ''
      }${
        (groomer.phone || groomer.email) && groomer.website ? ', or ' : ''
      }${
        groomer.website ? `visiting their website at ${groomer.website}` : ''
      }${
        !groomer.phone && !groomer.email && !groomer.website ? 'using the contact form on this page' : ''
      }.`
    },
    {
      question: `Where is ${groomer.name} located?`,
      answer: `${groomer.name} is located in ${locationName || 'London'}. Please contact them directly for their exact address and directions.`
    }
  ];
}

/**
 * First determine if this is a location page or a groomer profile
 */
async function getPageType(slug: string): Promise<{ type: 'location' | 'groomer' | null; data: any }> {
  try {
    // First check if it's a location
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .maybeSingle();
    
    if (!locationError && locationData) {
      return { type: 'location', data: locationData };
    }

    // If not a location, try to find a groomer
    const { data: groomerData, error: groomerError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!groomerError && groomerData) {
      return { type: 'groomer', data: groomerData };
    }

    // If no exact match, try a fuzzy match for locations
    const { data: fuzzyLocationData, error: fuzzyLocationError } = await supabase
      .from('locations')
      .select('*')
      .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
      .maybeSingle();

    if (!fuzzyLocationError && fuzzyLocationData) {
      return { type: 'location', data: fuzzyLocationData };
    }

    return { type: null, data: null };
  } catch (error) {
    console.error('Error determining page type:', error);
    return { type: null, data: null };
  }
}

/**
 * Fetch groomers for a specific location
 */
async function getGroomersByLocation(locationId: number): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .eq('location_id', locationId);
    
    if (error) throw error;
    
    return data?.map(business => ({
      ...business,
      locationName: business.locations?.name || "London",
      slug: business.slug || business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })) || [];
  } catch (error) {
    console.error('Error fetching groomers by location:', error);
    return [];
  }
}

/**
 * Get featured groomer for a location
 */
async function getFeaturedGroomerForLocation(locationId: number): Promise<Business | null> {
  try {
    const { data: featuredData, error: featuredError } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .eq('location_id', locationId)
      .eq('featured', true)
      .limit(1)
      .maybeSingle();

    if (!featuredError && featuredData) {
      return {
        ...featuredData,
        locationName: featuredData.locations?.name || "London",
        slug: featuredData.slug || featuredData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
    }

    // If no featured groomer, get highest rated
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .eq('location_id', locationId)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      return {
        ...data,
        locationName: data.locations?.name || "London",
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting featured groomer:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { type, data } = await getPageType(params.slug);

  if (!type || !data) {
    return {
      title: 'Not Found',
      description: 'The requested page could not be found.'
    };
  }

  if (type === 'location') {
    return {
      title: `Dog Groomers in ${data.name} | London Dog Groomers`,
      description: `Find the best professional dog groomers in ${data.name}. Compare services, read reviews, and book appointments for dog grooming in ${data.name}.`,
      alternates: {
        canonical: buildCanonicalUrl(generateLocationUrl(data.name))
      }
    };
  } else {
    const locationName = data.locations?.name || 'London';
    return {
      title: `${data.name} - Dog Groomer in ${locationName}`,
      description: data.description || `Professional dog grooming services by ${data.name} in ${locationName}. Book your appointment today!`,
      alternates: {
        canonical: buildCanonicalUrl(generateGroomerUrl(data.slug))
      }
    };
  }
}

export default async function DynamicPage({
  params,
  searchParams: _searchParams // Prefix with underscore to indicate intentionally unused
}: PageProps): Promise<ReactNode> {
  const { type, data } = await getPageType(params.slug);
  
  if (!type || !data) {
    notFound();
    return null;
  }

  if (type === 'location') {
    // Get groomers for this location
    const groomers = await getGroomersByLocation(data.id);
    const featuredGroomer = await getFeaturedGroomerForLocation(data.id);

    // Check if URL matches canonical form
    const canonicalSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (params.slug !== canonicalSlug) {
      redirect(generateLocationUrl(data.name));
    }

    // Remove featured groomer from main list
    const filteredGroomers = featuredGroomer 
      ? groomers.filter(groomer => groomer.id !== featuredGroomer.id)
      : groomers;

    return (
      <div className="min-h-screen py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/groomers" className="hover:text-blue-600">Groomers</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-800">{data.name}</span>
            </div>
          </div>

          {/* Page Header */}
          <h1 className="text-3xl font-bold mb-2">
            Dog Groomers in {data.name}
          </h1>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div>
              <p className="mb-4">
                Looking for professional dog grooming services in {data.name}? We've compiled a list of the best dog groomers in {data.name} to help keep your furry friend looking and feeling their best.
              </p>
              <p>
                Browse through our selection of {groomers.length} {groomers.length === 1 ? 'groomer' : 'groomers'} in {data.name}, compare services, read reviews, and find the perfect match for your dog's grooming needs.
              </p>
            </div>
          </div>

          {/* Featured Groomer Section */}
          {featuredGroomer && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">Featured Groomer in {data.name}</h2>
                <Link 
                  href="/contact?subject=Featured%20Listing%20Inquiry" 
                  className="text-sm text-blue-700 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Want to be featured here?
                </Link>
              </div>
              <div className="bg-blue-50 rounded-lg shadow-md overflow-hidden border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-full md:h-64">
                    <BusinessImage 
                      imageUrl={featuredGroomer.image_url} 
                      businessName={featuredGroomer.name} 
                      height="h-64"
                    />
                  </div>
                  <div className="p-5 col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl mb-2">{featuredGroomer.name}</h3>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Featured</span>
                    </div>
                    
                    {featuredGroomer.rating && (
                      <div className="flex items-center mb-3">
                        <span className="text-yellow-500 mr-1" suppressHydrationWarning>
                          {"★".repeat(Math.floor(featuredGroomer.rating))}
                          {"☆".repeat(5 - Math.floor(featuredGroomer.rating))}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({featuredGroomer.review_count || 0} reviews)
                        </span>
                      </div>
                    )}
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {featuredGroomer.description || "Top-rated dog groomer in this area."}
                    </p>
                    
                    <Link 
                      href={generateGroomerUrl(featuredGroomer.slug)}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Groomers List */}
          {filteredGroomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGroomers.map((groomer) => (
                <div key={groomer.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
                  <BusinessImage imageUrl={groomer.image_url} businessName={groomer.name} />
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">{groomer.name}</h3>
                      {groomer.rating && (
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500 mr-1" suppressHydrationWarning>
                            {"★".repeat(Math.floor(groomer.rating))}
                            {"☆".repeat(5 - Math.floor(groomer.rating))}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({groomer.review_count || 0} reviews)
                          </span>
                        </div>
                      )}
                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {groomer.description || "No description available."}
                      </p>
                    </div>
                    <Link 
                      href={generateGroomerUrl(groomer.slug)}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors mt-4"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">No Groomers Found</h2>
              <p className="text-yellow-700">
                We couldn't find any dog groomers in {data.name} at the moment. Please check back soon as we're constantly updating our database.
              </p>
              <Link 
                href="/groomers" 
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                View All Groomers
              </Link>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-100 text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">
              Are you a dog groomer in {data.name}?
            </h2>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
              List your grooming business on our platform to reach more pet owners in {data.name} and grow your client base.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg transition-colors"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    // This is a groomer profile - use existing groomer profile rendering
    const _groomer = data;
    try {
      // Safely get slug from params
      const slug = String(params.slug);
      console.log('🔍 Rendering groomer page for slug:', slug);
  
      const groomer = await getBusiness(slug);
      
      if (!groomer) {
        console.log('❌ No groomer found, calling notFound() for slug:', slug);
        notFound();
        return null; // TypeScript needs this though it won't be reached
      }
      
      console.log('✅ Found groomer:', {
        id: groomer.id,
        name: groomer.name,
        slug: groomer.slug
      });
      
      const locationName = groomer.locations?.name || 'London';
  
      // Check if the current URL matches the canonical URL
      const currentPath = generateGroomerUrl(groomer.slug);
      const requestedPath = `/groomers/${slug}`;
      
      // Log URL comparison for debugging
      console.log('🔍 URL comparison:', {
        current: currentPath,
        requested: requestedPath,
        match: currentPath === requestedPath
      });
  
      // Enable redirect for incorrect slugs
      if (currentPath !== requestedPath) {
        console.log('⚠️ URL mismatch detected, redirecting to canonical URL');
        redirect(currentPath);
      }
  
      const faqs = generateGroomerFAQs(groomer, locationName);
  
      // Generate breadcrumb JSON-LD
      const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': process.env.NEXT_PUBLIC_SITE_URL
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Dog Groomers',
            'item': `${process.env.NEXT_PUBLIC_SITE_URL}/groomers`
          },
          ...(locationName ? [{
            '@type': 'ListItem',
            'position': 3,
            'name': `${locationName} Dog Groomers`,
            'item': `${process.env.NEXT_PUBLIC_SITE_URL}/groomers?location_id=${groomer.location_id}`
          }] : []),
          {
            '@type': 'ListItem',
            'position': locationName ? 4 : 3,
            'name': groomer.name,
            'item': buildCanonicalUrl(currentPath)
          }
        ]
      };
  
      // Generate business JSON-LD
      const businessJsonLd: BusinessJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': buildCanonicalUrl(currentPath),
        name: groomer.name,
        description: groomer.description,
        image: groomer.image_url || `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-business.jpg`,
        telephone: groomer.phone,
        url: groomer.website,
        email: groomer.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: locationName || 'London',
          addressCountry: 'GB'
        },
        priceRange: '££'
      };
  
      if (groomer.rating && groomer.review_count) {
        businessJsonLd.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: groomer.rating,
          reviewCount: groomer.review_count,
          bestRating: 5,
          worstRating: 1
        };
      }
  
      if (groomer.services && groomer.services.length > 0) {
        businessJsonLd.hasOfferCatalog = {
          '@type': 'OfferCatalog',
          name: 'Dog Grooming Services',
          itemListElement: Array.isArray(groomer.services) ? groomer.services.map((service: Service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name,
              description: service.description,
            },
            price: service.price_from ?? undefined,  // Convert null to undefined
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          })) : []
        };
      }

      // Generate FAQ Schema
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      };

      return (
        <>
          <Script
            id="breadcrumb-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
          />
          <Script
            id="business-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
          />
          <Script
            id="faq-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
          <div className="min-h-screen py-12 px-4 sm:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumbs */}
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Link href="/" className="hover:text-blue-600">Home</Link>
                  <span className="mx-2">›</span>
                  <Link href="/groomers" className="hover:text-blue-600">Groomers</Link>
                  {locationName && (
                    <>
                      <span className="mx-2">›</span>
                      <Link 
                        href={generateLocationUrl(locationName)}
                        className="hover:text-blue-600"
                      >
                        {locationName}
                      </Link>
                    </>
                  )}
                  <span className="mx-2">›</span>
                  <span className="text-gray-800">{groomer.name}</span>
                </div>
              </div>
              
              {/* Main content */}
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <BusinessImage 
                  imageUrl={groomer.image_url} 
                  businessName={groomer.name} 
                  height="h-64 md:h-80"
                  sizes="(max-width: 768px) 100vw, 1024px"
                  priority={true}
                />
                
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h1 className="text-3xl font-bold mb-2">{groomer.name}</h1>
                      <p className="text-gray-600 mb-2">{locationName || "London"}</p>
                      
                      {groomer.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">
                            {"★".repeat(Math.round(groomer.rating))}
                            {"☆".repeat(5 - Math.round(groomer.rating))}
                          </span>
                          <span className="text-gray-600">
                            ({groomer.review_count || 0} reviews)
                          </span>
                        </div>
                      )}
  
                      {/* Contact buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {groomer.phone && (
                          <a 
                            href={`tel:${groomer.phone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.210l-2.257 1.130a11.042 11.042 0 005.516 5.516l1.130-2.257a1 1 0 011.210-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                        )}
                        
                        {groomer.website && (
                          <a 
                            href={groomer.website.startsWith('http') ? groomer.website : `https://${groomer.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9" />
                            </svg>
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <a 
                        href="#contact" 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-2 rounded-md transition-colors"
                      >
                        Contact
                      </a>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Contact directly to book appointments
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{groomer.description || "No description available."}</p>
                  </div>
                  
                  {/* Services Section */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Services</h2>
                    {groomer.services && (Array.isArray(groomer.services) && groomer.services.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(groomer.services) && groomer.services.map((service: Service) => (
                          <div key={service.id || service.name} className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{service.name}</h3>
                              <span className="text-gray-700">
                                {service.price_from && service.price_to
                                  ? `£${service.price_from} - £${service.price_to}`
                                  : service.price_from
                                  ? `£${service.price_from}`
                                  : 'Price on request'}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                            )}
                            {service.duration_minutes && (
                              <p className="text-gray-500 mt-1 text-xs">Duration: approx. {service.duration_minutes} minutes</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600">No services listed yet. Please contact the groomer directly for pricing and service information.</p>
                      </div>
                    )}
                  </div>
  
                  {/* FAQ Section */}
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <FAQAccordion faqs={faqs} />
                    </div>
                  </div>
  
                  {/* Contact Form Section */}
                  <div className="mt-12" id="contact">
                    <GroomerContactForm 
                      groomerName={groomer.name}
                      groomerEmail={groomer.email}
                      groomerPhone={groomer.phone}
                      groomerWebsite={groomer.website}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    } catch (error) {
      console.error('❌ Error in GroomerPage:', error);
      throw error; // Let Next.js error boundary handle it
    }
  }
}
