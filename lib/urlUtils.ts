export function generateGroomerUrl(slug: string): string {
  return `/groomers/${slug}`;
}

/**
 * Look up business by slug from the businesses table
 * This function will be used instead of parseIdFromSlug
 * The function is just a placeholder - the actual implementation will query the database
 */
export function parseSlug(slug: string): string {
  return slug;
}

/**
 * Generate a URL-friendly slug from any string
 * Use for locations, specializations, etc.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    // First replace & with 'and'
    .replace(/&/g, 'and')
    // Then replace any non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/(^-|-$)/g, '');
}

/**
 * Generate SEO-friendly URL for a location based on location name
 */
export function generateLocationUrl(locationName: string): string {
  const slug = generateSlug(locationName);
  return `/groomers/${slug}`;
}

/**
 * Generate SEO-friendly URL for a specialization based on specialization name
 */
export function generateSpecializationUrl(specializationName: string): string {
  const slug = generateSlug(specializationName);
  return `/service/${slug}`;
}

/**
 * Parse a location slug from a URL path
 */
export function parseLocationSlug(slug: string): string {
  return slug;
}

/**
 * Parse a specialization slug from a URL path
 */
export function parseSpecializationSlug(slug: string): string {
  return slug;
}

export function buildCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://londondoggroomers.com';
  const fullUrl = `${baseUrl}${path}`;
  return fullUrl;
}
