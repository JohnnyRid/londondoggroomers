import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import FAQAccordion from '../components/FAQAccordion';

export const metadata = {
  title: 'About Us | London Dog Groomers',
  description: 'Learn about London Dog Groomers - connecting pet owners with professional dog groomers across London',
};

const faqs = [
  {
    question: "How does London Dog Groomers work?",
    answer: "We connect dog owners with professional groomers across London. Simply search by location, browse groomer profiles, and contact them directly to book appointments."
  },
  {
    question: "Are all groomers on your platform verified?",
    answer: "Yes, we carefully vet each groomer before listing them. We verify their business credentials, professional experience, and ensure they meet our quality standards."
  },
  {
    question: "How do I find a groomer in my area?",
    answer: "Use our search feature to filter groomers by location, services, and specializations. You can view detailed profiles, photos, and reviews to make an informed choice."
  },
  {
    question: "Do you handle the booking process?",
    answer: "We provide direct contact information for each groomer. While we don't handle bookings directly, you can easily reach out to groomers through our platform to arrange appointments."
  },
  {
    question: "How can I list my grooming business?",
    answer: "Professional groomers can register their business through our 'Register Your Business' page. We'll review your application and help you create an attractive business profile."
  },
  {
    question: "What areas do you cover?",
    answer: "We cover all London boroughs and surrounding areas, including popular locations like Greenwich, Hackney, Islington, Camden, and more."
  },
  {
    question: "Are the reviews genuine?",
    answer: "Yes, all reviews on our platform are from verified customers who have used the grooming services. We use Google Reviews integration to ensure authenticity."
  }
];

export default function AboutPage() {
  // Generate FAQ Schema with additional metadata
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "headline": "Frequently Asked Questions about London Dog Groomers",
    "description": "Common questions about finding and booking professional dog groomers in London",
    "publisher": {
      "@type": "Organization",
      "name": "London Dog Groomers",
      "url": process.env.NEXT_PUBLIC_SITE_URL
    },
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About London Dog Groomers</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting pet owners with professional dog groomers across London since 2023
            </p>
          </div>
          
          {/* Our Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose prose-lg prose-blue max-w-none space-y-6">
                <p>
                  London Dog Groomers was founded with a simple mission: to make it easier for 
                  dog owners to find qualified, professional groomers for their beloved pets.
                </p>
                
                <p>
                  As dog owners ourselves, we understood the challenge of finding reliable grooming 
                  services. We know how important it is to find a groomer who truly understands 
                  your pet's needs.
                </p>
                
                <p>
                  Finding a groomer with expertise in specific breeds can be challenging. 
                  The same goes for locating specialized services for dogs with medical conditions.
                </p>

                <p>
                  That's why we've made the search process simple and efficient. Whether you're 
                  looking in your neighborhood or willing to travel, we help you find the perfect match.
                </p>

                <p>
                  Our directory brings together the best dog grooming businesses across London. 
                  We make it easy to browse, compare services, and connect with professional 
                  groomers who will take exceptional care of your furry friend.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/images/dog-grooming.jpg"
                alt="Professional dog groomer with a happy client"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
          
          {/* Our Mission */}
          <div className="bg-blue-50 rounded-xl p-8 md:p-12 mb-24">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-700 mb-4">
                To create the most comprehensive, trusted platform connecting dog owners with 
                skilled grooming professionals, ensuring every dog in London has access to 
                quality grooming care.
              </p>
              <p className="text-gray-600">
                We believe that proper grooming is essential for your dog's health and happiness, 
                and our goal is to make professional grooming services accessible to all dog owners.
              </p>
            </div>
          </div>
          
          {/* What We Offer */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Search</h3>
                <p className="text-gray-600">
                  Find dog groomers near you with our simple search tools. 
                  Filter by location, services, and specializations to match your pet's needs.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Professionals</h3>
                <p className="text-gray-600">
                  We carefully curate our directory to include only 
                  established, professional groomers with proven track records.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Resources</h3>
                <p className="text-gray-600">
                  Access grooming guides, care tips, and breed-specific advice 
                  to help keep your dog looking and feeling their best.
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
          
          {/* For Business Owners */}
          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">For Dog Grooming Businesses</h2>
              <p className="text-lg text-gray-700 mb-6">
                Are you a professional dog groomer in London? Join our directory to reach more clients and grow your business.
              </p>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits of Joining</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Increased visibility to dog owners actively looking for grooming services</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Professional business profile highlighting your services and expertise</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Opportunity to showcase your specializations and unique services</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Client reviews and ratings to build your online reputation</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link 
                    href="/register-groomer" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Register Your Business
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Us */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-600 mb-6">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <Link 
              href="/contact" 
              className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-6 rounded-md transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
