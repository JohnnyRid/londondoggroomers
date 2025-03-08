import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'maps.googleapis.com',
      'maps.gstatic.com',
      'streetviewpixels-pa.googleapis.com',
      'jsonxemvnylzzriqjgab.supabase.co',
      'hxyplpwdwyarkdtusteq.supabase.co',
      'qeufgraqulirfpjuscea.supabase.co',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      // Redirect any old URLs to their new counterparts
      {
        source: '/dog-groomers',
        destination: '/groomers',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/groomers',
        permanent: true,
      },
      {
        source: '/groomer/:path*',
        destination: '/groomers/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          }
        ],
      },
      {
        // Apply these headers to static assets
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked after headers/redirects
        // and before all files including _next/public files
      ],
      afterFiles: [
        // These rewrites are checked after pages/public files
        // are checked but before dynamic routes
      ],
      fallback: [
        // These rewrites are checked after both pages/public files
        // and dynamic routes are checked
      ],
    };
  },
};

export default nextConfig;
