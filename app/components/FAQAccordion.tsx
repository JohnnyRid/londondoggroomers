'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className="border border-gray-200 rounded-md overflow-hidden"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className={`w-full px-4 py-3 flex justify-between items-center text-left font-medium text-sm ${
              openIndex === index ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800 hover:bg-gray-50'
            }`}
            aria-expanded={openIndex === index}
          >
            {faq.question}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index ? 'max-h-40' : 'max-h-0'
            }`}
          >
            <div className="p-4 bg-white text-gray-600 text-sm border-t border-gray-100">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}