
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import StaffOverview from "@/components/staff/StaffOverview";
import ResourceManagement from "@/components/staff/ResourceManagement";
import StaffDirectory from "@/components/staff/StaffDirectory";

interface StaffMember {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Admin";
  department: string;
  contact: {
    email: string;
    phone: string;
  };
  status: "Active" | "Off Duty" | "On Leave";
}

const staffMembers: StaffMember[] = [
  {
    id: "1",
    name: "Dr. John Smith",
    role: "Doctor",
    department: "Emergency",
    contact: {
      email: "john.smith@hospital.com",
      phone: "123-456-7890",
    },
    status: "Active",
  },
  {
    id: "2",
    name: "Nurse Sarah Johnson",
    role: "Nurse",
    department: "ICU",
    contact: {
      email: "sarah.j@hospital.com",
      phone: "123-456-7891",
    },
    status: "Off Duty",
  },
];

interface Resource {
  id: string;
  name: string;
  total: number;
  available: number;
  type: 'bed' | 'room' | 'machine' | 'equipment';
  location?: string;
  status: 'operational' | 'maintenance' | 'offline';
}

const resources: Resource[] = [
  {
    id: "1",
    name: "ICU Beds",
    total: 20,
    available: 8,
    type: "bed",
    location: "ICU Wing",
    status: "operational"
  },
  {
    id: "2",
    name: "Operating Rooms",
    total: 5,
    available: 2,
    type: "room",
    location: "Surgery Wing",
    status: "operational"
  },
  {
    id: "3",
    name: "Ventilators",
    total: 15,
    available: 6,
    type: "machine",
    status: "operational"
  },
  {
    id: "4",
    name: "ECG Machines",
    total: 10,
    available: 4,
    type: "equipment",
    status: "operational"
  }
];

const Staff = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourcesSearchQuery, setResourcesSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Staff Member
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Staff Member</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Input placeholder="Full Name" />
              <Input placeholder="Role" />
              <Input placeholder="Department" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone" type="tel" />
              <Button className="w-full">Add Staff Member</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <StaffOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <ResourceManagement 
          resources={resources}
          searchQuery={resourcesSearchQuery}
          onSearchChange={setResourcesSearchQuery}
        />

        <StaffDirectory 
          staffMembers={staffMembers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </div>
  );
};

export default Staff;
