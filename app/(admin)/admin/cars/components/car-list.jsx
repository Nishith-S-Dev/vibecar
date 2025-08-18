"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CarsList = () => {
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
  <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
      <Input
        className="pl-9 w-full sm:w-60"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  </form>

  <Button
    onClick={() => router.push("/admin/cars/create")}
    className="flex items-center gap-2"
  >
    <Plus className="h-4 w-4" />
    Add Car
  </Button>
</div>
  );
};

export default CarsList;
