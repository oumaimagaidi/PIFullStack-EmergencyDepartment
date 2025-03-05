import { Card } from "@/components/ui/card";
import { Users, Calendar, Bell, Hospital, Pencil, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import "../App.css";
// Static patient data
const initialPatients = [
    { id: "1", name: "John Doe", email: "john@example.com", condition: "Hypertension" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", condition: "Diabetes" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", condition: "Asthma" },
];

// Chart data
const departmentData = [
    { name: "Cardiology", patients: 45 },
    { name: "Neurology", patients: 30 },
    { name: "Pediatrics", patients: 25 },
    { name: "Oncology", patients: 20 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const statsCards = [
    {
        title: "Total Patients",
        value: "1,234",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        title: "Appointments Today",
        value: "48",
        icon: Calendar,
        color: "text-blue-700",
        bg: "bg-blue-50",
    },
    {
        title: "Emergency Cases",
        value: "7",
        icon: Hospital,
        color: "text-red-500",
        bg: "bg-red-50",
    },
    {
        title: "Pending Alerts",
        value: "12",
        icon: Bell,
        color: "text-blue-500",
        bg: "bg-blue-50",
    },
];

const Dashboard = () => {
    const [patients, setPatients] = useState(initialPatients);
    const [editingPatient, setEditingPatient] = useState(null);
    const [newPatient, setNewPatient] = useState({ name: "", email: "", condition: "" });

    const handleDelete = (id) => {
        setPatients(patients.filter(patient => patient.id !== id));
    };

    const handleEdit = (patient) => {
        setEditingPatient({ ...patient });
    };

    const handleUpdate = () => {
        if (editingPatient) {
            setPatients(patients.map(p => p.id === editingPatient.id ? editingPatient : p));
            setEditingPatient(null);
        }
    };

    const handleAdd = () => {
        const id = (patients.length + 1).toString();
        setPatients([...patients, { ...newPatient, id }]);
        setNewPatient({ name: "", email: "", condition: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className="p-6 hover-scale">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} ${stat.bg} p-3 rounded-lg`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-blue-900">{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900">Department Statistics</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="patients" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900">Patient Distribution</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    dataKey="patients"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-900">Patient List</h2>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Patient
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Add New Patient</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 mt-6">
                                <Input
                                    placeholder="Name"
                                    value={newPatient.name}
                                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Email"
                                    type="email"
                                    value={newPatient.email}
                                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                                />
                                <Input
                                    placeholder="Condition"
                                    value={newPatient.condition}
                                    onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                                />
                                <Button onClick={handleAdd} className="w-full">Save Patient</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="space-y-4">
                    {patients.map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            {editingPatient?.id === patient.id ? (
                                <div className="flex-1 flex gap-4">
                                    <Input
                                        value={editingPatient.name}
                                        onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                                    />
                                    <Input
                                        value={editingPatient.email}
                                        onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                                    />
                                    <Input
                                        value={editingPatient.condition}
                                        onChange={(e) => setEditingPatient({ ...editingPatient, condition: e.target.value })}
                                    />
                                    <Button onClick={handleUpdate}>Save</Button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h3 className="font-semibold">{patient.name}</h3>
                                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                                        <p className="text-sm text-blue-600">{patient.condition}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(patient)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDelete(patient.id)}>
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;