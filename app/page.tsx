import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { generateLocationUrl, generateSpecializationUrl, generateGroomerUrl, generateSlug } from "../lib/urlUtils";
import BusinessImage from "./components/BusinessImage";
import SpecializationIcon from "./components/SpecializationIcon";
import { generateFallbackDescription } from "../lib/specializationUtils";
import type { Metadata } from "next";

// Define metadata for the home page
export const metadata: Metadata = {
  title: "London Dog Groomers | Find Professional Dog Grooming Services Near You",
  description: "Connect with trusted dog groomers across London. Browse reviews, compare prices, and book appointments with professional pet grooming services for all dog breeds.",
  keywords: ["dog grooming London", "dog groomers near me", "professional dog grooming", "pet grooming services", "London pet care", "dog haircut", "mobile dog grooming", "dog spa London"],
  alternates: {
    canonical: 'https://london-dog-groomers.vercel.app/',
  },
  openGraph: {
    title: "London Dog Groomers | Find Professional Dog Grooming Services Near You",
    description: "Connect with trusted dog groomers across London. Browse reviews, compare prices, and book appointments with professional pet grooming services for all dog breeds.",
    url: 'https://london-dog-groomers.vercel.app/',
    siteName: 'London Dog Groomers',
    images: [
      {
        url: '/images/dog-grooming.jpg',
        width: 1200,
        height: 630,
        alt: 'Professional dog grooming services in London',
      }
    ],
  },
};

// Define interfaces for type safety
interface Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  created_at?: string;
  locationName?: string;
  email?: string;
  featured?: boolean;
  slug: string;
}

interface Location {
  id: number;
  name: string;
}

interface Service {
  id: string | number;
  business_id: number;
  name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
  duration_minutes?: number;
}

type _SpecializationIconType = 'brush' | 'paw' | 'scissors' | 'van' | 'heart' | 'star' | string;

// Function to fetch specialized services with their associated businesses
async function getSpecializationsWithBusinesses() {
  try {
    console.log('Fetching specializations with businesses...');
    
    // Fetch all specializations
    const { data: specializations, error } = await supabase
      .from('specializations')
      .select(`
        id, 
        name,
        description,
        icon_type
      `)
      .order('name');
      
    if (error) {
      console.error('Error fetching specializations:', error);
      return getSampleSpecializations();
    }

    // Process each specialization to create a result structure
    const processedSpecializations = specializations.map(spec => {
      return {
        ...spec,
        businesses: [] // Initialize with empty array of businesses
      };
    });
    
    console.log(`Returning ${processedSpecializations.length} specializations`);
    return processedSpecializations;
  } catch (error) {
    console.error('Error in getSpecializationsWithBusinesses:', error);
    return getSampleSpecializations();
  }
}

// Function to return sample specialization data when the real data is not available
function getSampleSpecializations() {
  console.log('Returning sample specialization data');
  
  // Create sample data with common dog grooming specializations
  return [
    {
      id: 1,
      name: "Puppy Grooming",
      description: "Gentle grooming services specially designed for puppies and young dogs.",
      businesses: [],
      icon_type: "paw"
    },
    {
      id: 2,
      name: "Breed-Specific Styling",
      description: "Specialized grooming techniques tailored to the specific needs of different dog breeds.",
      businesses: [],
      icon_type: "scissors"
    },
    {
      id: 3,
      name: "Medical Grooming",
      description: "Special care for dogs with medical conditions, skin problems, or allergies.",
      businesses: [],
      icon_type: "heart"
    },
    {
      id: 4, 
      name: "Mobile Grooming",
      description: "Convenient grooming services brought directly to your doorstep.",
      businesses: [],
      icon_type: "van"
    },
    {
      id: 5,
      name: "Show Dog Styling",
      description: "Professional grooming for show dogs following breed-specific standards.",
      businesses: [],
      icon_type: "star"
    }
  ];
}

// Function to fetch featured groomers with their services
async function getFeaturedGroomers(): Promise<Business[]> {
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select(`
        *,
        locations:locations(name)
      `)
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(3);

    if (error) throw error;

    return businesses?.map(business => ({
      ...business,
      locationName: business.locations?.name || "London",
      slug: business.slug || generateSlug(business.name)
    })) || [];

  } catch (error) {
    console.error('Error fetching featured groomers:', error);
    return [];
  }
}

async function _getPopularLocations(): Promise<Location[]> {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('business_count', { ascending: false })
      .limit(6);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    return [];
  }
}

// Helper function to process business data
function _processBusinessData(businesses: Business[]): Business[] {
  return businesses.map(business => {
    // Extract location name from the joined locations data
    let locationName = "London";
    if (business.locations && business.locations.name) {
      locationName = business.locations.name;
    }

    // Process services based on their format
    let parsedServices: Service[] = [];
    
    if (business.services) {
      // Check if it's already an array
      if (Array.isArray(business.services)) {
        parsedServices = business.services;
      } 
      // If it's a string, try to parse as JSON
      else if (typeof business.services === 'string') {
        try {
          // Try to parse as JSON
          parsedServices = JSON.parse(business.services);
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
          console.log("JSON parse failed, trying alternate parsing");
          
          // Split by commas if it contains commas
          if (business.services.includes(',')) {
            const serviceNames = business.services.split(',').map((s: string) => s.trim());
            parsedServices = serviceNames.map((name: string, index: number) => ({
              id: `service-${index}`,
              name: name,
              business_id: business.id
            }));
          } 
          // Or convert single string to a single service
          else {
            parsedServices = [{
              id: 'service-1',
              name: business.services.trim(),
              business_id: business.id
            }];
          }
        }
      }
    }
    
    return {
      ...business,
      locationName,
      services: parsedServices
    };
  });
}

// Function to fetch locations with business counts
async function getLocationsWithCounts() {
  try {
    // First get all locations
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('*');
    
    if (locationsError) throw locationsError;
    
    if (!locations || locations.length === 0) {
      return [];
    }
    
    // Get all businesses with their location_id
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('location_id');
      
    if (businessError) throw businessError;
    
    // Count businesses per location manually
    const countMap: { [key: number]: number } = {};
    if (businesses && businesses.length > 0) {
      businesses.forEach(business => {
        if (business.location_id) {
          countMap[business.location_id] = (countMap[business.location_id] || 0) + 1;
        }
      });
    }
    
    // Add counts to locations
    return locations.map((location: Location) => ({
      ...location,
      business_count: countMap[location.id] || 0
    }));
  } catch (error) {
    console.error('Error fetching locations with counts:', error);
    return [];
  }
}

export default async function Home() {
  const featuredGroomers = await getFeaturedGroomers();
  const locations = await getLocationsWithCounts();
  const specializations = await getSpecializationsWithBusinesses(); // Updated to get specializations with businesses
  
  // Sort locations: first the 4 main regions, then the rest alphabetically
  const mainRegions = ["North London", "South London", "East London", "West London"];
  const sortedLocations = [...locations].sort((a, b) => {
    const aIndex = mainRegions.indexOf(a.name);
    const bIndex = mainRegions.indexOf(b.name);
    
    // If both are main regions, sort by predefined order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only a is a main region, it goes first
    if (aIndex !== -1) return -1;
    // If only b is a main region, it goes first
    if (bIndex !== -1) return 1;
    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name);
  });

  // Process specializations to ensure they all have descriptions
  const processedSpecializations = specializations.map(spec => ({
    ...spec,
    description: spec.description || generateFallbackDescription(spec.name)
  }));
  
  return (
    <div className="min-h-screen">
      {/* Header with Logo - Updated to use Black-London-Logo.svg */}
      <header className="bg-white py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/Black-London-Logo.svg" 
              alt="London Dog Groomers Logo" 
              width={200} 
              height={50}
              priority
            />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/groomers" className="text-gray-600 hover:text-blue-600">Find Groomers</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link>
          </nav>
          <Link href="/contact" className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Register Your Business
          </Link>
          <button className="md:hidden text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section - Enhanced with background */}
      <section className="relative py-20 px-4 sm:px-8">
        {/* Using a CSS placeholder until you add a real image */}
        <div className="absolute inset-0 hero-bg-placeholder opacity-30"></div>
        {/* Once you have an image, use this instead: */}
        {/* <div className="absolute inset-0 bg-[url('/images/dog-grooming-hero.jpg')] bg-cover bg-center opacity-20"></div> */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Find Top Dog Groomers in London
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with professional dog groomers near you. Read reviews, browse services, and book appointments online.
            </p>
          </div>
          
          {/* Enhanced Search Box with Location Filter */}
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
            <form action="/groomers" method="get" className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-grow">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input 
                    id="search"
                    name="search"
                    type="text" 
                    placeholder="Search by groomer name or service..." 
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:w-1/3">
                  <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select 
                    id="location_id"
                    name="location_id"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All London</option>
                    {sortedLocations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors text-center block"
              >
                Search Dog Groomers
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Locations Section - Updated with actual business counts */}
      <section className="py-16 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Browse by Area</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Find the perfect dog groomer in your London neighborhood
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedLocations.length > 0 ? (
              sortedLocations.map((location: Location) => (
                <Link 
                  key={location.id} 
                  href={generateLocationUrl(location.name)}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors text-center"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600">
                    {!location.business_count || location.business_count === 0 && "No groomers yet"}
                    {location.business_count === 1 && "1 groomer"}
                    {location.business_count && location.business_count > 1 && `${location.business_count} groomers`}
                  </p>
                </Link>
              ))
            ) : (
              // Display placeholders if no locations found
              ["North London", "South London", "East London", "West London"].map((name) => (
                <Link 
                  key={name} 
                  href="/groomers"
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-colors text-center"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{name}</h3>
                  <p className="text-sm text-gray-600">View groomers</p>
                </Link>
              ))
            )}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/groomers" className="text-blue-600 hover:text-blue-700 font-medium">
              View all locations →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Groomers Section */}
      <section className="py-16 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Dog Groomers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGroomers.length > 0 ? (
              featuredGroomers.map((groomer: Business) => (
                <div key={groomer.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
                  <BusinessImage imageUrl={groomer.image_url} businessName={groomer.name} />
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">{groomer.name}</h3>
                      {groomer.rating && (
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500 mr-1" suppressHydrationWarning>
                            {"★".repeat(Math.floor(groomer.rating || 0))}
                            {"☆".repeat(5 - Math.floor(groomer.rating || 0))}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({groomer.review_count || 0} reviews)
                          </span>
                        </div>
                      )}
                      <p className="text-gray-600 mb-4">{groomer.locationName || groomer.location || "London"}</p>
                      
                      {/* Display actual services if available */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(groomer.services) && groomer.services.length > 0 ? (
                          <>
                            {groomer.services.slice(0, 3).map((service) => (
                              <span 
                                key={service.id} 
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                title={service.description || service.name}
                              >
                                {service.name}
                              </span>
                            ))}
                            {groomer.services.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                +{groomer.services.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Full Groom</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Puppy Package</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Link 
                      href={generateGroomerUrl(groomer.slug || generateSlug(groomer.name))}
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors mt-4"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Display placeholders if no groomers found
              [1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <span>Groomer Image</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-bold text-xl mb-2">Pawsome Grooming</h3>
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">★★★★★</span>
                        <span className="text-sm text-gray-600">(24 reviews)</span>
                      </div>
                      <p className="text-gray-600 mb-4">Chelsea, London</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Full Groom</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Puppy Package</span>
                      </div>
                    </div>
                    <Link 
                      href="/groomers" 
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors mt-4"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/groomers" className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-6 rounded-md transition-colors">
              View All Groomers
            </Link>
          </div>
        </div>
      </section>

      {/* Specialized Services Section - Updated for new data structure */}
      <section className="py-16 px-4 sm:px-8 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Specialized Grooming Services</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Find groomers offering specialized services for your dog's specific needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedSpecializations && processedSpecializations.length > 0 ? (
              processedSpecializations.map((specialization) => (
                <div key={specialization.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Display service icon based on specialization icon_type from database */}
                      <SpecializationIcon 
                        name={specialization.name} 
                        iconType={(specialization.icon_type || 'brush')} 
                        size="medium" 
                      />
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-gray-800">{specialization.name}</h3>
                        <div className="mt-2 text-gray-600 leading-relaxed">
                          <p>{specialization.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      {/* Replace the conditional for showing businesses with generic message */}
                      <div className="py-3 px-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                        <p>Click below to find groomers who offer {specialization.name.toLowerCase()}.</p>
                      </div>
                    </div>
                    
                    <div className="mt-5 flex justify-end">
                      <Link 
                        href={generateSpecializationUrl(specialization.name)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-center text-sm font-medium"
                      >
                        <span>Find Specialized Groomers</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-yellow-50 p-6 rounded-md border border-yellow-200 text-center col-span-2">
                <h3 className="font-semibold text-yellow-800 mb-2">No specialized services found</h3>
                <p>We're currently setting up our database of specialized grooming services. Visit the <Link href="/admin/specializations" className="text-blue-600 hover:underline">Admin Panel</Link> to initialize specializations.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Search</h3>
              <p className="text-gray-600">Find dog groomers in your area by searching with your postcode or browsing our directory.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Compare</h3>
              <p className="text-gray-600">Read reviews, check services and prices to find the perfect groomer for your dog.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold text-xl mb-3">Book</h3>
              <p className="text-gray-600">Contact your chosen groomer directly or book an appointment through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Guide - NEW SECTION */}
      <section className="py-16 px-4 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Dog Grooming Price Guide</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Wondering how much dog grooming costs in London? Use our approximate price guide to help you budget for your pet's grooming needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main pricing tables */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Grooming Services by Dog Size</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Dog Size</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Basic Bath & Brush</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Full Groom</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Special Treatments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium">Small Dogs</div>
                        <div className="text-xs text-gray-500">e.g., Chihuahua, Toy Poodle</div>
                      </td>
                      <td className="px-4 py-4">£30–£40</td>
                      <td className="px-4 py-4">£50–£65</td>
                      <td className="px-4 py-4">£60–£95</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium">Medium Dogs</div>
                        <div className="text-xs text-gray-500">e.g., Cocker Spaniel, Border Collie</div>
                      </td>
                      <td className="px-4 py-4">£38–£50</td>
                      <td className="px-4 py-4">£55–£75</td>
                      <td className="px-4 py-4">£75–£145</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium">Large Dogs</div>
                        <div className="text-xs text-gray-500">e.g., Golden Retriever, German Shepherd</div>
                      </td>
                      <td className="px-4 py-4">£45–£65</td>
                      <td className="px-4 py-4">£75–£85</td>
                      <td className="px-4 py-4">£95–£165</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium">Extra Large Dogs</div>
                        <div className="text-xs text-gray-500">e.g., Newfoundland, Saint Bernard</div>
                      </td>
                      <td className="px-4 py-4">£105–£185</td>
                      <td className="px-4 py-4">From £105</td>
                      <td className="px-4 py-4">Price on request</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                *Full Groom includes bath, dry, brush, trim nails, ear cleaning, and coat styling
              </div>
            </div>

            {/* Additional services and factors */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Additional Services</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li className="px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">Nail Trimming</span>
                    <span className="text-gray-700">£8–£20</span>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">Flea Treatment</span>
                    <span className="text-gray-700">£7–£10</span>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">Deep Conditioning Bath</span>
                    <span className="text-gray-700">£5–£12.50</span>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">Teeth Cleaning/Breath Freshening</span>
                    <span className="text-gray-700">£4–£10</span>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <span className="font-medium">Coat Styling/Coloring</span>
                    <span className="text-gray-700">£40–£50</span>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center bg-blue-50">
                    <span className="font-medium">Mobile Grooming Services</span>
                    <span className="text-gray-700">+£5–£10 surcharge</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Factors Influencing Cost</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold block">Dog Size and Breed</span>
                      <span className="text-sm text-gray-600">Larger dogs or breed-specific styling requirements typically cost more.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold block">Coat Condition</span>
                      <span className="text-sm text-gray-600">Matted or thick coats require more time and effort to groom properly.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold block">Location in London</span>
                      <span className="text-sm text-gray-600">Prices tend to be higher in affluent areas like Chelsea or Kensington.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold block">Service Type</span>
                      <span className="text-sm text-gray-600">Basic grooming vs. luxury or show trims vary significantly in price.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm text-blue-800">
              This guide provides approximate prices in London. For accurate quotes tailored to your dog's specific needs, 
              we recommend contacting groomers directly.
            </p>
          </div>
        </div>
      </section>

      {/* Join as a Groomer */}
      <section className="py-16 px-4 sm:px-8 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">Are you a dog groomer in London?</h2>
              <p className="text-lg opacity-90">Join our directory to reach more clients and grow your business. List your services, showcase your work, and receive reviews.</p>
            </div>
            <div>
              <Link href="/contact" className="inline-block bg-white text-blue-700 font-semibold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Removing the duplicate footer - the global Footer component from ClientLayout will be used instead */}
    </div>
  );
}
