export interface Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  locations?: { name: string };
  locationName?: string;
  slug?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  services?: string | any[];
  opening_hours?: string | any[];
}

export interface Service {
  id: string | number;
  name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
  duration_minutes?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface PageParams {
  slug: string;
}
