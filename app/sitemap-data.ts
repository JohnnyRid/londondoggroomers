import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { generateGroomerUrl, generateLocationUrl, generateSpecializationUrl } from '@/lib/urlUtils'

interface Business {
  id: string;
  name: string;
  slug?: string;
}

interface Location {
  id: number;
  name: string;
}

interface Specialization {
  id: number;
  name: string;
}

// Function to safely escape XML entities in URLs
function escapeXmlEntities(url: string): string {
  return url
    .replace(/&(?!amp;|lt;|gt;|apos;|quot;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

export default async function generateSitemapData(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://doggroomerslondon.com'
  
  // Fetch all businesses
  const { data: groomers } = await supabase
    .from('businesses')
    .select('id, name, slug')
  
  // Fetch all locations
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .order('name')
  
  // Fetch all specializations
  const { data: specializations } = await supabase
    .from('specializations')
    .select('id, name')
    .order('name')
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: escapeXmlEntities(baseUrl),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: escapeXmlEntities(`${baseUrl}/about`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: escapeXmlEntities(`${baseUrl}/contact`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: escapeXmlEntities(`${baseUrl}/groomers`),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: escapeXmlEntities(`${baseUrl}/privacy`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: escapeXmlEntities(`${baseUrl}/terms`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: escapeXmlEntities(`${baseUrl}/disclaimer`),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ]
  
  // Dynamic groomer routes
  const groomerRoutes: MetadataRoute.Sitemap = (groomers || []).map((groomer: Business) => ({
    url: escapeXmlEntities(`${baseUrl}${generateGroomerUrl(groomer.slug || groomer.name)}`),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }))
  
  // Location routes
  const locationRoutes: MetadataRoute.Sitemap = (locations || []).map((location: Location) => {
    const params = new URLSearchParams({ location: generateLocationUrl(location.name) });
    return {
      url: escapeXmlEntities(`${baseUrl}/groomers?${params.toString()}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    };
  })
  
  // Specialization routes
  const specializationRoutes: MetadataRoute.Sitemap = (specializations || []).map((spec: Specialization) => {
    const params = new URLSearchParams({ specialization: generateSpecializationUrl(spec.name) });
    return {
      url: escapeXmlEntities(`${baseUrl}/groomers?${params.toString()}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    };
  })
  
  // Combined location and specialization routes for better SEO coverage
  const combinedRoutes: MetadataRoute.Sitemap = (locations || []).flatMap((location: Location) =>
    (specializations || []).map((spec: Specialization) => {
      const params = new URLSearchParams({
        location: generateLocationUrl(location.name),
        specialization: generateSpecializationUrl(spec.name)
      });
      return {
        url: escapeXmlEntities(`${baseUrl}/groomers?${params.toString()}`),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5
      };
    })
  )
  
  return [
    ...staticRoutes,
    ...groomerRoutes,
    ...locationRoutes,
    ...specializationRoutes,
    ...combinedRoutes
  ]
}