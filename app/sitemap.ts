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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://londondoggroomers.co.uk'

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
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/groomers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ]

  // Dynamic groomer routes
  const groomerRoutes: MetadataRoute.Sitemap = (groomers || []).map((groomer: Business) => ({
    url: `${baseUrl}${generateGroomerUrl(groomer.slug || groomer.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  // Location routes
  const locationRoutes: MetadataRoute.Sitemap = (locations || []).map((location: Location) => ({
    url: `${baseUrl}/groomers?${new URLSearchParams({ location: generateLocationUrl(location.name) })}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6
  }))

  // Specialization routes
  const specializationRoutes: MetadataRoute.Sitemap = (specializations || []).map((spec: Specialization) => ({
    url: `${baseUrl}/groomers?${new URLSearchParams({ specialization: generateSpecializationUrl(spec.name) })}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6
  }))

  // Combined location and specialization routes for better SEO coverage
  const combinedRoutes: MetadataRoute.Sitemap = (locations || []).flatMap((location: Location) =>
    (specializations || []).map((spec: Specialization) => ({
      url: `${baseUrl}/groomers?${new URLSearchParams({
        location: generateLocationUrl(location.name),
        specialization: generateSpecializationUrl(spec.name)
      })}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5
    }))
  )

  return [
    ...staticRoutes,
    ...groomerRoutes,
    ...locationRoutes,
    ...specializationRoutes,
    ...combinedRoutes
  ]
}
