// for four server actions
"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDealerShipInfo(){
    try{
        // to validate the user is logged in
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })
        if(!user) throw new Error("User not found");

        // get the dealership info record
        
        let dealership = await db.dealerShipInfo.findFirst({
            include:{
                workingHours:{
                    orderBy:{
                        dayOfWeek:"asc",
                    }
                }
            }
        });
        if(!dealership){
            dealership = await db.dealerShipInfo.create({
                data:{
                    workingHours:{
                        create:[
                            {
                                dayOfWeek:"MONDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"TUESDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"WEDNESDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"THURSDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"FRIDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"SATURDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:true
                            },
                            {
                                dayOfWeek:"SUNDAY",
                                openTime:"08:00",
                                closeTime:"17:00",
                                isOpen:false
                            },
                            
                        ],
                    },
                },
                include:{
                    workingHours:{
                        orderBy:{
                            dayOfWeek:"asc",
                        }
                    }
                }
            })
        }
        return {
            success:true,
            data:{
                ...dealership,
                createdAt:dealership.createdAt.toISOString(),
                updatedAt:dealership.updatedAt.toISOString(),
            }
        }
    }catch(error){
        throw new Error("Error fetching dealership info: " + error.message);
    }
}

export async function saveWorkingHours(workingHours){
    try{
        // to validate the user is logged in
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })
        if(!user || user.role !== "ADMIN") throw new Error("User not found");
        let dealership = await db.dealerShipInfo.findFirst();
        if(!dealership){
            dealership = await db.dealerShipInfo.create({
                data: {}
            });
        }

        await db.workingHour.deleteMany({
            where:{
                dealershipId:dealership.id
            }
        });
        
        for(const hour of workingHours){
            await db.workingHour.create({
                data:{
                    dayOfWeek:hour.dayOfWeek.toUpperCase(),
                    openTime:hour.openTime,
                    closeTime:hour.closeTime,
                    isOpen:hour.isOpen,
                    dealershipId:dealership.id
                }
            })
        }
        revalidatePath("/admin/settings");
        revalidatePath("/");
        return {
            success:true,
        }

    }catch(error){
            throw new Error("Error saving working hours: " + error.message);
        }
}

export  async function getUsers(){
    try{
        // to validate the user is logged in
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })
        if(!user || user.role !== "ADMIN") throw new Error("User not found");
        const users = await db.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return users.map((user) => {
            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            };
        });
        
    }catch(error){
        throw new Error("Error fetching users: " + error.message);
    }
}

export async function updateUserRole(userId,role){
    try{
        // to validate the user is logged in
        const {userId:adminId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {
                clerkUserId: adminId
            }
        })
        if(!user || user.role !== "ADMIN") throw new Error("User not found");
        const updatedUser = await db.user.update({
            where: {
                id: userId,
            },
            data: {
                role,
            },
        });
        revalidatePath("/admin/settings");
        return {
            success:true
        }
    }catch(error){
        throw new Error("Error updating user role: " + error.message);
    }
}