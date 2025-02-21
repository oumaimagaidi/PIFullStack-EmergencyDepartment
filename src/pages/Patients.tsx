
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, UserPlus } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: Date;
  condition: string;
}

const patients: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    age: 45,
    status: "Stable",
    lastVisit: new Date(),
    condition: "Hypertension",
  },
  {
    id: "2",
    name: "Jane Smith",
    age: 32,
    status: "Under Treatment",
    lastVisit: new Date(),
    condition: "Diabetes",
  },
];

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Patient
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Patient</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Input placeholder="Full Name" />
              <Input placeholder="Age" type="number" />
              <Input placeholder="Condition" />
              <Button className="w-full">Save Patient</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient List</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover-scale"
              >
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Age: {patient.age} | Condition: {patient.condition}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{patient.status}</span>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Patients;
