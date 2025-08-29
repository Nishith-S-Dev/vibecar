import { getCarFilters } from "@/actions/car-listing";
import { de } from "date-fns/locale";
import React from "react";
import CarFilters from "./components/car-filters";
import CarListings from "./components/car-listing";

export const metaData = {
  title: "Cars|VibeCar",
  desciption: "Drive in vibe with AI",
};

const CarPage = async () => {
  const filtersData = await getCarFilters();
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Browse Vibe Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          {/* {Filter} */}

          <CarFilters filters={filtersData.filters} />
        </div>

        <div className="flex-1">
          {/* {Listing} */}
          <CarListings />
        </div>
      </div>
    </div>
  );
};

export default CarPage;
