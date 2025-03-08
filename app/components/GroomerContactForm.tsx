'use client';

import { useState, FormEvent } from 'react';

interface GroomerContactFormProps {
  groomerName: string;
  groomerEmail?: string;
  fallbackEmail?: string;
  groomerPhone?: string;
  groomerWebsite?: string;
}

export default function GroomerContactForm({
  groomerName,
  groomerEmail,
  fallbackEmail = "info@doggroomerslondon.com",
  groomerPhone,
  groomerWebsite
}: GroomerContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Determine the recipient email
    const recipientEmail = groomerEmail || fallbackEmail;
    
    // Create email subject
    const subject = `Inquiry for ${groomerName} via London Dog Groomers`;
    
    // Create email body
    const body = `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}

---
This inquiry was sent via London Dog Groomers.
    `.trim();
    
    // Open the user's email client with the form data
    window.location.href = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contact {groomerName}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
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
            rows={4}
            required
            placeholder="Inquire about services, prices, or request an appointment..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Contact via Email
          </button>
          
          <div className="text-sm text-gray-500 text-center">
            This will open your email client to send a message directly to the groomer
          </div>
          
          {groomerPhone && (
            <a 
              href={`tel:${groomerPhone.replace(/\s+/g, '')}`}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-center mt-2"
            >
              Call {groomerName}: {groomerPhone}
            </a>
          )}
          
          {groomerWebsite && (
            <a 
              href={groomerWebsite.startsWith('http') ? groomerWebsite : `https://${groomerWebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-center"
            >
              Visit Website
            </a>
          )}
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>You can also contact {groomerName} via the methods listed above.</p>
        <p className="mt-1">
          By submitting this form, you'll be sending an email directly to the groomer to handle your inquiry.
        </p>
      </div>
    </div>
  );
}