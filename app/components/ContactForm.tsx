'use client';

import { useState, FormEvent } from 'react';

interface FormStatus {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  message?: string;
}

export default function ContactForm() {
  const [formStatus, setFormStatus] = useState<FormStatus>({
    isSubmitting: false,
    isSuccess: false,
    isError: false
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, isSubmitting: true });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setFormStatus({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        message: 'Message sent successfully! We\'ll get back to you soon.'
      });

      // Reset form
      form.reset();

    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        message: 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 mobile-text">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your name"
          disabled={formStatus.isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 mobile-text">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="your@email.com"
          disabled={formStatus.isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1 mobile-text">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="What is this regarding?"
          disabled={formStatus.isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 mobile-text">
          Message
        </label>
        <textarea
          id="message"
          name="message"
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

      <p className="text-sm text-gray-700 mobile-text mt-2">
        Your information is protected and we will only use it to respond to your inquiry.
      </p>

      {formStatus.isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            {formStatus.message || 'An error occurred. Please try again.'}
          </p>
        </div>
      )}

      {formStatus.isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            {formStatus.message || 'Message sent successfully!'}
          </p>
        </div>
      )}
    </form>
  );
}