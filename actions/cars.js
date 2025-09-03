"use server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { serializeCar } from "@/lib/helper";
import { success } from "zod";
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}
export async function processCarImageWithAI(file) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };
    const prompt = `
            Analyze this car image and extract the following information:
            1. Make(manufacturer)
            2. Model
            3. Year
            4. Color
            5. Body Type (suv,sedan,Hatchback,etc.)
            6. Mileage
            7. Fuel Type (your best guess)
            8. Transmission type (your best guess)
            9. Price (your best guess)
            10. Seats (estimate if visible)
            11. Short Description as to be added to a car listing


            Format your response as a clean JSON object with these fields:
            
            {
            "make":"",
            "model":"",
            "year":0000,
            "color":"",
            "price":"",
            "mileage":"",
            "bodyType":"",
            "fuelType":"",
            "transmission":"",
            "seats":"",
            "description":"",
            "confidence":0.00
            }

            For confidence ,proivide a value between 0 and 1 representing how confident you are in your overall identification.
            only respond with the JSON object , nothing else

            `;
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    try {
      const carDetails = JSON.parse(cleanedText);
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "seats",
        "description",
        "confidence",
      ];
      const missingFiedls = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFiedls.length > 0) {
        throw new Error(
          `AI response is missing required fields: ${missingFiedls.join(", ")}`
        );
      }
      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      console.log("Failed to parse AI response:", error);
      return {
        sucess: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    throw new Error("Gemini API error:" + error.message);
  }
}

export async function addCar({ carData, images }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
    const carId = uuidv4();
    const folderpath = `/cars/${carId}`;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Ensure bucket exists
    const bucketName = "cars-images";
    const { data: bucketList, error: bucketError } =
      await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("Error fetching bucket list:", bucketError);
      throw new Error("Error checking storage buckets: " + bucketError.message);
    }
    const bucketExists = bucketList.some(
      (bucket) => bucket.name === bucketName
    );
    if (!bucketExists) {
      throw new Error(
        `Bucket "${bucketName}" not found. Please create it in Supabase Dashboard.`
      );
    }

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.log("skipping invalid image data");
        continue;
      }
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // for the file exetension
      const mimeMatch = base64.match(/data:image\/([a-zA-Z0-9`]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderpath}/${fileName}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });
      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Error uploading image: ${error.message}`);
      }
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;
      imageUrls.push(publicUrl);
    }
    if (imageUrls.length === 0) throw new Error("No valid images uploaded");

    const car = await db.car.create({
      data: {
        id: carId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        bodyType: carData.bodyType,
        price: carData.price,
        mileage: carData.mileage,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        description: carData.description,
        confidence: carData.confidence,
        images: imageUrls,
      },
    });

    revalidatePath(`/admin/cars`);
    return {
      success: true,
      data: car,
    };
  } catch (error) {
    throw new Error("Failed to add car:" + error.message);
  }
}
export async function getCars(search = "") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("unauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
    let where = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },

        { color: { contains: search, mode: "insensitive" } },
      ];
    }
    const cars = await db.car.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
    const serializedCars = cars.map(serializeCar);
    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteCar(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Uniauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");
    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    await db.car.delete({
      where: { id },
    });
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-images")
          .remove(filePaths);
      
      if (error) {
        console.error("Error deleting images:", error);
      }
    }
    } catch (storageError) {
      console.error("Error with Storage operatons :", storageError);
    }

    revalidatePath(`/admin/cars`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCarStatus({ id, status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Uniauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (featured !== undefined) {
      updateData.featured = featured;
    }
    const car = await db.car.update({
      where: { id },
      data: updateData,
    });
    revalidatePath(`/admin/cars`);
    return {
      success: true,
      data: car,
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
