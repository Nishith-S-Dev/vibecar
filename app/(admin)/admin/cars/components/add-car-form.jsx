"use client";
import React, { useState } from "react";
import { get, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label"; // ✅ correct import
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const fuelType = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissionType = ["Automatic", "Manual", "Semi-automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Wagon",
  "Pickup",
];
const carStatus = ["Available", "Unavailable", "Sold"];

const AddCarform = () => {
  const [activeTab, setActiveTab] = useState("ai");

  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((value) => {
      const year = parseInt(value);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year is required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission type is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z.string().min(10, "Description is required"),
    status: z.enum(["Available", "Unavailable", "Sold"]).default("Available"),
    featured: z.boolean().default(false),
  });

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "Available",
      featured: false,
    },
  });

  const onSubmit = async (data) => {
    console.log("Form Submitted:", data);
  };

  return (
    <Tabs
      defaultValue="ai"
      className="mt-6"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="ai">AI Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Car</CardTitle>
            <CardDescription>
              Enter the details of the car you want to add.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Make */}
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <input
                    type="text"
                    placeholder="Tata"
                    id="make"
                    {...register("make")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.make ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.make && (
                    <span className="text-sm text-red-500">
                      {errors.make.message}
                    </span>
                  )}
                </div>
                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <input
                    type="text"
                    placeholder="Safari"
                    id="model"
                    {...register("model")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.model ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.model && (
                    <span className="text-sm text-red-500">
                      {errors.model.message}
                    </span>
                  )}
                </div>
                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <input
                    type="number"
                    placeholder="2023"
                    id="year"
                    {...register("year")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.year ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.year && (
                    <span className="text-sm text-red-500">
                      {errors.year.message}
                    </span>
                  )}
                </div>
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <input
                    type="number"
                    placeholder="1000000"
                    id="price"
                    {...register("price")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.price && (
                    <span className="text-sm text-red-500">
                      {errors.price.message}
                    </span>
                  )}
                </div>
                {/* Mileage */}
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <input
                    type="number"
                    placeholder="15000"
                    id="mileage"
                    {...register("mileage")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.mileage ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.mileage && (
                    <span className="text-sm text-red-500">
                      {errors.mileage.message}
                    </span>
                  )}
                </div>
                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <input
                    type="text"
                    placeholder="White"
                    id="color"
                    {...register("color")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.color ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.color && (
                    <span className="text-sm text-red-500">
                      {errors.color.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select onValueChange={(value) => setValue("fuelType", value)} defaultValue={getValues("fuelType")}>
                    <SelectTrigger className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${errors.fuelType ? "border-red-500" : "border-gray-300"}`}>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelType.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuelType && (
                    <span className="text-sm text-red-500">
                      {errors.fuelType.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Transmission */}
  <div className="space-y-2">
    <Label htmlFor="transmission">Transmission</Label>
    <Select onValueChange={(value) => setValue("transmission", value)} defaultValue={getValues("transmission")}>
      <SelectTrigger className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${errors.transmission ? "border-red-500" : "border-gray-300"}`}>
        <SelectValue placeholder="Select transmission" />
      </SelectTrigger>
      <SelectContent>
        {transmissionType.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.transmission && (
      <span className="text-sm text-red-500">{errors.transmission.message}</span>
    )}
  </div>

  {/* Seats */}
  <div className="space-y-2">
    <Label htmlFor="seats">Seats</Label>
    <input
      type="number"
      placeholder="5"
      id="seats"
      {...register("seats")}
      className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${errors.seats ? "border-red-500" : "border-gray-300"}`}
    />
    {errors.seats && (
      <span className="text-sm text-red-500">{errors.seats.message}</span>
    )}
  </div>

  {/* Status */}
  <div className="space-y-2">
    <Label htmlFor="status">Status</Label>
    <Select onValueChange={(value) => setValue("status", value)} defaultValue={getValues("status")}>
      <SelectTrigger className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${errors.status ? "border-red-500" : "border-gray-300"}`}>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {carStatus.map((st) => (
          <SelectItem key={st} value={st}>
            {st}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.status && (
      <span className="text-sm text-red-500">{errors.status.message}</span>
    )}
  </div>
</div>

{/* Description */}
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <textarea
    id="description"
    placeholder="Write a short description of the car..."
    {...register("description")}
    className={`w-full h-28 placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${errors.description ? "border-red-500" : "border-gray-300"}`}
  />
  {errors.description && (
    <span className="text-sm text-red-500">{errors.description.message}</span>
  )}
</div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AddCarform;
