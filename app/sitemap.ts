import { MetadataRoute } from 'next'
import generateSitemapData from './sitemap-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Simply use the implementation from the other file
  return generateSitemapData()
}
