import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Company info */}
          <div className="md:max-w-xs">
            <h3 className="text-lg font-semibold mb-4">London Dog Groomers</h3>
            <p className="text-gray-100 mb-4">
              Connecting pet owners with the best dog grooming services across London.
            </p>
            <p className="text-gray-100 text-sm">
              © {currentYear} London Dog Groomers. All rights reserved.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/groomers" className="text-gray-100 hover:text-white">
                  Find Groomers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-100 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-100 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-100 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-100 hover:text-white">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-100 hover:text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-100">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>john@doggroomerslondon.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}