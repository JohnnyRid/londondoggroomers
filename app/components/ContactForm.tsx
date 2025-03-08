'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please fill all required fields',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter a valid email address',
      });
      return;
    }

    // Set submitting state
    setFormStatus({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      errorMessage: '',
    });

    try {
      // Submit form data to Supabase
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }

      // Success state
      setFormStatus({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        errorMessage: '',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, isSuccess: false }));
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'There was an error submitting your message. Please try again.',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Send us a message</h2>
      
      {formStatus.isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-md text-green-800">
          Thank you for your message! We'll get back to you shortly.
        </div>
      )}
      
      {formStatus.isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-800">
          {formStatus.errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your name"
            disabled={formStatus.isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            disabled={formStatus.isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message*
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="How can we help you?"
            disabled={formStatus.isSubmitting}
          ></textarea>
        </div>
        
        <div>
          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              formStatus.isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={formStatus.isSubmitting}
          >
            {formStatus.isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          By submitting this form, you agree to our <Link href="/privacy/" className="text-blue-600 hover:underline">privacy policy</Link>.
        </p>
      </form>

      <div className="mt-4 flex justify-center">
        <Link href="/privacy/" className="text-sm text-gray-500 hover:text-gray-700">
          View our Privacy Policy
        </Link>
      </div>
    </div>
  );
}