import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { generateGroomerUrl } from '@/lib/urlUtils'

interface Business {
  id: string;
  name: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published groomers with their names
  const { data: groomers } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('published', true)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://londondoggroomers.co.uk'

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/groomers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }
  ]

  // Dynamic groomer routes with SEO-friendly URLs
  const groomerRoutes = groomers?.map((groomer: Business) => ({
    url: `${baseUrl}${generateGroomerUrl(groomer.id, groomer.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  })) || []

  return [...staticRoutes, ...groomerRoutes]
}
