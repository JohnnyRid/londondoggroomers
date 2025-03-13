'use client';

import React, { useState } from 'react';
import GroomerMap from './GroomerMap';
import { PhoneIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface GroomerSidebarProps {
  businessName: string;
  address: string;
  // Make these optional since we might use placeId instead
  latitude?: number;
  longitude?: number;
  // Add Google Place ID
  placeId?: string;
  phone?: string;
  website?: string;
  email?: string;
}

const GroomerSidebar = ({
  businessName,
  address,
  latitude,
  longitude,
  placeId,
  phone,
  website,
  email
}: GroomerSidebarProps) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would implement the actual email sending logic
      // This is just a placeholder for demonstration
      console.log('Sending email:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setFormError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Location */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Business Location</h4>
        <GroomerMap
          latitude={latitude}
          longitude={longitude}
          placeId={placeId}
          address={address}
          businessName={businessName}
        />
      </div>

      {/* Call to Action Buttons */}
      <div className="space-y-3">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <PhoneIcon className="h-5 w-5" />
            Call Now
          </a>
        )}

        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <GlobeAltIcon className="h-5 w-5" />
            Visit Website
          </a>
        )}
      </div>

      {/* Contact Form */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-3">Send a Message</h4>
        
        {formSubmitted ? (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
            Your message has been sent! We'll get back to you soon.
          </div>
        ) : (
          <>
            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
              >
                <EnvelopeIcon className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default GroomerSidebar;
