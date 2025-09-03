import CarCard from '@/components/car-card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

import Link from 'next/link';
import React from 'react';

const SavedCarsList = ({ initialData }) => {
  // Normalize initialData to always be an array
  const cars = Array.isArray(initialData) ? initialData : initialData?.data || [];

  if (cars.length === 0) {
    return (
      <div>
        <div className='min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50'>
          <Heart className='w-12 h-12 text-gray-400' strokeWidth={1.5} />
        </div>
        <h3 className='text-2xl font-bold'>No Saved Cars</h3>
        <p className='text-gray-500 mb-6 max-w-md'>
          You haven't saved any car yet
        </p>
        <Button asChild>
          <Link href="/cars">Search Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {cars.map((car) => (
        <CarCard 
          key={car.id} 
          car={{ 
            ...car, 
            wishlisted: true, 
            mainImage: car.images && car.images.length > 0 ? car.images[0] : '/placeholder.png' 
          }} 
        />
      ))}
    </div>
  );
};

export default SavedCarsList;