'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface GroomerFiltersProps {
  locations: Array<{ id: number; name: string }>;
  specializations: Array<{ id: number; name: string }>;
}

export default function GroomerFilters({ locations, specializations }: GroomerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current values from search params
  const currentLocationId = searchParams.get('location_id');
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

    // Add location parameter if selected
    if (locationSelect?.value) {
      const locationId = locationSelect.options[locationSelect.selectedIndex].getAttribute('data-id');
      if (locationId) {
        queryParams.set('location_id', locationId);
      }
    }

    // Add specialization parameter if selected
    if (serviceSelect?.value) {
      const specializationId = serviceSelect.options[serviceSelect.selectedIndex].getAttribute('data-id');
      if (specializationId) {
        queryParams.set('specialization', specializationId);
      }
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

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      const serviceSelect = document.getElementById('service') as HTMLSelectElement;
      if (serviceSelect) serviceSelect.value = '';
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      const locationSelect = document.getElementById('location') as HTMLSelectElement;
      if (locationSelect) locationSelect.value = '';
    }
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
          onChange={handleLocationChange}
          className="w-full p-2 border rounded-md"
          value={currentLocationId || ""}
        >
          <option value="">All London</option>
          {locations.map((location) => (
            <option 
              key={location.id} 
              value={location.id}
              data-id={location.id.toString()}
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
          onChange={handleServiceChange}
          className="w-full p-2 border rounded-md"
          value={currentSpecialization || ""}
        >
          <option value="">Any Service</option>
          {specializations.map((spec) => (
            <option 
              key={spec.id} 
              value={spec.id}
              data-id={spec.id.toString()}
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
          value={currentSort}
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