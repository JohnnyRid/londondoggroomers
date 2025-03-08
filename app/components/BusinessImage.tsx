'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BusinessImageProps {
  imageUrl?: string | null;
  businessName: string;
  height?: string;
  sizes?: string;
  priority?: boolean;
}

const DEFAULT_IMAGE = '/images/default-business.jpg';

export default function BusinessImage({ 
  imageUrl, 
  businessName,
  height = "h-48",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false
}: BusinessImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (!imageUrl) return DEFAULT_IMAGE;
    
    // Handle Google Maps photo IDs (they look like: AF1QipO...)
    if (imageUrl.startsWith('AF1Qip') && !imageUrl.startsWith('http')) {
      // Convert to proper Google Photos URL
      return `https://lh3.googleusercontent.com/${imageUrl}`;
    }
    
    // If it's not a URL (no protocol), assume it's a relative path and add leading slash if needed
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }
    
    return imageUrl;
  });
  
  return (
    <div className={`${height} bg-gray-200 relative overflow-hidden`}>
      <Image 
        src={imgSrc}
        alt={`${businessName} - Dog Grooming Services`}
        className="object-cover object-center w-full h-full hover:scale-105 transition-transform duration-300"
        style={{ objectPosition: '50% 25%' }}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => {
          // If image fails to load, use default
          if (imgSrc !== DEFAULT_IMAGE) {
            setImgSrc(DEFAULT_IMAGE);
          }
        }}
      />
    </div>
  );
}