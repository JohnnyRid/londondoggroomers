'use client';

import React from 'react';
import { MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface GroomerMapProps {
  placeId?: string;
  latitude?: number;
  longitude?: number;
  address: string;
  businessName: string;
}

const GroomerMap = ({ placeId, address, businessName }: GroomerMapProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-full">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{businessName}</h3>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-full mt-1">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-700 mb-1">Business Address:</p>
            <p className="text-gray-800">{address || 'London, UK'}</p>
          </div>
        </div>
      </div>
      
      {placeId && (
        <div className="p-3 bg-gray-50 text-center">
          <a 
            href={`https://www.google.com/maps/place/?q=place_id:${placeId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default GroomerMap;
