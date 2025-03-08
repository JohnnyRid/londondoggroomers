import { MetadataRoute } from 'next'
import sitemap from '../sitemap'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const items = await sitemap()

  // Convert sitemap items to XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${items.map((item) => {
    const lastmod = item.lastModified 
      ? (item.lastModified instanceof Date 
        ? item.lastModified.toISOString()
        : item.lastModified)
      : new Date().toISOString()
    
    return `
    <url>
      <loc>${escapeXml(item.url)}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${item.changeFrequency || 'weekly'}</changefreq>
      <priority>${item.priority || 0.5}</priority>
    </url>
    `
  }).join('')}
</urlset>`

  // Return XML response
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}