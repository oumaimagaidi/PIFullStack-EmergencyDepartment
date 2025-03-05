import { useState, useEffect } from "react";
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
import axios from 'axios';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [newDoctor, setNewDoctor] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        specialization: "",
        licenseNumber: "",
        badgeNumber: "",
    });

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:8089/api/users/doctors', { withCredentials: true });
            setDoctors(response.data);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            if (error.response) {
                console.error("Server responded with status code:", error.response.status);
                console.error("Response data:", error.response.data);
            } else if (error.request) {
                console.error("No response received from server:", error.request);
            } else {
                console.error("Error setting up the request:", error.message);
            }
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchDoctors();
            return;
        }
        const filtered = doctors.filter(
            (doctor) =>
                doctor.username.toLowerCase().includes(query.toLowerCase()) ||
                doctor.specialization?.toLowerCase().includes(query.toLowerCase())
        );
        setDoctors(filtered);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`/api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchDoctors();
        } catch (error) {
            console.error("Error deleting doctor:", error);
        }
    };

    const handleAdd = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post("/api/auth/register", {
                ...newDoctor,
                role: "Doctor",
                isValidated: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            fetchDoctors();
            setNewDoctor({
                username: "",
                email: "",
                password: "",
                phoneNumber: "",
                specialization: "",
                licenseNumber: "",
                badgeNumber: "",
            });
        } catch (error) {
            console.error("Error adding doctor:", error);
            if (error.response) {
                console.error("Server responded with status code:", error.response.status);
                console.error("Response data:", error.response.data);
            } else if (error.request) {
                console.error("No response received from server:", error.request);
            } else {
                console.error("Error setting up the request:", error.message);
            }
        }
    };

    const handleUpdate = async () => {
        if (editingDoctor) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.put(`/api/users/${editingDoctor._id}`, editingDoctor, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                fetchDoctors();
                setEditingDoctor(null);
            } catch (error) {
                console.error("Error updating doctor:", error);
                if (error.response) {
                    console.error("Server responded with status code:", error.response.status);
                    console.error("Response data:", error.response.data);
                } else if (error.request) {
                    console.error("No response received from server:", error.request);
                } else {
                    console.error("Error setting up the request:", error.message);
                }
            }
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Doctors Dashboard</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2 " />
                            Add Doctor
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add New Doctor</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 mt-6">
                            <Input
                                placeholder="Username"
                                value={newDoctor.username}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, username: e.target.value })
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
                                placeholder="Password"
                                type="password"
                                value={newDoctor.password}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, password: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Phone Number"
                                value={newDoctor.phoneNumber}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Specialization"
                                value={newDoctor.specialization}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, specialization: e.target.value })
                                }
                            />
                            <Input
                                placeholder="License Number"
                                value={newDoctor.licenseNumber}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Badge Number"
                                value={newDoctor.badgeNumber}
                                onChange={(e) =>
                                    setNewDoctor({ ...newDoctor, badgeNumber: e.target.value })
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
                    <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={`http://localhost:8089${doctor.profileImage}`}
                                        alt={doctor.username}
                                        className="w-16 h-16 rounded-full"
                                    />
                                    <div>
                                        <h2 className="text-xl font-semibold">{doctor.username}</h2>
                                        <p className="text-muted-foreground">{doctor.specialization}</p>
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
                                        onClick={() => handleDelete(doctor._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">Badge:</span>
                                    <span>{doctor.badgeNumber || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold">License:</span>
                                    <span>{doctor.licenseNumber || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>{doctor.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{doctor.phoneNumber}</span>
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
                                placeholder="Username"
                                value={editingDoctor.username}
                                onChange={(e) =>
                                    setEditingDoctor({ ...editingDoctor, username: e.target.value })
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
                                placeholder="Phone Number"
                                value={editingDoctor.phoneNumber}
                                onChange={(e) =>
                                    setEditingDoctor({ ...editingDoctor, phoneNumber: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Specialty"
                                value={editingDoctor.specialization}
                                onChange={(e) =>
                                    setEditingDoctor({ ...editingDoctor, specialization: e.target.value })
                                }
                            />
                            <Input
                                placeholder="License Number"
                                value={editingDoctor.licenseNumber}
                                onChange={(e) =>
                                    setEditingDoctor({
                                        ...editingDoctor,
                                        licenseNumber: e.target.value,
                                    })
                                }
                            />
                            <Input
                                placeholder="Badge Number"
                                value={editingDoctor.badgeNumber}
                                onChange={(e) =>
                                    setEditingDoctor({
                                        ...editingDoctor,
                                        badgeNumber: e.target.value,
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