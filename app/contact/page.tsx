import React from 'react';
import ContactForm from '../components/ContactForm';
import FAQAccordion from '../components/FAQAccordion';
import Script from 'next/script';

export const metadata = {
  title: 'Contact Us | London Dog Groomers',
  description: 'Get in touch with London Dog Groomers with any questions or inquiries. We\'re here to help with all your dog grooming related questions.',
};

const faqs = [
  {
    question: "How do I list my grooming business?",
    answer: "To list your dog grooming business on our platform, please submit your details through our contact form or email us directly at john@doggroomerslondon.com. Our team will guide you through the verification process and help set up your business profile."
  },
  {
    question: "Is it free to be listed in the directory?",
    answer: "Currently, we offer complimentary listings for qualified dog grooming businesses as part of our platform launch. In the future, we plan to introduce premium listing options with enhanced features, while maintaining basic listing availability."
  },
  {
    question: "How can I update my business information?",
    answer: "For any updates to your business profile, services, or contact details, please reach out to our support team via the contact form or email us at john@doggroomerslondon.com. We aim to process all updates within 2 business days."
  },
  {
    question: "What is your typical response time?",
    answer: "We strive to respond to all inquiries within 24-48 hours during business days. For urgent matters, please mention this in your message subject line."
  },
  {
    question: "Can you help me find a specific type of grooming service?",
    answer: "Yes! Contact us with your specific requirements, and we'll help you find groomers who specialize in your needs, whether it's breed-specific grooming, mobile services, or specialized treatments."
  },
  {
    question: "How do I report an issue with a listed groomer?",
    answer: "If you experience any issues with a groomer listed on our platform, please use our contact form or email us directly. Include all relevant details, and our team will investigate the matter promptly."
  }
];

export default function ContactPage() {
  // Generate FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "headline": "Contact and Support FAQs",
    "description": "Frequently asked questions about contacting London Dog Groomers and getting support",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Generate Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "London Dog Groomers",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.svg`,
    "description": "Connecting dog owners with professional groomers across London",
    "email": "john@doggroomerslondon.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "john@doggroomerslondon.com",
      "availableLanguage": "English",
      "areaServed": "London"
    }
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our service or need support? Get in touch with our team and we'll be happy to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Contact Form */}
            <div className="md:col-span-3">
              <ContactForm />
            </div>
            
            {/* Contact Information */}
            <div className="md:col-span-2">
              <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a href="mailto:john@doggroomerslondon.com" className="text-blue-600 hover:underline">
                        john@doggroomerslondon.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Response Time</p>
                      <p className="text-sm text-gray-600">
                        We aim to respond to all inquiries within 24-48 hours during business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Office</p>
                      <p className="text-sm text-gray-600">
                        London, United Kingdom
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
                    <FAQAccordion faqs={faqs} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
