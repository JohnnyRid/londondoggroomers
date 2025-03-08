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
  const currentSpecializationId = searchParams.get('specialization');
  const currentSort = searchParams.get('sort') || 'rating';
  const currentSearch = searchParams.get('search') || '';

  // Find the matching location and specialization options
  const locationValue = currentLocationId 
    ? locations.find(loc => loc.id.toString() === currentLocationId)?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : "";

  const specializationValue = currentSpecializationId
    ? specializations.find(spec => spec.id.toString() === currentSpecializationId)?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : "";

  const handleApplyFilters = () => {
    const locationSelect = document.getElementById('location') as HTMLSelectElement;
    const serviceSelect = document.getElementById('service') as HTMLSelectElement;
    const searchInput = document.getElementById('search') as HTMLInputElement;
    const sortSelect = document.getElementById('sort') as HTMLSelectElement;
    
    const locationValue = locationSelect?.value || '';
    const serviceValue = serviceSelect?.value || '';
    const searchValue = searchInput?.value || '';
    const sortValue = sortSelect?.value || '';
    
    const targetUrl = '/groomers';
    const queryParams = new URLSearchParams();

    // Preserve sort parameter
    if (sortValue && sortValue !== 'rating') {
      queryParams.set('sort', sortValue);
    }

    // Preserve search parameter if any
    if (searchValue) {
      queryParams.set('search', searchValue);
    }
    
    if (locationValue) {
      // Extract location ID for query param
      const locationId = locationSelect.options[locationSelect.selectedIndex].getAttribute('data-id');
      if (locationId) {
        queryParams.set('location_id', locationId);
      }
    } else if (serviceValue) {
      // Get the selected specialization name
      const selectedSpec = specializations.find(
        spec => spec.id.toString() === serviceSelect.options[serviceSelect.selectedIndex].getAttribute('data-id')
      );
      if (selectedSpec) {
        const serviceName = selectedSpec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        queryParams.set('specialization', serviceName);
      }
    }
    
    // Append query parameters to URL if any
    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;
    
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
    <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
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
          defaultValue={locationValue ? `/groomers/${locationValue}` : ""}
        >
          <option value="">All London</option>
          {locations.map((location) => (
            <option 
              key={location.id} 
              value={`/groomers/${location.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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
          defaultValue={specializationValue ? `/service/${specializationValue}` : ""}
        >
          <option value="">Any Service</option>
          {specializations.map((spec) => (
            <option 
              key={spec.id} 
              value={`/service/${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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
          defaultValue={currentSort}
        >
          <option value="rating">Rating</option>
          <option value="reviews">Most Reviews</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
      <div className="self-end">
        <button
          type="button"
          onClick={handleApplyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors w-full md:w-auto"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}