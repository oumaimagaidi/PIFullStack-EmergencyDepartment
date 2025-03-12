import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

                    // Vérifier que la date est valide
                    if (isNaN(appointmentDate.getTime())) {
                        console.warn("Date invalide détectée pour:", reg);
                        appointmentDate = new Date(); // Fallback à aujourd'hui
                    }

                    return {
                        id: reg._id,
                        patientName: `${reg.firstName} ${reg.lastName} (Urgence - Statut: ${reg.status})`,
                        doctorName: "Urgence",
                        date: appointmentDate, // Utiliser createdAt comme date de l'événement
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
        return emergencyRegistrations.filter(appointment => {
            if (!appointment.date) return false;

            return (
                appointment.date.getFullYear() === selectedDate.getFullYear() &&
                appointment.date.getMonth() === selectedDate.getMonth() &&
                appointment.date.getDate() === selectedDate.getDate()
            );
        });
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await axios.put(
                `http://localhost:8089/api/emergency-patients/${appointmentId}/status`,
                { status: newStatus },
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
            toast.error("Erreur lors de la mise à jour du statut.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="calendar-widget">
                            <Calendar onChange={handleDateChange} value={selectedDate} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Demandes d'Urgence Enregistrées</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingRegistrations ? (
                            <p className="text-center text-gray-500">Chargement des demandes d'urgence...</p>
                        ) : (
                            <div className="space-y-4">
                                {getAppointmentsForSelectedDate().map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={`flex items-center justify-between p-4 border rounded-lg bg-white/50 hover-scale ${appointment.isEmergency ? 'border-red-500' : ''}`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{appointment.patientName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>{appointment.date.toLocaleDateString()}</span>
                                                <Clock className="h-4 w-4 ml-2" />
                                                <span>{appointment.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm">{appointment.type}</span>

                                            <Select
                                                onValueChange={(value) => handleStatusChange(appointment.id, value)}
                                                defaultValue={appointment.status}
                                            >
                                                <SelectTrigger className="w-[180px]">
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

                                            <Button size="sm" variant="outline">
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
    );
};

export default CalendarComponent;
