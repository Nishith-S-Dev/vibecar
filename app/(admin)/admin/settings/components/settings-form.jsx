"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import UseFetch from "@/hooks/use-fetch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 
  Clock,
  Loader2,
  Save,
  SaveIcon,
  SearchIcon,
  Shield,
  User2,
  Users,
  UserX,
} from "lucide-react";
import {
  getDealerShipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { success } from "zod";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];
const SettingForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);
  const {
    loading: fetchingSettings,
    fn: fetchDealerShipInfo,
    data: settingsData,
    error: settingsError,
  } = UseFetch(getDealerShipInfo);

  useEffect(() => {
    if (settingsData?.success && settingsData?.data) {
      const dealership = settingsData.data;
      if (dealership.workingHours && dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hourData = dealership.workingHours.find(
            (hour) => hour.dayOfWeek.toUpperCase() === day.value
          );
          if (hourData) {
            return {
              dayOfWeek: day.value,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          } else {
            return {
              dayOfWeek: day.value,
              openTime: "09:00",
              closeTime: "18:00",
              isOpen: false,
            };
          }
        });
        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = UseFetch(saveWorkingHours);

  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = UseFetch(getUsers);

useEffect(() => {
    if (Array.isArray(usersData)) {
      setUsers(usersData);
    }
  }, [usersData]);

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = UseFetch(updateUserRole);

  useEffect(()=>{
    if(settingsError){
      toast.error("Failed to load dealership settings");
    }
    if(usersError){
      toast.error("Failed to load users");
    }
    if(updateRoleError){
      toast.error(`Failed to update user role:${updateRoleError.message}`);
    }
    if(saveError){
      toast.error( `Failed to save working hours:${saveError.message}`);
    }
  },[settingsError,usersError,updateRoleError,saveError])

  useEffect(() => {
    fetchDealerShipInfo();
    fetchUsers();
  }, []);

  const handleWorkingHoursChange = (index, field, value) => {
    const updateHours = [...workingHours];
    updateHours[index] = {
      ...updateHours[index],
      [field]: value,
    };
    setWorkingHours(updateHours);
  };
  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  useEffect(() => {
    if (saveResult) {
      toast.success("Working hours saved successfully");
      fetchDealerShipInfo();
    }
    if(updateRoleResult?.success){
      toast.success("User role updated successfully");
      fetchUsers();
      
    }
  }, [saveResult,updateRoleResult]);


  const handleMakeAdmin =async(user)=>{
    if(
      confirm(
        `Are you sure you want to make ${user.name} an admin ? Admin users can manage dealership settings.`
      )
    ){
      await updateRole(user.clerkUserId, "ADMIN");
    }
  }

  const handleRemoveAdmin =async(user)=>{
    if(
      confirm(
        `Are you sure you want to remove ${user.name} as an admin ? Admin users can manage dealership settings.`
      )
    ){
      await updateRole(user.clerkUserId, "USER");
    }
  }
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Debug logs for users state and filtered users
  console.log("Users state in component:", users);
  console.log("Filtered users:", filteredUsers);

  return (
    <div className="space-y-6 w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
        </TabsList>
        <TabsContent value="admins" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardDescription>
                Manage users with admin privileges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-7 relative gap-3.5">
                <SearchIcon className="h-4 w-4 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
                <Input
                  type={"Search"}
                  placeholder="Search users..."
                  className="pl-9 w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              {fetchingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow >
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.imageUrl ? (
                                  <img
                                    src={user.imageUrl}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                              <span>{user.name || "Unnamed User"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-green-800"
                                  : "bg-gray-800"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {user.role === "ADMIN" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  handleRemoveAdmin(user);
                                }}
                                disabled={updatingRole}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleMakeAdmin(user);
                                }}
                                disabled={updatingRole}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No users found
                  </h3>
                  <p className="text-gray-500">
                    {userSearch
                      ? "No users match your search criteria"
                      : "There are no users registered yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                Set your Dealership's working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.map((day, index) => (
                  <div
                    key={day.value}
                    className="grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50"
                  >
                    <div className="col-span-2 font-medium">{day.label}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Checkbox
                        id={`is-open-${day.value}`}
                        checked={workingHours[index].isOpen}
                        onCheckedChange={(checked) => {
                          handleWorkingHoursChange(index, "isOpen", checked);
                        }}
                      />
                      <Label
                        htmlFor={`is-open-${day.value}`}
                        className="text-sm font-medium text-muted-foreground cursor-pointer"
                      >
                        {workingHours[index].isOpen ? "Open" : "Closed"}
                      </Label>
                    </div>

                    {workingHours[index].isOpen && (
                      <>
                        <div className="col-span-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            type="time"
                            value={workingHours[index]?.openTime}
                            onChange={(e) => {
                              handleWorkingHoursChange(
                                index,
                                "openTime",
                                e.target.value
                              );
                            }}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2 text-center">to</div>
                        <div className="col-span-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <Input
                            type="time"
                            value={workingHours[index]?.closeTime}
                            onChange={(e) => {
                              handleWorkingHoursChange(
                                index,
                                "closeTime",
                                e.target.value
                              );
                            }}
                            className="text-sm"
                          />
                        </div>
                      </>
                    )}

                    {!workingHours[index]?.isOpen && (
                      <div className="col-span-11 md:col-span-8 text-gray-500 italic text-sm">
                        Closed all day
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <Button onClick={handleSaveHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" /> Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingForm;
