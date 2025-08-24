"use client";
import { getCars, deleteCar, updateCarStatus } from "@/actions/cars";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UseFetch from "@/hooks/use-fetch";
import {
  CarIcon,
  Eye,
  Loader,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarIcon,
  StarOff,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/helper";
import { set } from "zod";

const CarsList = () => {
  const [search, setSearch] = React.useState("");
  const [carToDelete, setCarToDelete] = React.useState(null);
  const [deleteDialogOpen,setDeleteDialogOpen] = React.useState(false)
  const router = useRouter();

  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = UseFetch(getCars);

  useEffect(() => {
    fetchCars(search);
  }, [search]);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = UseFetch(deleteCar);

  const {
    loading: updatingCar,
    fn: updateCarStatusFn,
    data: udpateResult,
    error: updateError,
  } = UseFetch(updateCarStatus);

  useEffect(() => {
    if(deleteResult?.success){
      toast.success("Car deleted successfully");
      fetchCars(search);
    }
    if (udpateResult?.success) {
      toast.success("Car status updated successfully");
      fetchCars(search);
    }
  }, [udpateResult, deleteResult, search]);

  useEffect(()=>{
    if(deleteError) toast.error(deleteError.message || String(deleteError));
    if(updateError) toast.error(updateError.message || String(updateError));
    if(carsError) toast.error(carsError.message || String(carsError));
  },[deleteError,updateError,carsError])
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars(search);
  };
  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    await deleteCarFn(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  const getStatusBadge = (status) => {
    const normalized = status?.toUpperCase().trim();
    switch (normalized) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Sold
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {status}
          </Badge>
        );
    }
  };
  const handleToggleFeatured = async (car) => {
    await updateCarStatusFn({
      id: car.id,
      status: car.status,
      featured: !car.featured,
    });
    toast.success(
      `Car ${car.featured ? "unfeatured" : "featured"} successfully`
    );
  };

  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFn({
      id: car.id,
      status: newStatus.toUpperCase(),
    });
    toast.success(`Car status updated to ${newStatus.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Car
        </Button>
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
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of your cars.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>price</TableHead>
                    <TableHead>year</TableHead>
                    <TableHead>status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(carsData?.data) && carsData.data.length > 0 ? (
                    carsData.data.map((car) => {
                      console.log("Car object:", car);
                      console.log("Car status:", car.status);
                      return (
                        <TableRow key={car.id}>
                          <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                            {car.images && car.images.length > 0 ? (
                              <Image
                                src={car.images[0]}
                                alt={`${car.model} ${car.make}`}
                                height={40}
                                width={40}
                                className="w-full h-full object-cover"
                                priority
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <CarIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className={"font-medium"}>
                            {car.make} {car.model}
                          </TableCell>
                          <TableCell>{formatCurrency(car.price)}</TableCell>
                          <TableCell>{car.year}</TableCell>
                          <TableCell>{getStatusBadge(car.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(car)}
                              className="p-0 h-9 w-9"
                              disabled={updatingCar}
                            >
                              {car.featured ? (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              ) : (
                                <Star className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/cars/${car.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                <DropdownMenuLabel>
                                  Status
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                onClick={() => handleStatusUpdate(car, "AVAILABLE")}
                                disabled={
                                  car.status === "AVAILABLE" || updatingCar
                                }
                                >Set Available</DropdownMenuItem>
                                <DropdownMenuItem
                                onClick={() => handleStatusUpdate(car, "UNAVAILABLE")}
                                disabled={
                                  car.status === "UNAVAILABLE" || updatingCar
                                }
                                >Set Unavailble</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(car, "SOLD")}
                                  disabled={car.status === "SOLD" || updatingCar}

                                >Mark as Sold</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                 onClick={() => {setCarToDelete(car); 
                                  setDeleteDialogOpen(true)}}
                                 className={"to-red-600"}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No cars found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <p>Card Content</p>
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this car?{carToDelete?.make}{" "}{carToDelete?.model}
        ({carToDelete?.year})? this action is undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setDeleteDialogOpen(false)}
        disabled={deletingCar}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleDeleteCar}
        disabled={deletingCar}
      >
        {deletingCar ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting Car...
          </>
        ) : (
          "Delete Car"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default CarsList;

