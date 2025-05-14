import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, User, Loader2 } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Base styles
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define our color palette for this component
const PALETTE = {
    primaryDark: "#213448",
    secondaryMuted: "#547792",
    pageGradientStart: "#F0F4F8", // Light, clean gradient start
    pageGradientEnd: "#E0E8F0",   // Light, clean gradient end
    cardBaseBg: "bg-white/80", // Base for card, backdrop-filter will be applied
    cardBorder: "border-gray-200/80", // Subtle border for blurred cards
    textColorPrimary: "text-[#213448]",
    textColorSecondary: "text-[#547792]",
    accentBlue: "#42A5F5",      // For main title and highlights
    loaderColor: "text-[#213448]",
    // Calendar specific colors (using !important for react-calendar overrides)
    calendarTileHoverBg: "!bg-[#213448]/10",
    calendarTileActiveBg: "!bg-[#213448]",
    calendarTileActiveText: "!text-white",
    calendarWeekendText: "!text-red-500", // Semantic, keep noticeable
    calendarNavText: `!text-[#213448]`,
    calendarNavHoverBg: `!bg-[#213448]/5`,
    // Badge colors - these will be applied via className
    // Assuming Badge component allows className to override its variant styles for bg/text
    statusColors: {
        "Demande Enregistrée": { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
        "En Cours d'Examen": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
        "Médecin En Route": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
        "Traité": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
        "Annulé": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
        default: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
    }
};

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
                const formattedRegistrations = response.data.map(reg => {
                    let appointmentDate = reg.createdAt ? new Date(reg.createdAt) : new Date(); // Fallback to now if no date
                    if (isNaN(appointmentDate.getTime())) {
                        appointmentDate = new Date(); // Ensure valid date
                    }
                    return {
                        id: reg._id,
                        patientName: `${reg.firstName} ${reg.lastName}`,
                        doctorName: "Urgence", // This seems static for emergency
                        date: appointmentDate,
                        time: appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: `Demande d'Urgence`, // Simplified type, status is separate
                        isEmergency: true,
                        originalData: reg,
                        status: reg.status || "Demande Enregistrée" // Ensure status exists
                    };
                });
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

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    // This function is not currently filtering by selectedDate, it shows all.
    // If you want to filter by selectedDate, you'll need to implement that logic.
    const getAppointmentsForSelectedDate = () => {
        return emergencyRegistrations;
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        if (!appointmentId || typeof appointmentId !== "string" || appointmentId.length !== 24) {
            toast.error("Impossible de mettre à jour le statut : ID de rendez-vous invalide.");
            return;
        }
        // Server expects specific status values. Ensure mapping if frontend values differ.
        // Assuming `newStatus` from SelectItem is already what the server expects.
        try {
            const payload = { status: newStatus };
            await axios.put(
                `http://localhost:8089/api/emergency-patients/${appointmentId}/status`,
                payload,
                { withCredentials: true }
            );
            setEmergencyRegistrations(prevRegistrations =>
                prevRegistrations.map(reg =>
                    reg.id === appointmentId ? { ...reg, status: newStatus } : reg
                )
            );
            toast.success("Statut mis à jour avec succès!");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erreur interne du serveur.";
            toast.error("Erreur lors de la mise à jour du statut", { description: errorMessage });
        }
    };

    const getStatusClasses = (status) => {
        return PALETTE.statusColors[status] || PALETTE.statusColors.default;
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] py-8 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-7xl mx-auto">
                <h1 className={`text-3xl font-extrabold tracking-tight text-[${PALETTE.primaryDark}]`}>
                    Tableau de Bord des Urgences
                </h1>
                <div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]"> {/* Calendar column width adjustment */}
                    <Card className={`${PALETTE.cardBaseBg} backdrop-blur-md shadow-xl rounded-xl ${PALETTE.cardBorder}`}>
                        <CardHeader>
                            <CardTitle className={`text-xl font-semibold ${PALETTE.textColorPrimary}`}>Calendrier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="calendar-container"> {/* For JSX styles */}
                                <Calendar
                                    onChange={handleDateChange}
                                    value={selectedDate}
                                    className={`border-none bg-transparent ${PALETTE.textColorPrimary} font-sans rounded-lg w-full`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`${PALETTE.cardBaseBg} backdrop-blur-md shadow-xl rounded-xl ${PALETTE.cardBorder}`}>
                        <CardHeader>
                            <CardTitle className={`text-xl font-semibold ${PALETTE.textColorPrimary}`}>Demandes d'Urgence Enregistrées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingRegistrations ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className={`h-8 w-8 animate-spin ${PALETTE.loaderColor}`} />
                                    <span className={`ml-3 ${PALETTE.textColorSecondary}`}>Chargement des demandes...</span>
                                </div>
                            ) : getAppointmentsForSelectedDate().length === 0 ? (
                                <div className={`text-center py-12 ${PALETTE.textColorSecondary}`}>
                                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2">Aucune demande d'urgence trouvée.</p>
                                    <p className="text-xs mt-1">Revenez plus tard ou vérifiez les filtres.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {getAppointmentsForSelectedDate().map((appointment) => {
                                        const statusStyle = getStatusClasses(appointment.status);
                                        return (
                                        <div
                                            key={appointment.id}
                                            className={`p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${statusStyle.border}`}
                                        >
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="space-y-1 flex-grow">
                                                    <div className="flex items-center gap-2">
                                                        <User className={`h-5 w-5 ${PALETTE.textColorSecondary}`} />
                                                        <span className={`font-semibold ${PALETTE.textColorPrimary}`}>{appointment.patientName}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-sm ${PALETTE.textColorSecondary}`}>
                                                        <CalendarIcon className="h-4 w-4" />
                                                        <span>{appointment.date.toLocaleDateString()}</span>
                                                        <Clock className="h-4 w-4" />
                                                        <span>{appointment.time}</span>
                                                    </div>
                                                    <p className={`text-xs italic ${PALETTE.textColorSecondary}`}>{appointment.type}</p>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge
                                                                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
                                                                >
                                                                    {appointment.status}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-black text-white rounded-md text-xs">
                                                                <p>Statut Actuel: {appointment.status}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <Select
                                                        onValueChange={(value) => handleStatusChange(appointment.id, value)}
                                                        defaultValue={appointment.status}
                                                    >
                                                        <SelectTrigger className={`w-full sm:w-[180px] rounded-md text-sm ${PALETTE.textColorSecondary} border-gray-300 focus:ring-[${PALETTE.accentBlue}] focus:border-[${PALETTE.accentBlue}] hover:border-gray-400`}>
                                                            <SelectValue placeholder="Changer Statut" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Demande Enregistrée">Demande Enregistrée</SelectItem>
                                                            <SelectItem value="En Cours d'Examen">En Cours d'Examen</SelectItem>
                                                            <SelectItem value="Médecin En Route">Médecin En Route</SelectItem>
                                                            <SelectItem value="Traité">Traité</SelectItem>
                                                            <SelectItem value="Annulé">Annulé</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    {/* Details button can be added back if needed */}
                                                    {/* <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={`rounded-md border-[${PALETTE.accentBlue}]/50 text-[${PALETTE.accentBlue}] hover:bg-[${PALETTE.accentBlue}]/10 transition-colors`}
                                                    >
                                                        Détails
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* JSX Styles for react-calendar */}
            <style jsx global>{`
                .calendar-container .react-calendar {
                    border: none !important;
                    background: transparent !important;
                    font-family: inherit !important; /* Use page font */
                    width: 100% !important;
                }
                .calendar-container .react-calendar__tile {
                    padding: 0.75em 0.5em !important; /* Adjust padding */
                    border-radius: 0.5rem !important; /* Tailwind 'rounded-lg' */
                    transition: background 0.2s, transform 0.2s !important;
                    border: 1px solid transparent !important;
                }
                .calendar-container .react-calendar__tile:enabled:hover,
                .calendar-container .react-calendar__tile:enabled:focus {
                    background: ${PALETTE.calendarTileHoverBg} !important;
                    transform: scale(1.03) !important;
                }
                .calendar-container .react-calendar__tile--now { /* Today's date */
                    background: ${PALETTE.calendarTileHoverBg} !important;
                    font-weight: bold !important;
                }
                .calendar-container .react-calendar__tile--active {
                    background: ${PALETTE.calendarTileActiveBg} !important;
                    color: ${PALETTE.calendarTileActiveText} !important;
                    font-weight: bold !important;
                }
                .calendar-container .react-calendar__month-view__days__day--weekend {
                    color: ${PALETTE.calendarWeekendText} !important; /* e.g., red for weekends */
                }
                .calendar-container .react-calendar__month-view__days__day--neighboringMonth {
                    color: #9ca3af !important; /* Tailwind gray-400 for other month days */
                }
                .calendar-container .react-calendar__navigation button {
                    font-size: 1rem !important;
                    font-weight: 600 !important;
                    color: ${PALETTE.calendarNavText} !important;
                    padding: 0.5em !important;
                    border-radius: 0.375rem !important; /* Tailwind 'rounded-md' */
                }
                .calendar-container .react-calendar__navigation button:enabled:hover,
                .calendar-container .react-calendar__navigation button:enabled:focus {
                    background: ${PALETTE.calendarNavHoverBg} !important;
                }
                .calendar-container .react-calendar__navigation__label {
                    font-weight: bold !important;
                    font-size: 1.1em !important; /* Slightly larger month/year label */
                }
                /* Custom scrollbar for the appointments list */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ccc; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #bbb; 
                }
            `}</style>
        </div>
    );
};

export default CalendarComponent;