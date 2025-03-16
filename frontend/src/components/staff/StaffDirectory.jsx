import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCircle, BadgeCheck, Mail, Phone } from "lucide-react";

const StaffDirectory = ({ staffMembers, searchQuery, onSearchChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-500";
      case "Off Duty":
        return "text-yellow-500";
      case "On Leave":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="glass-card col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Directory</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staffMembers.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover-scale"
            >
              <div className="flex items-center gap-4">
                <UserCircle className="h-10 w-10 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{staff.name}</h3>
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {staff.role} - {staff.department}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {staff.contact.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {staff.contact.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-medium ${getStatusColor(staff.status)}`}>
                  {staff.status}
                </span>
                <Button size="sm">View Profile</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffDirectory;