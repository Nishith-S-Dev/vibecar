"use client"

import React, { use, useState } from 'react'
import Image from 'next/image'
import { Card,CardContent } from "./ui/card"
import { CarIcon, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { is } from 'date-fns/locale'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'
const CarCard = ({ car }) => {
    // Fallback image if car or images is missing
    const [saved,setSaved]= useState(car.wishlisted)
     const router = useRouter()
    return (
      <Card className="overflow-hidden hover:shadow-lg transition group" >
       <div className="relative h-48">
        {car.images && car.images.length > 0 ?(
            <div>
                <Image 
                src={car.images[0]}
                alt = {`${car.model} ${car.make}`}
                fill
                className='object-cover group-hover:scale-105 transition-all duration-300 ease-in-out'
                
                />
            </div>
        ):(
            <div className='bg-gray-400'>
                <CarIcon className='w-6 h-6' />
            </div>
        )}

        <Button variant={"ghost"} className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${setSaved?"text-red-500 hover:text-red-600":"text-gray-400 hover:text-gray-500"} ` } onClick={() => setSaved(!saved)} >
            <Heart size={20} className={saved ? "fill-current" : ""} />
        </Button>
       </div>

       <CardContent className="p-4">
        <div className='flex flex-col mb-2'>
            <h3 className='text-lg font-bold line-clamp-1'>{car.make} {car.model}</h3>
            <span className='text-xl font-bold text-blue-600'>${car.price.toLocaleString()}</span>
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
            <Badge variant="outline" className="bg-gray-50">{car.mileage.toLocaleString()}</Badge>
            <Badge variant="outline" className="bg-gray-50">{car.color}</Badge>
        </div>
        <div className='flex mt-4 justify-between'>
            <Button className="flex-1" onClick={() => router.push(`/cars/${car.id}`)}> View Car</Button>
        </div>
        
       </CardContent>
      </Card>
    )
}

export default CarCard