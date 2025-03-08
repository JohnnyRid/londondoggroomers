import Link from 'next/link';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Page Not Found | London Dog Groomers',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Image 
            src="/images/Black-London-Logo.svg" 
            alt="London Dog Groomers Logo" 
            width={120} 
            height={120}
            className="mx-auto"
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
          <p className="text-amber-700">
            Sorry, we couldn't find the page you were looking for.
          </p>
        </div>

        <p className="text-gray-600 mb-8">
          The page may have been moved, deleted, or perhaps you mistyped the URL.
        </p>
        
        <div className="space-y-4">
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Go to Homepage
          </Link>
          
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Looking for dog grooming services?
            </p>
            <Link href="/groomers" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Browse our directory of London dog groomers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}