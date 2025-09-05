"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleSavedCar } from "@/actions/car-listing";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import {
  Calendar,
  Car,
  Currency,
  Fuel,
  Gauge,
  Heart,
  LocateFixed,
  MessageSquare,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UseFetch from "../../../../../hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/helper";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EmiCalculator from "./car-emi-calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

const CarDetails = ({ car, testDriveInfo }) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
    toggleResult,
    error: toggleError,
  } = UseFetch(toggleSavedCar);

  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isWishlisted) {
      setIsWishlisted(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isWishlisted]);

  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to update favorites 🥲");
    }
  }, [toggleError]);

  const handleSaveCar = async (e) => {
    if (!isSignedIn) {
      toast.error("You need to be signed in to save a car");
      router.push("/sign-in");
      return;
    }
    if (savingCar) return;
    await toggleSavedCarFn(car.id);
  };

  const handleShare = () => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Copied to clipboard");
    };

    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this car on VibeCar. ${car.description}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing", error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("You need to be signed in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/cars/${car.id}`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-7/12">
          <div className="aspect-video rounded-lg overflow-hidden relative mb-4">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Car className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          {car.images && car.images.length > 1 ? (
            <div className="flex gap-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-md h-20 w-24 flex-shrink-0 transition ${
                    index === currentImageIndex
                      ? "border-2 border-blue-600"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model}-view${
                      index + 1
                    }`}
                    className="object-cover"
                    fill
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-20 w-24 flex items-center justify-center rounded-md border border-gray-300 text-gray-400">
              No images available
            </div>
          )}
          <div className="flex mt-4 gap-4">
            <Button
              variant="outline"
              className={`flex items-center gap-2 flex-1 ${
                isWishlisted ? "text-red-500" : ""
              }`}
              onClick={handleSaveCar}
              disabled={savingCar}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`}
              />
              {isWishlisted ? "Saved" : "Save as Wishlisted"}
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 flex-1"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              Share
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="my-7">{car.bodyType}</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 my-6">
            <div className="flex items-center gap-2">
              <Gauge className="text-gray-500 h-5 w-5" />
              <span className="text-gray-500">
                {car.mileage.toLocaleString()} miles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="text-gray-500 h-5 w-5" />
              <span className="text-gray-500">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="text-gray-500 h-5 w-5" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Currency className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-medium">EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {formatCurrency(car.price / 60)}
                    </span>{" "}
                    for 60 months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    *Based on $0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>VibeCar Loan Calculator</DialogTitle>
                <EmiCalculator price={car.price} />
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Card className="my-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-lg font-medium mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href="mailto:help@vibeCar.in">
                <Button variant="outline" className="w-full">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookTestDrive}
              disabled={testDriveInfo?.userTestDrive}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {testDriveInfo?.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Description</h3>
            <p className="whitespace-pre-line text-gray-700">{car.description}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4">Features</h3>
            <ul className="grid grid-cols-1 gap-2">
              <li>
                <span className="h-2 w-2 bg-blue-600 rounded-full inline-block mr-2"></span>
                {car.transmission} Transmission
              </li>
              <li>
                <span className="h-2 w-2 bg-blue-600 rounded-full inline-block mr-2"></span>
                {car.fuelType} Engine
              </li>
              <li>
                <span className="h-2 w-2 bg-blue-600 rounded-full inline-block mr-2"></span>
                {car.bodyType} Body Type
              </li>
              {car.seats && (
                <li>
                  <span className="h-2 w-2 bg-blue-600 rounded-full inline-block mr-2"></span>
                  {car.seats} Seats
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-600 rounded-full inline-block mr-2"></span>
                {car.color} Exterior Color
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Specifications</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Make</span>
              <span className="font-medium">{car.make}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Model</span>
              <span className="font-medium">{car.model}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Year</span>
              <span className="font-medium">{car.year}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Body Type</span>
              <span className="font-medium">{car.bodyType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Fuel Type</span>
              <span className="font-medium">{car.fuelType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Transmission</span>
              <span className="font-medium">{car.transmission}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Mileage</span>
              <span className="font-medium">
                {car.mileage.toLocaleString()} miles
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Color</span>
              <span className="font-medium">{car.color}</span>
            </div>
            {car.seats && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{car.seats}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Dealership Location</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex items-start gap-3">
              <LocateFixed className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Vehiql Motors</h4>
                <p className="text-gray-600">
                  {testDriveInfo?.dealership?.address || "Not Available"}
                </p>
                <p className="text-gray-600 mt-1">
                  Phone: {testDriveInfo?.dealership?.phone || "Not Available"}
                </p>
                <p className="text-gray-600">
                  Email: {testDriveInfo?.dealership?.email || "Not Available"}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="md:w-1/2 lg:w-1/3">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <div className="space-y-2">
                {testDriveInfo?.dealership?.workingHours && testDriveInfo.dealership.workingHours.length > 0 ? (
                  testDriveInfo.dealership.workingHours
                    .sort((a, b) => {
                      const days = [
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY",
                        "SUNDAY",
                      ];
                      return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                    })
                    .map((day) => (
                      <div key={day.dayOfWeek} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}
                        </span>
                        <span>
                          {day.isOpen ? `${day.openTime} - ${day.closeTime}` : "Closed"}
                        </span>
                      </div>
                    ))
                ) : (
                  ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day, index) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600">{day}</span>
                      <span>
                        {index < 5 ? "9:00 - 18:00" : index === 5 ? "10:00 - 16:00" : "Closed"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
