import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User, Loader2 } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CalendarComponent = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [emergencyRegistrations, setEmergencyRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(true);

    useEffect(() => {
        const fetchEmergencyRegistrations = async () => {
            setLoadingRegistrations(true);
            try {
                const response = await axios.get("http://localhost:8089/api/emergency-patients", {
                    withCredentials: true,
                });

                console.log("Raw Response Data:", response.data);

                const formattedRegistrations = response.data.map(reg => {
                    let appointmentDate = reg.createdAt ? new Date(reg.createdAt) : null;

                    if (isNaN(appointmentDate.getTime())) {
                        console.warn("Date invalide détectée pour:", reg);
                        appointmentDate = new Date();
                    }

                    return {
                        id: reg._id,
                        patientName: `${reg.firstName} ${reg.lastName} (Urgence - Statut: ${reg.status})`,
                        doctorName: "Urgence",
                        date: appointmentDate,
                        time: appointmentDate.toLocaleTimeString(),
                        type: `Demande d'Urgence - Statut: ${reg.status}`,
                        isEmergency: true,
                        originalData: reg,
                        status: reg.status
                    };
                });

                console.log("Formatted Registrations:", formattedRegistrations);
                setEmergencyRegistrations(formattedRegistrations);
            } catch (error) {
                console.error("Erreur lors de la récupération des enregistrements d'urgence:", error);
                toast.error("Erreur lors du chargement des demandes d'urgence.");
            } finally {
                setLoadingRegistrations(false);
            }
        };

        fetchEmergencyRegistrations();
    }, []);

    useEffect(() => {
        console.log("Emergency Registrations State:", emergencyRegistrations);
    }, [emergencyRegistrations]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const getAppointmentsForSelectedDate = () => {
        return emergencyRegistrations;
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        if (!appointmentId || typeof appointmentId !== "string" || appointmentId.length !== 24) {
            console.error("Invalid appointmentId:", appointmentId);
            toast.error("Impossible de mettre à jour le statut : ID de rendez-vous invalide.");
            return;
        }

        // Map French status to server-expected status
        const statusMap = {
            "Demande Enregistrée": "Demande Enregistrée",
            "En Cours d'Examen": "En Cours d'Examen",
            "Médecin En Route": "Médecin En Route",
            "Traité": "Traité",
            "Annulé": "Annulé"
        };

        const serverStatus = statusMap[newStatus];
        if (!serverStatus) {
            console.error("Invalid status value:", newStatus);
            toast.error("Impossible de mettre à jour le statut : Valeur de statut invalide.");
            return;
        }

        try {
            const payload = { status: serverStatus };
            console.log("Sending PUT request:", { appointmentId, newStatus, serverStatus, payload });

            const response = await axios.put(
                `http://localhost:8089/api/emergency-patients/${appointmentId}/status`,
                payload,
                { withCredentials: true }
            );

            console.log("Status updated:", response.data);
            setEmergencyRegistrations(prevRegistrations =>
                prevRegistrations.map(reg =>
                    reg.id === appointmentId
                        ? { ...reg, status: newStatus, type: `Demande d'Urgence - Statut: ${newStatus}` }
                        : reg
                )
            );

            toast.success("Statut mis à jour avec succès!");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            console.error("Server response:", JSON.stringify(error.response?.data, null, 2));
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur lors de la mise à jour du statut.";
            toast.error("Erreur lors de la mise à jour du statut", { description: errorMessage });
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "Demande Enregistrée": return "default";
            case "En Cours d'Examen": return "secondary";
            case "Médecin En Route": return "outline";
            case "Traité": return "success";
            case "Annulé": return "destructive";
            default: return "default";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: '#42A5FF' }}>Tableau de Bord des Urgences</h1>
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-800">Calendrier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="calendar-container">
                                <Calendar
                                    onChange={handleDateChange}
                                    value={selectedDate}
                                    className="border-none bg-transparent text-gray-800 font-sans rounded-lg"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-800">Demandes d'Urgence Enregistrées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingRegistrations ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <span className="ml-2 text-gray-600">Chargement des demandes d'urgence...</span>
                                </div>
                            ) : emergencyRegistrations.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Aucune demande d'urgence trouvée.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {emergencyRegistrations.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-red-500"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-5 w-5 text-gray-600" />
                                                    <span className="font-medium text-gray-800">{appointment.patientName}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    <span>{appointment.date.toLocaleDateString()}</span>
                                                    <Clock className="h-4 w-4" />
                                                    <span>{appointment.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge
                                                                variant={getStatusBadgeVariant(appointment.status)}
                                                                className="text-xs font-medium"
                                                            >
                                                                {appointment.status}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Statut Actuel</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <Select
                                                    onValueChange={(value) => handleStatusChange(appointment.id, value)}
                                                    defaultValue={appointment.status}
                                                >
                                                    <SelectTrigger className="w-[200px] rounded-md border-gray-200 shadow-sm hover:border-blue-300">
                                                        <SelectValue placeholder="Statut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Demande Enregistrée">Demande Enregistrée</SelectItem>
                                                        <SelectItem value="En Cours d'Examen">En Cours d'Examen</SelectItem>
                                                        <SelectItem value="Médecin En Route">Médecin En Route</SelectItem>
                                                        <SelectItem value="Traité">Traité</SelectItem>
                                                        <SelectItem value="Annulé">Annulé</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-md border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    Détails
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style jsx>{`
                .calendar-container .react-calendar {
                    border: none !important;
                    background: transparent !important;
                    font-family: 'Inter', sans-serif !important;
                }
                .calendar-container .react-calendar__tile {
                    padding: 12px !important;
                    border-radius: 8px !important;
                    transition: background 0.2s, transform 0.2s !important;
                }
                .calendar-container .react-calendar__tile:hover {
                    background: #e0f2fe !important;
                    transform: scale(1.05) !important;
                }
                .calendar-container .react-calendar__tile--active {
                    background: #3b82f6 !important;
                    color: white !important;
                }
                .calendar-container .react-calendar__month-view__days__day--weekend {
                    color: #ef4444 !important;
                }
                .calendar-container .react-calendar__navigation button {
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                    color: #1f2937 !important;
                    padding: 8px !important;
                }
                .calendar-container .react-calendar__navigation button:hover {
                    background: #f3f4f6 !important;
                    border-radius: 8px !important;
                }
            `}</style>
        </div>
    );
};

export default CalendarComponent;