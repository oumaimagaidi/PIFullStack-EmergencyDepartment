import { Card } from "@/components/ui/card";
import { Users, Calendar, Bell, Hospital, UserPlus, Pencil, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import axios from "axios";
import "../App.css";

// Données statiques pour fallback
const initialPatients = [
    {
        _id: "1",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        name: "John Doe",
        dateOfBirth: "1990-01-01",
        gender: "Male",
        address: "123 Main St, City, Country",
        emergencyContact: "9876543210",
        bloodType: "O+",
        allergies: []
    }
];

const departmentData = [
    { name: "Cardiology", patients: 45 },
    { name: "Neurology", patients: 30 },
    { name: "Pediatrics", patients: 25 },
    { name: "Oncology", patients: 20 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientsCount, setPatientsCount] = useState(0);
    const [editingPatient, setEditingPatient] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get("http://localhost:8089/api/users/patients", {
                    withCredentials: true,
                });
                setPatients(response.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des patients:", err);
                setPatients(initialPatients); // Fallback vers les données statiques
                setError("Impossible de récupérer les patients. Affichage des données locales.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        const fetchPatientsCount = async () => {
            try {
                const response = await axios.get("http://localhost:8089/api/users/patients/count", {
                    withCredentials: true,
                });
                setPatientsCount(response.data.count);
            } catch (err) {
                console.error("Erreur lors de la récupération du nombre de patients", err);
            }
        };
        fetchPatientsCount();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8089/api/users/patients/${id}`, {
                withCredentials: true,
            });
            setPatients(patients.filter(patient => patient._id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression du patient:", error);
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient({ ...patient });
    };

    const handleUpdate = async () => {
        if (editingPatient) {
            try {
                await axios.put(`http://localhost:8089/api/users/patients/${editingPatient._id}`, editingPatient, {
                    withCredentials: true,
                });
                setPatients(patients.map(p => p._id === editingPatient._id ? editingPatient : p));
                setEditingPatient(null);
            } catch (error) {
                console.error("Erreur lors de la mise à jour du patient:", error);
            }
        }
    };

    const statsCards = [
        { title: "Total Patients", value: patientsCount.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Appointments Today", value: "48", icon: Calendar, color: "text-blue-700", bg: "bg-blue-50" },
        { title: "Emergency Cases", value: "7", icon: Hospital, color: "text-red-500", bg: "bg-red-50" },
        { title: "Pending Alerts", value: "12", icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
    ];

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
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={departmentData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="patients" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900">Patient Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={departmentData} dataKey="patients" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-900">Patient List</h2>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Chargement des patients...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    <div className="space-y-4">
                        {patients && patients.length > 0 ? (
                            patients.map((patient) => (
                                <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    {editingPatient?._id === patient._id ? (
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
                                                value={editingPatient.bloodType}
                                                onChange={(e) => setEditingPatient({ ...editingPatient, bloodType: e.target.value })}
                                            />
                                            <Button onClick={handleUpdate}>Save</Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="font-semibold">{patient.name}</h3>
                                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                                                <p className="text-sm text-blue-600">{patient.bloodType}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEdit(patient)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(patient._id)}>
                                                    <UserMinus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Aucun patient disponible.</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;