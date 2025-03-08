import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_IMAGE = '/images/default-business.jpg';

// Helper function to get the full URL for an image
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath || imagePath.trim() === '') return DEFAULT_IMAGE;
  
  try {
    // If it's already a full URL, validate and return it
    if (imagePath.startsWith('http')) {
      new URL(imagePath); // This will throw if URL is invalid
      return imagePath;
    }
    
    // If it's a storage path, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!baseUrl) return DEFAULT_IMAGE;
    
    // Remove any leading slashes and handle potential storage prefix
    const cleanPath = imagePath.replace(/^\/+/, '').replace(/^storage\//, '');
    return `${baseUrl}/storage/v1/object/public/${cleanPath}`;
  } catch (error) {
    console.error('Invalid image URL:', error);
    return DEFAULT_IMAGE;
  }
}