"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// If you have CarFilterControls UI for more filters:
import CarFilterControls from "./filter-controls";

const CarFilters = ({ filters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial values from query params (for deeper filter expansion)
  const currentSortBy = searchParams.get("sortBy") || "newest";

  // Add other filters as needed:
  const currentMake = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
  const currentTransmission = searchParams.get("transmission") || "";
  const currentFuelType = searchParams.get("fuelType") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice"))
    : filters?.priceRange?.min ?? 0;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice"))
    : filters?.priceRange?.max ?? 100000;

  // States for controlled UI
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [make, setMake] = useState(currentMake);
  const [bodyType, setBodyType] = useState(currentBodyType);
  const [fuelType, setFuelType] = useState(currentFuelType);
  const [transmission, setTransmission] = useState(currentTransmission);
  const [priceRange, setPriceRange] = useState({
    min: currentMinPrice,
    max: currentMaxPrice,
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setSortBy(currentSortBy);
    setMake(currentMake);
    setBodyType(currentBodyType);
    setFuelType(currentFuelType);
    setTransmission(currentTransmission);
    setPriceRange({
      min: currentMinPrice,
      max: currentMaxPrice,
    });
  }, [
    currentSortBy,
    currentMake,
    currentBodyType,
    currentTransmission,
    currentFuelType,
    currentMinPrice,
    currentMaxPrice
  ]);

  // Counts how many filters are active
  const activeFilterCount = [
    make,
    bodyType,
    transmission,
    fuelType,
    priceRange.min > (filters?.priceRange?.min ?? 0) ||
      priceRange.max < (filters?.priceRange?.max ?? 100000)
  ].filter(Boolean).length;

  // Build current state for advanced filter controls (expand if needed)
  const currentFilters = {
    make,
    bodyType,
    transmission,
    fuelType,
    priceRangeMin: priceRange.min,
    priceRangeMax: priceRange.max,
  };

  // Filter setter for advanced controls
  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
      default:
        break;
    }
  };

  const handleClearFilter = (filterName) => {
    handleFilterChange(filterName, "");
  };

  // Resets all filters, rebuilds the query string, and navigates
  const clearFilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange({
      min: filters?.priceRange?.min ?? 0,
      max: filters?.priceRange?.max ?? 100000
    });
    setSortBy("newest");

    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(url);
    setIsSheetOpen(false);
  };

  // Applies all filters (sort + others), navigates on change
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (priceRange.min > (filters?.priceRange?.min ?? 0))
      params.set("minPrice", priceRange.min.toString());
    if (priceRange.max < (filters?.priceRange?.max ?? 100000))
      params.set("maxPrice", priceRange.max.toString());
    params.set("sortBy", sortBy);

    const search = searchParams.get("search");
    const page = searchParams.get("page");
    if (search) params.set("search", search);
    if (page && page !== "1") params.set("page", page);

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(url);
    setIsSheetOpen(false);
  };

  // Main render
  return (
    <div className="flex lg:flex-col justify-between gap-4">
      {/* Mobile filter controls (expand as needed) */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant={"outline"} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter{" "}
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[0.625rem] font-medium">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className={"w-full sm:max-w-md overflow-y-auto"}
            >
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <CarFilterControls
                  filters={filters}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterChange}
                  onClearFilter={handleClearFilter}
                />
              </div>
            </SheetContent>
            <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto">
              <Button
                type="button"
                variant={"outline"}
                onClick={clearFilters}
                className={"flex items-center gap-2"}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={applyFilters}
                className={"flex-1"}
              >
                Show Result
              </Button>
            </SheetFooter>
          </Sheet>
        </div>
      </div>
      {/* Sort dropdown (always updates sortBy in route) */}
      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
          const params = new URLSearchParams(searchParams.toString());
          params.set("sortBy", value);

          if (make) params.set("make", make);
          if (bodyType) params.set("bodyType", bodyType);
          if (fuelType) params.set("fuelType", fuelType);
          if (transmission) params.set("transmission", transmission);
          if (priceRange.min > (filters?.priceRange?.min ?? 0))
            params.set("minPrice", priceRange.min.toString());
          if (priceRange.max < (filters?.priceRange?.max ?? 100000))
            params.set("maxPrice", priceRange.max.toString());

          const search = searchParams.get("search");
          const page = searchParams.get("page");
          if (search) params.set("search", search);
          if (page && page !== "1") params.set("page", page);

          const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
          router.push(url);
        }}
      >
        <SelectTrigger className="w-[180px] lg:w-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="priceAsc">Price Low to High</SelectItem>
          <SelectItem value="priceDesc">Price High to Low</SelectItem>
        </SelectContent>
      </Select>
      {/* More desktop filter UI can be placed here */}

      <div className="hidden lg:block sticky top-24">
        <div className="border rouneded-lg overflow-hidden bg-white"></div>

      </div>
    </div>
  );
};

export default CarFilters;
