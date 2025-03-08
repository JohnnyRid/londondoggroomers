'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { generateSlug } from '@/lib/urlUtils';

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

  const handleApplyFilters = () => {
    const locationSelect = document.getElementById('location') as HTMLSelectElement;
    const serviceSelect = document.getElementById('service') as HTMLSelectElement;
    const searchInput = document.getElementById('search') as HTMLInputElement;
    const sortSelect = document.getElementById('sort') as HTMLSelectElement;
    
    const searchValue = searchInput?.value.trim() || '';
    const sortValue = sortSelect?.value || 'rating';
    
    const queryParams = new URLSearchParams();

    // Add location parameter if selected - use slug form of name instead of ID
    if (locationSelect?.value) {
      const selectedIndex = locationSelect.selectedIndex;
      const selectedLocationName = locationSelect.options[selectedIndex].text;
      // Convert the name to a slug for SEO-friendly URLs
      const locationSlug = generateSlug(selectedLocationName);
      queryParams.set('location', locationSlug);
    }

    // Add specialization parameter if selected - use slug form of name instead of ID
    if (serviceSelect?.value) {
      const selectedIndex = serviceSelect.selectedIndex;
      const selectedSpecName = serviceSelect.options[selectedIndex].text;
      // Convert the name to a slug for SEO-friendly URLs
      const specSlug = generateSlug(selectedSpecName);
      queryParams.set('specialization', specSlug);
    }

    // Add search parameter if any
    if (searchValue) {
      queryParams.set('search', searchValue);
    }

    // Add sort parameter if not default
    if (sortValue !== 'rating') {
      queryParams.set('sort', sortValue);
    }

    // Build the final URL and navigate
    const queryString = queryParams.toString();
    const finalUrl = queryString ? `/groomers?${queryString}` : '/groomers';
    router.push(finalUrl);
  };

  // Find the current location based on the slug from URL
  const findCurrentLocation = () => {
    if (!currentLocation) return "";
    
    // Try to find a location that matches the current slug
    const location = locations.find(loc => 
      generateSlug(loc.name) === currentLocation
    );
    
    return location ? location.id.toString() : "";
  };

  // Find the current specialization object based on the slug from URL
  const findCurrentSpecialization = () => {
    if (!currentSpecialization) return "";
    
    // Try to find a specialization that matches the current slug
    const spec = specializations.find(s => 
      generateSlug(s.name) === currentSpecialization
    );
    
    return spec ? spec.id.toString() : "";
  };

  return (
    <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => {
      e.preventDefault();
      handleApplyFilters();
    }}>
      <div className="flex-grow">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search by name or service..."
          className="w-full p-2 border rounded-md"
          defaultValue={currentSearch}
        />
      </div>
      <div className="md:w-1/5">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <select
          id="location"
          name="location"
          className="w-full p-2 border rounded-md"
          defaultValue={findCurrentLocation()}
        >
          <option value="">All London</option>
          {locations.map((location) => (
            <option 
              key={location.id} 
              value={location.id.toString()}
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
          name="service"
          className="w-full p-2 border rounded-md"
          defaultValue={findCurrentSpecialization()}
        >
          <option value="">Any Service</option>
          {specializations.map((spec) => (
            <option 
              key={spec.id} 
              value={spec.id.toString()}
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