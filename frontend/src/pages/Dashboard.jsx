import { Card } from "@/components/ui/card";
import { Users, Hospital, UserPlus, Pencil, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientsCount, setPatientsCount] = useState(0);
    const [editingPatient, setEditingPatient] = useState(null);
    const [emergencyStats, setEmergencyStats] = useState({
        total: 0,
        today: 0
    });
    const [userStats, setUserStats] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get("http://localhost:8089/api/users/patients", {
                    withCredentials: true,
                });
                setPatients(response.data);
            } catch (err) {
                console.error("Erreur lors de la récupération des patients:", err);
                setPatients(initialPatients);
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

    useEffect(() => {
        const fetchEmergencyStats = async () => {
            try {
                const [totalRes, todayRes] = await Promise.all([
                    axios.get("http://localhost:8089/api/emergency-patients/stats/total", {
                        withCredentials: true,
                    }),
                    axios.get("http://localhost:8089/api/emergency-patients/stats/today", {
                        withCredentials: true,
                    })
                ]);
                setEmergencyStats({
                    total: totalRes.data.total,
                    today: todayRes.data.today
                });
            } catch (err) {
                console.error("Erreur récupération stats urgences:", err);
            }
        };
        fetchEmergencyStats();
    }, []);

    useEffect(() => {
        const fetchUserStatistics = async () => {
            try {
                const response = await axios.get("http://localhost:8089/api/users/stats", {
                    withCredentials: true,
                });
                setUserStats(response.data);
            } catch (err) {
                console.error("Erreur récupération stats utilisateurs:", err);
            }
        };
        fetchUserStatistics();
    }, []);

    const statsCards = [
        { title: "Total Patients", value: patientsCount.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Emergency Cases Today", value: emergencyStats.today.toLocaleString(), icon: Hospital, color: "text-red-500", bg: "bg-red-50" },
        { title: "Total Emergency Cases", value: emergencyStats.total.toLocaleString(), icon: Hospital, color: "text-red-700", bg: "bg-red-100" }
    ];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
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

            <div className="grid gap-6 md:grid-cols-3">
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
                        <BarChart data={userStats}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900">User Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={userStats}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                label={renderCustomizedLabel}
                                labelLine={false}
                            >
                                {userStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-blue-900">Patient List</h2>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Patient
                    </Button>
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