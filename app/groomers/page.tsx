import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BusinessImage from '@/app/components/BusinessImage';
import { generateGroomerUrl, generateLocationUrl, generateSpecializationUrl, generateSlug } from '@/lib/urlUtils';
import GroomerFilters from '@/app/components/GroomerFilters';

// Type definitions
interface Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  phone?: string;
  email?: string;
  website?: string;
  slug?: string;
  services?: any;
  locations?: { name: string };
  locationName?: string;
}

interface PageProps {
  params: Record<string, never>;
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getLocationNameById(locationId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('name')
      .eq('id', locationId)
      .maybeSingle();
      
    if (error) throw error;
    return data?.name || null;
  } catch (error) {
    console.error('Error fetching location name:', error);
    return null;
  }
}

async function getSpecializationBySlug(slug: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('specializations')
      .select('id')
      .ilike('name', slug.replace(/-/g, ' '))
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching specialization by slug:', error);
      return null;
    }
    
    return data?.id?.toString() || null;
  } catch (error) {
    console.error('Error in getSpecializationBySlug:', error);
    return null;
  }
}

async function getSpecializationNameById(id: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('specializations')
      .select('name')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    return data?.name || null;
  } catch (error) {
    console.error('Error fetching specialization name:', error);
    return null;
  }
}

async function getFeaturedGroomerForLocation(locationId: string) {
  try {
    // First check if there's a manually featured groomer for this location
    const { data: featuredData, error: featuredError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        description,
        location_id,
        image_url,
        rating,
        review_count,
        phone,
        website,
        email,
        featured,
        slug,
        locations:locations(name)
      `)
      .eq('location_id', locationId)
      .eq('featured', true)
      .limit(1)
      .maybeSingle();
    
    if (featuredError) {
      console.error('Featured groomer query error:', featuredError);
      return null;
    }
    
    // If there's a manually featured groomer, return it
    if (featuredData) {
      // Generate a slug if it doesn't exist
      if (!featuredData.slug) {
        featuredData.slug = featuredData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      // Handle locations array
      const locationName = Array.isArray(featuredData.locations) && featuredData.locations.length > 0 
        ? featuredData.locations[0].name 
        : "London";

      return {
        ...featuredData,
        locationName
      };
    }
    
    // Otherwise, find high-rated groomers with many reviews
    // Count how many eligible businesses we have
    const { count, error: countError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId)
      .gte('rating', 4.5)
      .gte('review_count', 15);
    
    if (countError) {
      console.error('Count query error:', countError);
      return null;
    }
    
    // If we have eligible businesses, select one randomly
    if (count && count > 0) {
      // Generate random offset for selection
      const randomOffset = Math.floor(Math.random() * count);
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          location_id,
          image_url,
          rating,
          review_count,
          phone,
          website,
          email,
          featured,
          slug,
          locations:locations(name)
        `)
        .eq('location_id', locationId)
        .gte('rating', 4.5)
        .gte('review_count', 15)
        .limit(1)
        .range(randomOffset, randomOffset);
      
      if (error) {
        console.error('Random featured groomer query error:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const businessData = data[0];
        
        // Generate a slug if it doesn't exist
        if (!businessData.slug) {
          businessData.slug = businessData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        
        // Handle locations array
        const locationName = Array.isArray(businessData.locations) && businessData.locations.length > 0 
          ? businessData.locations[0].name 
          : "London";

        return {
          ...businessData,
          locationName
        };
      }
    }
    
    // If we still don't have a featured business, fall back to any highly rated one
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        description,
        location_id,
        image_url,
        rating,
        review_count,
        phone,
        website,
        email,
        featured,
        slug,
        locations:locations(name)
      `)
      .eq('location_id', locationId)
      .gte('rating', 4.0)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (fallbackError) {
      console.error('Fallback featured groomer query error:', fallbackError);
      return null;
    }
    
    if (fallbackData) {
      // Generate a slug if it doesn't exist
      if (!fallbackData.slug) {
        fallbackData.slug = fallbackData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      
      // Handle locations array
      const locationName = Array.isArray(fallbackData.locations) && fallbackData.locations.length > 0 
        ? fallbackData.locations[0].name 
        : "London";

      return {
        ...fallbackData,
        locationName
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching featured groomer:', error);
    return null;
  }
}

async function getGroomers(locationId?: string | null, specialization?: string | null, excludeId?: number, sort?: string, search?: string) {
  try {
    // Start the query with a join to the locations table
    let query = supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `);
    
    // Add location filter if provided
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    
    // Exclude a specific groomer ID (used to avoid duplicating the featured groomer)
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    // Add search filter if provided - search both name and description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Add sorting based on the sort parameter
    switch (sort) {
      case 'reviews':
        query = query.order('review_count', { ascending: false }).order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name');
        break;
      default: // 'rating' is default
        query = query.order('rating', { ascending: false }).order('review_count', { ascending: false });
    }
    
    // Execute the query
    let { data, error } = await query;
    
    if (error) throw error;
    
    // Filter by specialization if provided
    if (specialization && data) {
      // Get businesses that offer this specialization
      const { data: specializedBusinesses, error: specError } = await supabase
        .from('business_service_offerings')
        .select('business_id')
        .eq('specialization_id', specialization);
      
      if (specError) {
        console.error('Error fetching specialized businesses:', specError);
      } else if (specializedBusinesses) {
        // Create a set of business IDs that offer this specialization
        const specializedBusinessIds = new Set(
          specializedBusinesses.map(item => item.business_id)
        );
        
        // Filter the businesses to only include those that offer the specialization
        data = data.filter(business => specializedBusinessIds.has(business.id));
      }
    }
    
    // Process the returned data to extract location name
    const processedData = data?.map(business => ({
      ...business,
      locationName: business.locations?.name || 'London'
    })) || [];
    
    return processedData;
  } catch (error) {
    console.error('Error fetching groomers:', error);
    return [];
  }
}

async function getAllLocations() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

async function getAllSpecializations() {
  try {
    const { data, error } = await supabase
      .from('specializations')
      .select('id, name')
      .order('name');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return [];
  }
}

export default async function GroomersPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const locationSlug = typeof searchParams?.location === 'string' ? searchParams.location : undefined;
  const specializationSlug = typeof searchParams?.specialization === 'string' ? searchParams.specialization : undefined;
  const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : 'rating';
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  
  // Get all locations and specializations for the filter dropdowns
  const allLocations = await getAllLocations();
  const allSpecializations = await getAllSpecializations();

  // Get groomers based on filters
  let groomers: Business[] = [];
  let title = "Dog Groomers in London";
  let description = "Find professional dog grooming services across London. Compare groomers, read reviews, and book appointments for your furry friend.";
  
  // Find location and specialization by matching their slugs
  console.log("Looking for location with slug:", locationSlug);
  
  // Debug all location slugs
  if (locationSlug) {
    console.log("Available locations and their slugs:");
    allLocations.forEach(loc => {
      const slug = generateSlug(loc.name);
      console.log(`- ${loc.name} (ID: ${loc.id}) -> slug: '${slug}', match: ${slug === locationSlug}`);
    });
  }
  
  // Robust location finding with additional logging
  let location = null;
  if (locationSlug) {
    // Case-insensitive direct slug comparison
    location = allLocations.find(
      loc => generateSlug(loc.name).toLowerCase() === locationSlug.toLowerCase()
    );
    
    if (!location) {
      console.error(`No location found matching slug '${locationSlug}'`);
    } else {
      console.log(`Found location: ${location.name} (ID: ${location.id})`);
    }
  }

  // Similar process for specialization
  const specialization = specializationSlug 
    ? allSpecializations.find(spec => generateSlug(spec.name).toLowerCase() === specializationSlug.toLowerCase())
    : null;

  // Determine the correct title and description based on filters
  if (location && specialization) {
    // Both location and specialization filters
    console.log(`Filtering by location ID '${location.id}' and specialization ID '${specialization.id}'`);
    const featuredGroomer = await getFeaturedGroomerForLocation(location.id.toString());
    groomers = await getGroomers(location.id.toString(), specialization.id.toString(), featuredGroomer?.id, sort, search);
    
    title = `${specialization.name} Dog Grooming in ${location.name}`;
    description = `Find dog groomers offering ${specialization.name} services in ${location.name}. Expert groomers specializing in ${specialization.name.toLowerCase()} for your pet's needs.`;
  } else if (location) {
    // Location filter only
    console.log(`Filtering by location ID '${location.id}' only`);
    const featuredGroomer = await getFeaturedGroomerForLocation(location.id.toString());
    groomers = await getGroomers(location.id.toString(), undefined, featuredGroomer?.id, sort, search);
    
    title = `Dog Groomers in ${location.name}`;
    description = `Find the best professional dog groomers in ${location.name}. Compare services, read reviews, and book appointments for dog grooming in ${location.name}.`;
  } else if (specialization) {
    // Specialization filter only
    console.log(`Filtering by specialization ID '${specialization.id}' only`);
    groomers = await getGroomers(undefined, specialization.id.toString(), undefined, sort, search);
    
    title = `${specialization.name} Dog Grooming Services in London`;
    description = `Find dog groomers offering ${specialization.name} services in London. Expert groomers specializing in ${specialization.name.toLowerCase()} for your pet's needs.`;
  } else {
    // No filters
    console.log('No filters applied');
    groomers = await getGroomers(undefined, undefined, undefined, sort, search);
  }
  
  console.log(`Found ${groomers.length} groomers matching criteria`);
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        
        {/* Filter controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
          <GroomerFilters locations={allLocations} specializations={allSpecializations} />
          
          {/* Quick links to popular locations and specializations */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">Popular Locations:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {allLocations.slice(0, 5).map(location => (
                  <Link 
                    key={location.id} 
                    href={generateLocationUrl(location.name)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full transition-colors"
                  >
                    {location.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Popular Services:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {allSpecializations.slice(0, 5).map(spec => (
                  <Link 
                    key={spec.id} 
                    href={generateSpecializationUrl(spec.name)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full transition-colors"
                  >
                    {spec.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content - List of groomers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="mb-6">
            <p className="text-gray-700">
              {description}
            </p>
          </div>
          
          {groomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groomers.map((groomer) => (
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
                        {groomer.description || "Professional dog grooming services."}
                      </p>
                    </div>
                    <Link 
                      href={generateGroomerUrl(groomer.slug || generateSlug(groomer.name))}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors mt-4"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <h3 className="font-medium text-blue-800 mb-2">Find Your Perfect Groomer</h3>
              <p className="text-blue-700">
                Please use the filter options above to find dog groomers in your area or that offer specific services.
              </p>
            </div>
          )}
        </div>
        
        {/* Call to Action */}
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-100 text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            Are you a dog groomer in London?
          </h2>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            List your grooming business on our platform to reach more pet owners and grow your client base.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg transition-colors"
          >
            Add Your Business
          </Link>
        </div>
      </div>
    </div>
  );
}
