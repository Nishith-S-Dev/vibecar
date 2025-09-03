import React from 'react'
import CarsList from './components/car-list'
export const metadata = {
    title:"Cars | VibeCar Admin",
    description:"Drive in vibe with AI",
}
const CarsPage = () => {
  return (
    <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Cars management</h1>
        <CarsList/>
    </div>
  )
}

export default CarsPage