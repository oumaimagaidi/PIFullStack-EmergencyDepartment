
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  UserPlus,
  MessageCircle,
  Search,
  Filter,
  Pencil,
  Trash2,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

interface DoctorPost {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  email: string;
  phone: string;
  availability: string;
  patients: number;
  rating: number;
  posts: DoctorPost[];
  image: string;
}

const initialDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    email: "sarah.j@hospital.com",
    phone: "123-456-7890",
    availability: "Mon, Wed, Fri",
    patients: 45,
    rating: 4.8,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    posts: [
      {
        id: "1",
        title: "New Cardiac Treatment Guidelines",
        content:
          "Recent studies have shown promising results in minimally invasive cardiac procedures. I'll be implementing these techniques starting next week.",
        date: "2024-02-20",
      },
      {
        id: "2",
        title: "Patient Care Update",
        content:
          "Updated post-operative care guidelines for cardiac patients. Please review and implement accordingly.",
        date: "2024-02-18",
      },
    ],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    experience: "12 years",
    email: "michael.c@hospital.com",
    phone: "123-456-7891",
    availability: "Tue, Thu, Sat",
    patients: 38,
    rating: 4.9,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    posts: [
      {
        id: "1",
        title: "Advances in Neurological Research",
        content:
          "Our team has made significant progress in treating neurological disorders using new techniques.",
        date: "2024-02-19",
      },
    ],
  },
];

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    experience: "",
    email: "",
    phone: "",
    availability: "",
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setDoctors(initialDoctors);
      return;
    }
    const filtered = initialDoctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase())
    );
    setDoctors(filtered);
  };

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((doctor) => doctor.id !== id));
  };

  const handleAdd = () => {
    const id = (doctors.length + 1).toString();
    const newDoctorData: Doctor = {
      ...newDoctor,
      id,
      patients: 0,
      rating: 5.0,
      posts: [],
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newDoctor.name}`,
    };
    setDoctors([newDoctorData, ...doctors]);
    setNewDoctor({
      name: "",
      specialty: "",
      experience: "",
      email: "",
      phone: "",
      availability: "",
    });
  };

  const handleUpdate = () => {
    if (editingDoctor) {
      setDoctors(
        doctors.map((d) => (d.id === editingDoctor.id ? editingDoctor : d))
      );
      setEditingDoctor(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Doctors Dashboard</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Doctor</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Input
                placeholder="Full Name"
                value={newDoctor.name}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, name: e.target.value })
                }
              />
              <Input
                placeholder="Specialty"
                value={newDoctor.specialty}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, specialty: e.target.value })
                }
              />
              <Input
                placeholder="Experience (e.g., 5 years)"
                value={newDoctor.experience}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, experience: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newDoctor.email}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, email: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={newDoctor.phone}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, phone: e.target.value })
                }
              />
              <Input
                placeholder="Availability (e.g., Mon, Wed, Fri)"
                value={newDoctor.availability}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, availability: e.target.value })
                }
              />
              <Button onClick={handleAdd} className="w-full">
                Add Doctor
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{doctor.name}</h2>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingDoctor(doctor)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{doctor.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{doctor.phone}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Patients: {doctor.patients}</span>
                  <span>Rating: {doctor.rating}/5.0</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Recent Posts</h3>
                <div className="space-y-2">
                  {doctor.posts.map((post) => (
                    <Card key={post.id} className="p-3">
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {post.date}
                        </span>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingDoctor && (
        <Sheet open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Doctor</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Input
                placeholder="Full Name"
                value={editingDoctor.name}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, name: e.target.value })
                }
              />
              <Input
                placeholder="Specialty"
                value={editingDoctor.specialty}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, specialty: e.target.value })
                }
              />
              <Input
                placeholder="Experience"
                value={editingDoctor.experience}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    experience: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={editingDoctor.email}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, email: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={editingDoctor.phone}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, phone: e.target.value })
                }
              />
              <Input
                placeholder="Availability"
                value={editingDoctor.availability}
                onChange={(e) =>
                  setEditingDoctor({
                    ...editingDoctor,
                    availability: e.target.value,
                  })
                }
              />
              <Button onClick={handleUpdate} className="w-full">
                Update Doctor
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Doctors;
