'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { generateSlug } from '@/lib/urlUtils';
import { useCallback, useEffect, FormEvent } from 'react';

interface GroomerFiltersProps {
  locations: Array<{ id: number; name: string }>;
  specializations: Array<{ id: number; name: string }>;
}

export default function GroomerFilters({ locations, specializations }: GroomerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current values from search params
  const currentLocation = searchParams.get('location');
  const currentSpecialization = searchParams.get('specialization');
  const currentSort = searchParams.get('sort') || 'rating';
  const currentSearch = searchParams.get('search') || '';

  // Debug current selection on mount
  useEffect(() => {
    console.log('Current location slug:', currentLocation);
    console.log('Found match in locations:', 
      locations.find(loc => generateSlug(loc.name) === currentLocation)?.name
    );
  }, [currentLocation, locations]);

  // Find the current location based on the slug from URL
  const findCurrentLocation = useCallback(() => {
    if (!currentLocation) return "";
    
    // Try to find a location that matches the current slug
    const location = locations.find(loc => 
      generateSlug(loc.name) === currentLocation
    );
    
    if (location) {
      console.log('Found location match:', location.name, 'ID:', location.id);
      return generateSlug(location.name);
    }
    
    console.log('No location match found for slug:', currentLocation);
    return "";
  }, [currentLocation, locations]);

  // Find the current specialization based on the slug from URL
  const findCurrentSpecialization = useCallback(() => {
    if (!currentSpecialization) return "";
    
    // Try to find a specialization that matches the current slug
    const spec = specializations.find(s => 
      generateSlug(s.name) === currentSpecialization
    );
    
    if (spec) {
      return generateSlug(spec.name);
    }
    
    return "";
  }, [currentSpecialization, specializations]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission

    // Create a new FormData object and explicitly select only the fields we want
    const form = e.currentTarget;
    const searchValue = (form.querySelector('#search') as HTMLInputElement)?.value || '';
    const locationValue = (form.querySelector('#location') as HTMLSelectElement)?.value || '';
    const serviceValue = (form.querySelector('#service') as HTMLSelectElement)?.value || '';
    const sortValue = (form.querySelector('#sort') as HTMLSelectElement)?.value || 'rating';

    console.log('Form values:', {
      search: searchValue,
      location: locationValue,
      specialization: serviceValue,
      sort: sortValue
    });
    
    const queryParams = new URLSearchParams();

    // Add parameters only if they have values
    if (locationValue) {
      queryParams.set('location', locationValue);
    }

    if (serviceValue) {
      queryParams.set('specialization', serviceValue);
    }

    if (searchValue) {
      queryParams.set('search', searchValue);
    }

    if (sortValue !== 'rating') {
      queryParams.set('sort', sortValue);
    }

    // Build the final URL and navigate
    const queryString = queryParams.toString();
    console.log('Generated query string:', queryString);
    const finalUrl = queryString ? `/groomers?${queryString}` : '/groomers';
    console.log('Navigating to:', finalUrl);
    router.push(finalUrl);
  };

  return (
    <form 
      className="flex flex-col md:flex-row gap-4" 
      onSubmit={handleSubmit}
      autoComplete="off" // Prevent browser from adding hidden fields
    >
      <div className="flex-grow">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search by name or service..."
          className="w-full p-2 border rounded-md"
          defaultValue={currentSearch}
          autoComplete="off"
        />
      </div>
      <div className="md:w-1/5">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <select
          id="location"
          name="location"
          className="w-full p-2 border rounded-md"
          defaultValue={findCurrentLocation()}
          onChange={(e) => {
            console.log('Location changed to:', e.target.value);
          }}
          autoComplete="off"
        >
          <option value="">All London</option>
          {locations.map((location) => (
            <option 
              key={location.id} 
              value={generateSlug(location.name)}
            >
              {location.name}
            </option>
          ))}
        </select>
      </div>
      <div className="md:w-1/5">
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service</label>
        <select
          id="service"
          name="specialization"
          className="w-full p-2 border rounded-md"
          defaultValue={findCurrentSpecialization()}
          autoComplete="off"
        >
          <option value="">Any Service</option>
          {specializations.map((spec) => (
            <option 
              key={spec.id} 
              value={generateSlug(spec.name)}
            >
              {spec.name}
            </option>
          ))}
        </select>
      </div>
      <div className="md:w-1/5">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
        <select
          id="sort"
          name="sort"
          className="w-full p-2 border rounded-md"
          defaultValue={currentSort}
          autoComplete="off"
        >
          <option value="rating">Rating</option>
          <option value="reviews">Most Reviews</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
      <div className="self-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors w-full md:w-auto"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}