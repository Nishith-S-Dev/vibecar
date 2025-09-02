import { getSavedCars } from '@/actions/car-listing';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/dist/server/api-utils';
import React from 'react'
import SavedCarsList from './components/saved-cars-list';
auth
const SavedCarsPage = async () => {
    const {userId}= await auth();
    if(!userId){
        redirect("/sign-in?redirect=/saved-cars")
    }
    const savedCarsResult = await getSavedCars();
  return (
    <div className='cointainer mx-auto px-4 py-12'>
        <h1 className='text-6xl mb-6 gradient-title'>your Saved Cars</h1>
        <SavedCarsList initialData={savedCarsResult}/>
    </div>
  )
}

export default SavedCarsPage