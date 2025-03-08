export interface Service {
  id?: string;
  name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
  duration_minutes?: number;
  business_id?: number;
}

export interface Business {
  id: number;
  name: string;
  description?: string;
  location_id?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  slug: string;
  phone?: string;
  website?: string;
  email?: string;
  featured?: boolean;
  services?: Service[] | string;
  locations?: {
    name: string;
  };
  locationName?: string;
}

export interface LocationInfo {
  id: number;
  name: string;
}

export interface BusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  '@id': string;
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  url?: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: 'GB';
  };
  priceRange: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  hasOfferCatalog?: {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Array<{
      '@type': 'Offer';
      itemOffered: {
        '@type': 'Service';
        name: string;
        description?: string;
      };
      price?: number;
      priceCurrency: string;
      availability: string;
      priceValidUntil: string;
    }>;
  };
}
