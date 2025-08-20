"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import UseFetch from "@/hooks/use-fetch";
import { addCar, processCarImageWithAI } from "@/actions/cars";
import { useRouter } from "next/navigation";

const fuelType = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissionType = ["Automatic", "Manual", "Semi-automatic"];
const bodyType = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Wagon",
  "Pickup",
];
const carStatus = ["Available", "Unavailable", "Sold"];

const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .string()
    .refine(
      (value) => {
        const year = parseInt(value);
        return (
          !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
        );
      },
      { message: "Valid year is required" }
    ),
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

const AddCarform = () => {
  const [activeTab, setActiveTab] = useState("ai");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [imagePreviews, setImagePreviews] = useState(null);
  const [uploadedAiImages, setUploadedAiImages] = useState(null);

  const router = useRouter();

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    watch,
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

  // AI image drop handler
  const onAiDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5mb");
        return;
      }
      setUploadedAiImages(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreviews(e.target.result);
        toast.success("Image uploaded successfully");
      };
      fileReader.readAsDataURL(file);
    }
  };
  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
      multiple: false,
      maxFiles: 1,
    });

  // Multiple image drop handler
  const onMultiImageInputDrop = (acceptedFiles) => {
    const validFlags = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} size should be less than 5mb`);
        return false;
      }
      return true;
    });
    if (validFlags.length === 0) return;

    const newImages = [];
    validFlags.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validFlags.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success(`Successfully uploaded ${newImages.length} images`);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const { getRootProps: getMultiImageRootProps, getInputProps: getMultiImageInputProps } =
    useDropzone({
      onDrop: onMultiImageInputDrop,
      accept: { "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] },
      multiple: true,
    });

  // Remove image from selected images
  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // UseFetch hook for AI processing
  const {
    loading: processCarImageLoading,
    fn: processCarImageFn,
    data: processCarImageResult,
  } = UseFetch(processCarImageWithAI);

  // Function to trigger AI processing
  const processWithAI = async () => {
    if (!uploadedAiImages) {
      toast.error("Please upload an image");
      return;
    }
    await processCarImageFn(uploadedAiImages);
  };

  // Populate form after AI extraction, switch to manual tab, clear AI upload UI
// Populate form after AI extraction, switch to manual tab, keep image for DB
useEffect(() => {
  if (processCarImageResult?.data) {
    const fieldMap = [
      "make",
      "model",
      "year",
      "price",
      "mileage",
      "color",
      "fuelType",
      "bodyType",
      "transmission",
      "seats",
      "description",
    ];
    fieldMap.forEach((field) => {
      if (
        processCarImageResult.data[field] !== undefined &&
        processCarImageResult.data[field] !== null
      ) {
        setValue(field, String(processCarImageResult.data[field]));
      }
    });

    // ✅ Keep the AI-uploaded image for saving to DB
    if (imagePreviews) {
      setUploadedImages((prev) => [...prev, imagePreviews]);
    }

    // Switch to manual tab after filling
    setActiveTab("manual");
    setImagePreviews(null);
    setUploadedAiImages(null);
  }
}, [processCarImageResult, setValue]);
  // UseFetch hook for adding the car
  const { data: addCarResult, loading: addCarLoading, fn: addCarFn } = UseFetch(addCar);

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [addCarResult, router]);

  // Form submit handler
  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please upload at least one image");
      return;
    }
    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseInt(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
      images: uploadedImages,
    };
    await addCarFn({ carData, images: uploadedImages });
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
            <CardDescription>Enter the details of the car you want to add.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="text-sm text-red-500">{errors.make.message}</span>
                  )}
                </div>

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
                    <span className="text-sm text-red-500">{errors.model.message}</span>
                  )}
                </div>

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
                    <span className="text-sm text-red-500">{errors.year.message}</span>
                  )}
                </div>

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
                    <span className="text-sm text-red-500">{errors.price.message}</span>
                  )}
                </div>

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
                    <span className="text-sm text-red-500">{errors.mileage.message}</span>
                  )}
                </div>

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
                    <span className="text-sm text-red-500">{errors.color.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    onValueChange={(value) => setValue("fuelType", value)}
                    value={watch("fuelType")}
                  >
                    <SelectTrigger
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                        errors.fuelType ? "border-red-500" : "border-gray-300"
                      }`}
                    >
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
                    <span className="text-sm text-red-500">{errors.fuelType.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bodyType">Body Type</Label>
                  <Select
                    onValueChange={(value) => setValue("bodyType", value)}
                    value={watch("bodyType")}
                  >
                    <SelectTrigger
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                        errors.bodyType ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyType.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bodyType && (
                    <p className="text-sm text-red-500">{errors.bodyType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    onValueChange={(value) => setValue("transmission", value)}
                    value={watch("transmission")}
                  >
                    <SelectTrigger
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                        errors.transmission ? "border-red-500" : "border-gray-300"
                      }`}
                    >
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

                <div className="space-y-2">
                  <Label htmlFor="seats">Seats</Label>
                  <input
                    type="number"
                    placeholder="5"
                    id="seats"
                    {...register("seats")}
                    className={`w-full placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                      errors.seats ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.seats && (
                    <span className="text-sm text-red-500">{errors.seats.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value)}
                    value={watch("status")}
                  >
                    <SelectTrigger
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                        errors.status ? "border-red-500" : "border-gray-300"
                      }`}
                    >
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Write a short description of the car..."
                  {...register("description")}
                  className={`w-full h-28 placeholder-gray-400 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <span className="text-sm text-red-500">{errors.description.message}</span>
                )}
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox
                  id="featured"
                  checked={watch("featured")}
                  onCheckedChange={(value) => setValue("featured", value)}
                />
                <div className="space-y-1 leading-none">
                  <Label>Feature this car</Label>
                  <p className="text-sm text-gray-500">
                    Feature Cars appears on the homepage
                  </p>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="images"
                  className={imageError ? "text-red-500" : "text-gray-700"}
                >
                  Images {imageError && <span className="text-red-500 ">*</span>}
                </Label>

                <div
                  {...getMultiImageRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 mt-2"
                >
                  <input {...getMultiImageInputProps()} />
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-center text-gray-700">
                      Drag and drop or click to upload multiple images
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Supported formats: .jpg, .jpeg, .png (max 5MB)
                    </p>
                  </div>
                </div>

                {imageError && (
                  <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}
              </div>
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">
                    Uploaded Images ({uploadedImages.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`Car Image ${index + 1}`}
                          height={50}
                          width={50}
                          className="h-28 w-full object-cover rounded-md"
                          priority
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant={"destructive"}
                          className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={addCarLoading}
              >
                {addCarLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding car...
                  </>
                ) : (
                  "Add Car"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Car Details Extraction</CardTitle>
            <CardDescription>
              Upload an image of a car and let AI extract details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Section */}
              <div>
                {imagePreviews ? (
                  <div className="relative">
                    <Image
                      src={imagePreviews}
                      alt="Uploaded Car"
                      width={300}
                      height={200}
                      className="rounded-md shadow"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreviews(null);
                        setUploadedAiImages(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getAiRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100"
                  >
                    <input {...getAiInputProps()} />
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-center text-gray-700">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Supported formats: .jpg, .jpeg, .png (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Process with AI button */}
              {uploadedAiImages && (
                <Button
                  className="w-full"
                  onClick={processWithAI}
                  disabled={processCarImageLoading}
                >
                  {processCarImageLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    "Extract Details with AI"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AddCarform;
