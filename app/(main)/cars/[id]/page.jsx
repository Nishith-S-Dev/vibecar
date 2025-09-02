import React from 'react'
import { getCarById } from '@/actions/car-listing';
import { db } from '@/lib/prisma';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success) {
    return {
      title: "Car not found | Vehiql",
      description: "The requested car could not be found",
    };
  }

  const car = result.data;
  return {
    title: `${car.year} ${car.make} ${car.model} | Vehiql`,
    description: `View details of the ${car.year} ${car.make} ${car.model}`,
    openGraph: {
      title: `${car.year} ${car.make} ${car.model} | Vehiql`,
      description: `View details of the ${car.year} ${car.make} ${car.model}`,
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}

const CarDetailsPage = () => {
  return (
    <div>CarDetailsPage</div>
  )
}

export default CarDetailsPage