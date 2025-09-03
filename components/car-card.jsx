"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from "./ui/card"
import { CarIcon, Heart, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'
import useFetch from '../hooks/use-fetch'; // default import
import { toggleSavedCar } from '@/actions/car-listing'

const CarCard = ({ car }) => {
    const [saved, setSaved] = useState(car.wishlisted); // merged state
    const router = useRouter();
    const { isSignedIn } = useAuth();

    const { loading: isToggling, fn: toggleSavedCarFn, data: toggleResult, error: toggleError } = useFetch(toggleSavedCar);

    // Handle toggle result
    useEffect(() => {
        if (toggleResult?.success && toggleResult.saved !== saved) {
            setSaved(toggleResult.saved);
            toast.success(toggleResult.message);
        }
    }, [toggleResult, saved]);

    useEffect(() => {
        if (toggleError) {
            toast.error("Failed to update favorites 🥲");
        }
    }, [toggleError]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        if (!isSignedIn) {
            toast.error("You need to be signed in to save a car");
            router.push("/sign-in");
            return;
        }
        if (isToggling) return;
        await toggleSavedCarFn(car.id);
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition group">
            <div className="relative h-48">
                {car.images && car.images.length > 0 ? (
                    <Image
                        src={car.images[0]}
                        alt={`${car.model} ${car.make}`}
                        fill
                        className='object-cover group-hover:scale-105 transition-all duration-300 ease-in-out'
                    />
                ) : (
                    <div className='bg-gray-400 flex items-center justify-center h-full'>
                        <CarIcon className='w-6 h-6' />
                    </div>
                )}

                <Button
                    variant="ghost"
                    className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${saved ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"}`}
                    onClick={handleToggleSave}
                >
                    {isToggling ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <Heart size={20} className={saved ? "fill-current" : ""} />
                    )}
                </Button>
            </div>

            <CardContent className="p-4">
                <div className='flex flex-col mb-2'>
                    <h3 className='text-lg font-bold line-clamp-1'>{car.make} {car.model}</h3>
                    <span className='text-xl font-bold text-blue-600'>
                        {car.price != null ? `$${Number(car.price).toLocaleString()}` : "Price not available"}
                    </span>
                </div>

                <div className='text-gray-600 mb-2 flex items-center'>
                    <span>{car.year}</span>
                    <span className='mx-2'>•</span>
                    <span>{car.transmission}</span>
                    <span className='mx-2'>•</span>
                    <span>{car.fuelType}</span>
                </div>

                <div className='flex flex-wrap gap-2'>
                    <Badge variant="outline" className="bg-gray-50">{car.bodyType}</Badge>
                    <Badge variant="outline" className="bg-gray-50">
                        {car.mileage != null ? `${Number(car.mileage).toLocaleString()} km` : "Mileage N/A"}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50">{car.color}</Badge>
                </div>

                <div className='flex mt-4 justify-between'>
                    <Button className="flex-1" onClick={() => router.push(`/cars/${car.id}`)}>View Car</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default CarCard;