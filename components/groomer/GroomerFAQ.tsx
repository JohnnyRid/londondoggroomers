'use client';

import React from 'react';

interface Service {
  id: string | number;
  name: string;
  description?: string;
  price_from?: number;
  price_to?: number;
}

interface GroomerFAQProps {
  services?: Service[];
}

export default function GroomerFAQ({ services = [] }: GroomerFAQProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Generate services answer dynamically
  const servicesAnswer = services.length > 0
    ? `We offer: ${services.map(service => {
        const priceRange = service.price_from || service.price_to 
          ? ` (${service.price_from && service.price_to 
              ? `£${service.price_from}-£${service.price_to}`
              : `£${service.price_from || service.price_to}`})`
          : '';
        return `${service.name}${priceRange}`;
      }).join(', ')}`
    : "Please contact us directly for our current services and pricing.";

  const FAQS = [
    {
      question: "How long does a typical grooming take?",
      answer: "Usually 1-3 hours depending on size and services needed"
    },
    {
      question: "How often should I get my dog groomed?",
      answer: "Every 4-8 weeks depending on breed and coat type"
    },
    {
      question: "What services do you offer?",
      answer: servicesAnswer
    },
    {
      question: "How should I prepare my dog?",
      answer: "Give them a walk and bathroom break before the appointment"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium">{faq.question}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="p-4 border-t">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
