import React from 'react'
import AddCarform from '../components/add-car-form'

export const metadata = {
    title:"Add Car | VibeCar Admin",
    description:"Drive in vibe with AI",
}
const AddCarPage = () => {
  return (
    <div className='p-6'>

        <h1 className='text-2xl font-bold mb-6'>Add new Car</h1>
        <AddCarform/>
    </div>
)
}

export default AddCarPage