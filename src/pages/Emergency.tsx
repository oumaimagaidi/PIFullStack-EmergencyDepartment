
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Ambulance, Phone, UserCog } from "lucide-react";

interface EmergencyCase {
  id: string;
  patientName: string;
  status: "critical" | "stable" | "moderate";
  location: string;
  timestamp: Date;
}

const emergencyCases: EmergencyCase[] = [
  {
    id: "1",
    patientName: "John Doe",
    status: "critical",
    location: "Emergency Room 1",
    timestamp: new Date(),
  },
  {
    id: "2",
    patientName: "Jane Smith",
    status: "stable",
    location: "Emergency Room 2",
    timestamp: new Date(),
  },
];

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: EmergencyCase["status"]) => {
    switch (status) {
      case "critical":
        return "text-red-500";
      case "moderate":
        return "text-yellow-500";
      case "stable":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Emergency Management</h1>
        <Button variant="destructive" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Declare Emergency
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ambulance className="h-5 w-5 text-red-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Ambulance: 911</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>On-call Doctor: Dr. Smith</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale">
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Emergency Room 1: Available</div>
              <div>Emergency Room 2: Occupied</div>
              <div>Emergency Room 3: Available</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale">
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Available Doctors: 4</div>
              <div>Available Nurses: 8</div>
              <div>Available Beds: 6</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Active Emergency Cases</CardTitle>
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyCases.map((emergency) => (
              <div
                key={emergency.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-white/50"
              >
                <div>
                  <h3 className="font-semibold">{emergency.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {emergency.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${getStatusColor(emergency.status)}`}>
                    {emergency.status.toUpperCase()}
                  </span>
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

export default Emergency;
