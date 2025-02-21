
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bed, Building2, Stethoscope, MonitorSmartphone, Plus, Pencil, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  name: string;
  total: number;
  available: number;
  type: 'bed' | 'room' | 'machine' | 'equipment';
  location?: string;
  status: 'operational' | 'maintenance' | 'offline';
}

interface ResourceManagementProps {
  resources: Resource[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ResourceManagement = ({ resources, searchQuery, onSearchChange }: ResourceManagementProps) => {
  const { toast } = useToast();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "bed":
        return Bed;
      case "room":
        return Building2;
      case "machine":
        return MonitorSmartphone;
      case "equipment":
        return Stethoscope;
      default:
        return Stethoscope;
    }
  };

  const handleDelete = (resourceId: string) => {
    // In a real app, this would make an API call
    toast({
      title: "Resource Deleted",
      description: "The resource has been successfully deleted.",
    });
  };

  const handleAddOrUpdate = (isNew: boolean) => {
    // In a real app, this would make an API call
    toast({
      title: isNew ? "Resource Added" : "Resource Updated",
      description: `The resource has been successfully ${isNew ? 'added' : 'updated'}.`,
    });
    setSelectedResource(null);
    setIsEditing(false);
  };

  return (
    <Card className="glass-card col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Hospital Resources</CardTitle>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {isEditing ? "Edit Resource" : "Add New Resource"}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <Input placeholder="Resource Name" defaultValue={selectedResource?.name} />
                <Input 
                  type="number" 
                  placeholder="Total Quantity" 
                  defaultValue={selectedResource?.total}
                />
                <Input 
                  type="number" 
                  placeholder="Available Quantity" 
                  defaultValue={selectedResource?.available}
                />
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  defaultValue={selectedResource?.type}
                >
                  <option value="equipment">Equipment</option>
                  <option value="bed">Bed</option>
                  <option value="room">Room</option>
                  <option value="machine">Machine</option>
                </select>
                <Input placeholder="Location" defaultValue={selectedResource?.location} />
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  defaultValue={selectedResource?.status}
                >
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
                <Button 
                  className="w-full" 
                  onClick={() => handleAddOrUpdate(!isEditing)}
                >
                  {isEditing ? "Update Resource" : "Add Resource"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-muted-foreground">
            Track and manage hospital resources
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = getResourceIcon(resource.type);
            const availabilityPercentage = (resource.available / resource.total) * 100;
            const availabilityColor = 
              availabilityPercentage > 50 ? "bg-green-500" :
              availabilityPercentage > 20 ? "bg-yellow-500" : "bg-red-500";

            return (
              <div
                key={resource.id}
                className="p-4 border rounded-lg bg-white/50 hover-scale"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{resource.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedResource(resource);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">{resource.available} / {resource.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${availabilityColor} transition-all duration-500`}
                      style={{ width: `${availabilityPercentage}%` }}
                    />
                  </div>
                  {resource.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{resource.location}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{resource.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceManagement;
