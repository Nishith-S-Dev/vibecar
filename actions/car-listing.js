import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";



export  async function getCarFilters(){
    try{

    
    const makes = await db.car.findMany({
        where:{status:"AVAILABLE"},
        select:{make:true},
        distinct:["make"],
        orderBy:{make:"asc"}


    })
    const bodyType = await db.car.findMany({
        where:{status:"AVAILABLE"},
        select:{bodyType:true},
        distinct:["bodyType"],
        orderBy:{bodyType:"asc"}


    })
    const fuelType = await db.car.findMany({
        where:{status:"AVAILABLE"},
        select:{fuelType:true},
        distinct:["fuelType"],
        orderBy:{fuelType:"asc"}    


    })
    const transmission = await db.car.findMany({
        where:{status:"AVAILABLE"},
        select:{transmission:true},
        distinct:["transmission"],
        orderBy:{transmission:"asc"}


    })
    const priceAggreations = await db.car.aggregate({
        where:{status:"AVAILABLE"},
        _avg:{price:true},
        _min:{price:true},
        _max:{price:true}
    })
    return {
        success:true,
        data:{

            makes:{makes:makes.map((item)=>item.make)},
            bodyType:bodyType.map((item)=>item.bodyType),
            fuelType:fuelType.map((item)=>item.fuelType),
            transmission:transmission.map((item)=>item.transmission),
            priceRange:{
                min:priceAggreations._min.price?parseFloat(priceAggreations._min.price.toString()):0,
                max:priceAggreations._max.price?parseFloat(priceAggreations._max.price.toString()):100000,
            }
        }
    }
}catch(error){
        throw new Error("Error fetching car filters:" + error.message);
}
}
export async function getCars({
    search="",
    make="",
    bodyType="",
    transmission="",
    minPrice=0,
    maxPrice=Number.MAX_SAFE_INTEGER,
    sortBy="newest",
    fuelType="",
    page=1,
    limit=6
}){try{

const {userId} = await auth();
let dbUser = null;
if(userId){
    dbUser = await db.user.findUnique({
        where: {
            clerkUserId: userId
        }
    });
}
 

let where={
    status:"AVAILABLE"
}
if(search){
    where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },

        { description: { contains: search, mode: "insensitive" } },
   
    ];
}
if(make) where.make={equals:make,mode:"insensitive"};
if(bodyType) where.bodyType={equals:bodyType,mode:"insensitive"};
if(transmission) where.transmission={equals:transmission,mode:"insensitive"};
if(fuelType) where.fuelType={equals:fuelType,mode:"insensitive"};


where.price={
    gte:parseFloat(minPrice)||0,
}
if(maxPrice && maxPrice <Number.MAX_SAFE_INTEGER){
    where.price.lte = parseFloat(maxPrice);
}
 
const skip = (page-1)*limit;
let orderBy={};
switch(sortBy){
    case "priceAsc":
        orderBy={
            price:"asc"
        }
        break;
    case "priceDesc":
        orderBy={
            price:"desc"
        }
        break;
    case "newest":
    default:
        orderBy={
            createdAt:"desc"
        }
        break;
}

const totalCars = await db.car.count({where});
const cars = await db.car.findMany({
    where,
    take:limit,
    skip,
    orderBy
});

let wishlisted = new Set();
if(dbUser){
    const savedCars = await db.savedCar.findMany({
        where:{userId:dbUser.id},
        select:{carId:true}
    });
    wishlisted = new Set(savedCars.map((item)=>item.carId));
}

const serializedCars = cars.map((car) => ({
    ...car,
    isWishlisted: wishlisted.has(car.id)
}));
return{
    success:true,
    data:serializedCars,
    pagination:{
        total:totalCars,
        page,
        limit,
        pages:Math.ceil(totalCars/limit)
    }
}
}catch(error){
 throw new Error("Error fetching cars:" + error.message);

}}

export async function toggleSavedCar(cardId){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        });
        if(!user) throw new Error("User not found");

        const car = await db.car.findUnique({
            where: {
                id: cardId
            }
        });
        if(!car) {
            return{
                success:false,
                error:"Car not found"
            }
        };

        const existingSavedCar = await db.savedCar.findUnique({
            where: {
                userId_carId: {
                    userId:user.id,
                    carId:car.id
                }
            }
        });
        if(existingSavedCar){
            await db.savedCar.delete({
                where: {
                    userId_carId: {
                        userId:user.id,
                        carId:car.id
                    }
                }
            });
            revalidatePath('/saved-cars');
            return{
                success:true,
                saved:false,
                message:"Car removed from favorites"
            }
        }

        await db.savedCar.create({
            data: {
                userId:user.id,
                carId:car.id
            }
        });
        revalidatePath('/saved-cars');
        return{
            success:true,
            saved:true,
            message:"Car added to favorites"
        }
    }catch(error){
        throw new Error("Error saving car:" + error.message);
    }
}