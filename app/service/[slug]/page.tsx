import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateGroomerUrl, buildCanonicalUrl, generateSpecializationUrl } from '@/lib/urlUtils';
import BusinessImage from '@/app/components/BusinessImage';
import SpecializationIcon from '@/app/components/SpecializationIcon';

// Define proper page params type
type PageParams = {
  slug: string;
}

interface Business {
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

import { SpecializationIconType } from '@/lib/specializationUtils';

interface Specialization {
  id: number;
  name: string;
  description?: string;
  icon_type?: SpecializationIconType;
}

/**
 * Fetch a specialization by its slug
 */
async function getSpecializationBySlug(slug: string): Promise<Specialization | null> {
  try {
    console.log('Fetching specialization for slug:', slug);
    
    // First try an exact match
    const { data: specData, error: specError } = await supabase
      .from('specializations')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '))
      .maybeSingle();
    
    if (!specError && specData) {
      console.log('Found specialization by exact match:', specData.name);
      return specData;
    }
    
    // Try a fuzzy match
    const { data: fuzzySpecData, error: fuzzySpecError } = await supabase
      .from('specializations')
      .select('*')
      .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
      .maybeSingle();
    
    if (!fuzzySpecError && fuzzySpecData) {
      console.log('Found specialization by fuzzy match:', fuzzySpecData.name);
      return fuzzySpecData;
    }
    
    console.log('No specialization found for slug:', slug);
    return null;
  } catch (error) {
    console.error('Error fetching specialization:', error);
    return null;
  }
}

/**
 * Fetch groomers by specialization
 */
async function getGroomersBySpecialization(specializationId: number): Promise<Business[]> {
  try {
    // First get all business IDs that offer this specialization
    const { data: businessIds, error: idsError } = await supabase
      .from('business_service_offerings')
      .select('business_id')
      .eq('specialization_id', specializationId);
    
    if (idsError) throw idsError;
    
    if (!businessIds || businessIds.length === 0) {
      return [];
    }
    
    // Then fetch the business details for these IDs
    const ids = businessIds.map(item => item.business_id);
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .in('id', ids);
    
    if (error) throw error;
    
    return data?.map(business => ({
      ...business,
      locationName: business.locations?.name || "London",
      slug: business.slug || business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    })) || [];
  } catch (error) {
    console.error('Error fetching groomers by specialization:', error);
    return [];
  }
}

/**
 * Get featured groomer for this specialization
 */
async function getFeaturedGroomerBySpecialization(specializationId: number): Promise<Business | null> {
  try {
    // First get all business IDs that offer this specialization
    const { data: businessIds, error: idsError } = await supabase
      .from('business_service_offerings')
      .select('business_id')
      .eq('specialization_id', specializationId);
    
    if (idsError || !businessIds || businessIds.length === 0) {
      return null;
    }
    
    // Get the IDs as an array
    const ids = businessIds.map(item => item.business_id);
    
    // Then get the highest-rated business from those IDs
    const { data: topBusiness, error: businessError } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .in('id', ids)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (businessError || !topBusiness) {
      return null;
    }
    
    return {
      ...topBusiness,
      locationName: topBusiness.locations?.name || "London",
      slug: topBusiness.slug || topBusiness.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };
  } catch (error) {
    console.error('Error fetching featured groomer by specialization:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const slug = params.slug;
  const specialization = await getSpecializationBySlug(slug);
  
  if (!specialization) {
    return {
      title: 'Service Not Found',
      description: 'The requested service could not be found.'
    };
  }
  
  const canonicalUrl = buildCanonicalUrl(generateSpecializationUrl(specialization.name));
  
  return {
    title: `${specialization.name} Dog Grooming Services in London | Specialized Groomers`,
    description: specialization.description || 
      `Find dog groomers offering ${specialization.name} services in London. Expert groomers specializing in ${specialization.name.toLowerCase()} for your pet's needs.`,
    alternates: {
      canonical: canonicalUrl
    }
  };
}

export default async function ServicePage({
  params,
  _searchParams
}: {
  params: PageParams;
  _searchParams: { [key: string]: string | string[] | undefined };
}) {
  const slug = params.slug;
  console.log('Rendering service page for slug:', slug);
  
  const specialization = await getSpecializationBySlug(slug);
  
  if (!specialization) {
    console.log('Service not found for slug:', slug);
    notFound();
    return null;
  }
  
  // Check if the URL matches the canonical form
  const canonicalSlug = specialization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (slug !== canonicalSlug) {
    console.log('Redirecting to canonical URL');
    redirect(generateSpecializationUrl(specialization.name));
  }
  
  // Get groomers that offer this specialization
  const groomers = await getGroomersBySpecialization(specialization.id);
  
  // Get featured groomer
  const featuredGroomer = await getFeaturedGroomerBySpecialization(specialization.id);
  
  // Remove the featured groomer from the list to avoid duplication
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
            <Link href="/groomers" className="hover:text-blue-600">Services</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-800">{specialization.name}</span>
          </div>
        </div>
        
        {/* Page Header with Icon */}
        <div className="flex items-center mb-6">
          {specialization.icon_type && (
            <div className="mr-4">
              <SpecializationIcon 
                name={specialization.name}
                iconType={specialization.icon_type}
                size="large" 
                className="text-blue-600"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold">
            {specialization.name} Dog Grooming Services
          </h1>
        </div>
        
        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div>
            <p className="mb-4">
              {specialization.description || 
                `Looking for professional ${specialization.name.toLowerCase()} services for your dog? We've compiled a list of the best dog groomers in London that offer specialized ${specialization.name.toLowerCase()} services to help keep your furry friend looking and feeling their best.`
              }
            </p>
            <p>
              Browse through our selection of {groomers.length} {groomers.length === 1 ? 'groomer' : 'groomers'} offering {specialization.name} services, compare options, read reviews, and find the perfect match for your dog's grooming needs.
            </p>
          </div>
        </div>
        
        {/* Featured Groomer Section */}
        {featuredGroomer && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-800">Top {specialization.name} Specialist</h2>
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
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Top Specialist</span>
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
                  
                  {featuredGroomer.locationName && (
                    <p className="text-gray-600 mb-3">{featuredGroomer.locationName}</p>
                  )}
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {featuredGroomer.description || `Highly-rated groomer specializing in ${specialization.name.toLowerCase()} services.`}
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
                    {groomer.locationName && (
                      <p className="text-gray-600 mb-2">{groomer.locationName}</p>
                    )}
                    <p className="text-gray-700 line-clamp-2 mb-4">
                      {groomer.description || `Offering professional ${specialization.name.toLowerCase()} services for dogs.`}
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
              We couldn't find any dog groomers offering {specialization.name} services at the moment. Please check back soon as we're constantly updating our database.
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
            Do you offer {specialization.name} services for dogs?
          </h2>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            List your specialized grooming services on our platform to connect with pet owners looking for {specialization.name.toLowerCase()} services.
          </p>
          <Link 
            href={`/contact?subject=Business%20Listing%20Inquiry%20for%20${encodeURIComponent(specialization.name)}%20Services`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg transition-colors"
          >
            Add Your Business
          </Link>
        </div>
      </div>
    </div>
  );
}
