import type { Service } from '@/app/groomers/[slug]/types';

export function parseServices(services: string | any[] | undefined): Service[] {
  if (!services) return [];
  
  // If it's already an array
  if (Array.isArray(services)) {
    return services;
  } 
  
  // If it's a string, try to parse as JSON
  if (typeof services === 'string') {
    try {
      // Try to parse as JSON
      return JSON.parse(services);
    } catch (_error) {
      // Split by commas if it contains commas
      if (services.includes(',')) {
        const serviceNames = services.split(',').map(s => s.trim());
        return serviceNames.map((name, index) => ({
          id: `service-${index}`,
          name: name
        }));
      } 
      // Or convert single string to a single service
      else {
        return [{
          id: 'service-1',
          name: services.trim()
        }];
      }
    }
  }
  
  return [];
}

export function parseOpeningHours(hours: string | any[] | undefined): any[] {
  if (!hours) return [];
  
  // If it's already an array
  if (Array.isArray(hours)) {
    return hours;
  }
  
  // If it's a string, try to parse as JSON
  if (typeof hours === 'string') {
    try {
      return JSON.parse(hours);
    } catch (_error) {
      // Simple fallback format
      return [
        { day: 'Monday - Friday', hours: '9:00 AM - 5:00 PM' },
        { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
        { day: 'Sunday', hours: 'Closed' }
      ];
    }
  }
  
  return [];
}