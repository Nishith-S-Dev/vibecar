"use client";
import React, { useEffect,useState } from "react";
import UseFetch from "@/hooks/use-fetch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Loader2, Save, SaveIcon, Shield } from "lucide-react";
import {
  getDealerShipInfo,
  getUsers,
  saveWorkingHours,
  updateUserRole,
} from "@/actions/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { set } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const {
    loading: fetchingSettings,
    fn: fetchDealerShipInfo,
    data: settingsData,
    error: settingsError,
  } = UseFetch(getDealerShipInfo);
   useEffect(() => {
       if(settingsData?.success && settingsData?.data){
            const dealership = settingsData.data;
           if(dealership.workingHours && dealership.workingHours.length > 0){
            const mappedHours = DAYS.map((day) => {
                const hourData = dealership.workingHours.find((hour) => hour.dayOfWeek.toUpperCase() === day.value);
                if(hourData){
                    return {
                        dayOfWeek: day.value,
                        openTime: hourData.openTime,
                        closeTime: hourData.closeTime,
                        isOpen: hourData.isOpen,
                    }
                }else{
                    return {
                        dayOfWeek: day.value,
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: false,
                    }
                }
            })
            setWorkingHours(mappedHours);
           }
       }
   },[settingsData]);

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

  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = UseFetch(updateUserRole);

  useEffect(() => {
    fetchDealerShipInfo();
    fetchUsers();
  }, []);

  const handleWorkingHoursChange = (index, field, value) => {
   const updateHours = [...workingHours];
   updateHours[index]={
    ...updateHours[index],
    [field]:value,
   };
   setWorkingHours(updateHours);
  };
  const handleSaveHours = async () => {
    await saveHours(workingHours);
  };

  useEffect(() => {
      if(saveResult){
        toast.success("Working hours saved successfully");
        fetchDealerShipInfo();
      }
  },[saveResult]);
  return (
    <div className="space-y-6 w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value="admins">
            <Shield className="h-4 w-4 mr-2" />
            Admins Users
          </TabsTrigger>
        </TabsList>
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
                              handleWorkingHoursChange(index, "openTime", e.target.value);
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
                              handleWorkingHoursChange(index, "closeTime", e.target.value);
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
                <Button onClick={handleSaveHours} disabled={savingHours}>{savingHours?(<>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>):(<>
                <SaveIcon  className="mr-2 h-4 w-4" /> Save Working Hours</>)}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins" className="space-y-6 mt-6">
          Make changes to your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingForm;
