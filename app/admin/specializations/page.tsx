'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SpecializationIcon from '../../components/SpecializationIcon';

interface ApiResponse {
  status: string;
  message: string;
  table_exists: boolean;
  data_count: number;
  specializations_added: number;
  details: any[];
}

interface Specialization {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export default function SpecializationsAdmin() {
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  
  // Function to initialize specializations by calling our API
  const initializeSpecializations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/init-specializations');
      const data = await response.json();
      
      setApiResponse(data);
      
      // If the initialization was successful, reload specializations
      if (data.status === 'success') {
        loadSpecializations();
      }
    } catch (err) {
      setError(`Failed to initialize specializations: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load specializations from Supabase
  const loadSpecializations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/specializations');
      const data = await response.json();
      
      if (data.status === 'error') {
        setError(data.message);
        return;
      }
      
      setSpecializations(data.specializations || []);
    } catch (err) {
      setError(`Failed to load specializations: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Load specializations on component mount
  useEffect(() => {
    loadSpecializations();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Specializations Management</h1>
              <p className="text-gray-600">Create and manage dog grooming specializations</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/admin" className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md inline-flex items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Admin
              </Link>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="font-semibold text-lg">Specializations Status</h2>
                <p className="text-sm text-gray-600">
                  {specializations.length > 0 ? 
                    `${specializations.length} specializations found` : 
                    'No specializations found'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={loadSpecializations}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md inline-flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={initializeSpecializations}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Initialize Specializations
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* API response message */}
        {apiResponse && (
          <div className={`mb-6 p-4 rounded-md border ${
            apiResponse.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            apiResponse.status === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center mb-2">
              {apiResponse.status === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : apiResponse.status === 'warning' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <h3 className="font-medium">{apiResponse.status.charAt(0).toUpperCase() + apiResponse.status.slice(1)}</h3>
            </div>
            <p>{apiResponse.message}</p>
            
            {/* Additional details */}
            {apiResponse.details && apiResponse.details.length > 0 && (
              <div className="mt-2 text-sm">
                <h4 className="font-medium mb-1">Details:</h4>
                <ul className="list-disc list-inside">
                  {apiResponse.details.map((detail, index) => (
                    <li key={index}>
                      {detail.name ? `${detail.id}: ${detail.name}` : 
                       detail.warning ? `Warning: ${detail.warning}` : 
                       JSON.stringify(detail)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            <div className="flex items-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="font-medium">Error</h3>
            </div>
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Specializations list */}
        {!loading && specializations.length > 0 && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-200">Current Specializations</h2>
            <ul className="divide-y divide-gray-200">
              {specializations.map((specialization) => (
                <li key={specialization.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <SpecializationIcon name={specialization.name} size="small" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium mb-1">{specialization.name}</h3>
                      {specialization.description && (
                        <p className="text-gray-600 text-sm">{specialization.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                        ID: {specialization.id}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && specializations.length === 0 && !error && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No specializations found</h3>
            <p className="text-gray-600 mb-6">You haven't added any specializations yet.</p>
            <button
              onClick={initializeSpecializations}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Initialize Default Specializations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}