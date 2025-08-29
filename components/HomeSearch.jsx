"use client";
import React, { useEffect, useState } from "react";
import UseFetch from "@/hooks/use-fetch";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { processImageSearch } from "@/actions/home";

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const{
    loading:isProcessing,
    fn:processImageFn,
    data:processResult,
    error:processError
  }=UseFetch(processImageSearch)

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please you need to upload an image");
      return;
    }
    await processImageFn(searchImage);
  };

  useEffect(()=>{
    if(processError){
      toast.error("Failed to analyze Image"+(processError.message || "unknown Error"))
    }
  },[processError])
  
  useEffect(()=>{
    if(processResult?.success){
      const params = new URLSearchParams();

      if(processResult.data.make) params.set("make", processResult.data.make);
      if(processResult.data.bodyType) params.set("bodyType", processResult.data.bodyType);
      if(processResult.data.color) params.set("color", processResult.data.color);
      router.push(`/cars?${params.toString()}`);
    }
  },[processResult])

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5mb");
        return;
      }
      setIsUploading(true);
      setSearchImage(file);
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setImagePreview(fileReader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      fileReader.onerror = () => {
        setIsUploading(false);
        toast.error("Something went wrong");
      };
      fileReader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Enter make, model, or use our AI to find the right car"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm pr-20 py-6"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Camera
              size={30}
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className={`rounded-xl p-1 cursor-pointer ${
                isImageSearchActive ? "bg-black text-white" : ""
              }`}
            />
            <Button type="submit" className="bg-black text-white rounded-full px-4 py-2">
              Search
            </Button>
          </div>
        </div>
      </form>

      {isImageSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-blue-300 rounded-md p-6 ">
              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="car preview"
                    className="max-h-56 max-w-full object-contain mb-4"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-3"
                    size="sm"
                    onClick={() => {
                      setImagePreview("");
                      setSearchImage(null);
                      toast.success("Image removed successfully");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-center text-gray-700">
                      {isDragActive && !isDragReject
                        ? "Drop the image here..."
                        : "Drag and drop a car image or click to select one"}
                    </p>
                    {isDragReject && <p className="text-red-500 mt-2">File type not supported</p>}
                    <p className="text-gray-400 text-sm mt-2">
                      Supported formats: .jpg, .jpeg, .png (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <Button type="submit" className="w-full" disabled={isUploading|| isProcessing}>
                {isUploading ? "uploading..." :isProcessing?"Analzying Image": "Search with this image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
