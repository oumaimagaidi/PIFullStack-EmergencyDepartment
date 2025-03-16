import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaUserMd, FaCalendarAlt, FaClock, FaAmbulance, FaSpinner, FaSyncAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Reusable Appointment Card Component
const AppointmentCard = ({ appointment, onStatusChange }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-300 border-l-4 ${
        appointment.isEmergency ? "border-blue-600" : "border-gray-300"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <FaUserMd className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-lg text-gray-900">{appointment.patientName}</span>
          {appointment.isEmergency && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
              Urgence
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <FaCalendarAlt className="h-4 w-4 text-blue-500" />
          <span>{appointment.date.toLocaleDateString("fr-FR")}</span>
          <FaClock className="h-4 w-4 ml-2 text-blue-500" />
          <span>{appointment.time}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-700">{appointment.type}</span>
        <Select onValueChange={(value) => onStatusChange(appointment.id, value)} defaultValue={appointment.status}>
          <SelectTrigger className="w-[180px] text-sm bg-white border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-md rounded-md">
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
          className="text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-700 transform hover:scale-105 transition-all duration-200"
        >
          Détails
        </Button>
      </div>
    </div>
  );
};

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [emergencyRegistrations, setEmergencyRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Fetch emergency registrations from the backend
  const fetchEmergencyRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const response = await axios.get("http://localhost:8089/api/emergency-patients", {
        withCredentials: true,
      });

      console.log("Raw Response Data:", response.data);

      const formattedRegistrations = response.data.map((reg) => {
        let appointmentDate = reg.createdAt ? new Date(reg.createdAt) : new Date();

        if (isNaN(appointmentDate.getTime())) {
          console.warn("Invalid date detected for:", reg);
          appointmentDate = new Date(); // Fallback to today
        }

        return {
          id: reg._id,
          patientName: `${reg.firstName} ${reg.lastName}`,
          doctorName: "Urgence",
          date: appointmentDate,
          time: appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "Urgence",
          isEmergency: true,
          originalData: reg,
          status: reg.status || "Demande Enregistrée",
        };
      });

      console.log("Formatted Registrations:", formattedRegistrations);
      setEmergencyRegistrations(formattedRegistrations);
      toast.success("Demandes d'urgence chargées avec succès!", {
        style: { background: "#dbeafe", color: "#1e40af" },
      });
    } catch (error) {
      console.error("Error fetching emergency registrations:", error.response?.data || error.message);
      toast.error("Erreur lors du chargement des demandes d'urgence.", {
        action: {
          label: "Réessayer",
          onClick: () => fetchEmergencyRegistrations(),
        },
      });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEmergencyRegistrations();
  }, []);

  // Log state updates for debugging
  useEffect(() => {
    console.log("Emergency Registrations State:", emergencyRegistrations);
  }, [emergencyRegistrations]);

  // Handle calendar date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Filter appointments for the selected date
  const getAppointmentsForSelectedDate = () => {
    return emergencyRegistrations.filter(
      (reg) => reg.date.toDateString() === selectedDate.toDateString()
    );
  };

  // Handle status change for an appointment
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8089/api/emergency-patients/${appointmentId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      console.log("Status updated:", response.data);
      setEmergencyRegistrations((prevRegistrations) =>
        prevRegistrations.map((reg) =>
          reg.id === appointmentId ? { ...reg, status: newStatus } : reg
        )
      );

      toast.success("Statut mis à jour avec succès!", {
        style: { background: "#dbeafe", color: "#1e40af" },
      });
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  return (
    <div className="space-y-8 p-8 bg-gray-100 min-h-screen">
      <div className="grid gap-8 md:grid-cols-[400px_1fr]">
        {/* Calendar Card */}
        <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transform transition-all hover:shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-t-2xl p-6">
            <CardTitle className="text-3xl font-bold flex items-center">
              <FaCalendarAlt className="mr-3 h-7 w-7" /> Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="border-none rounded-lg shadow-inner bg-white text-gray-800 w-full"
              tileClassName={({ date, view }) =>
                view === "month" && date.toDateString() === selectedDate.toDateString()
                  ? "bg-blue-200 text-blue-800 font-semibold rounded-full"
                  : "hover:bg-blue-100 transition-colors duration-200"
              }
            />
          </CardContent>
        </Card>

        {/* Emergency Registrations Card */}
        <Card className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transform transition-all hover:shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-t-2xl p-6 flex justify-between items-center">
            <CardTitle className="text-3xl font-bold flex items-center">
              <FaAmbulance className="mr-3 h-7 w-7" /> Demandes d'Urgence
            </CardTitle>
            <Button
              onClick={fetchEmergencyRegistrations}
              disabled={loadingRegistrations}
              className="bg-white text-blue-700 hover:bg-blue-100 transition-all duration-200"
            >
              <FaSyncAlt className={`mr-2 h-4 w-4 ${loadingRegistrations ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {loadingRegistrations ? (
              <p className="text-center text-gray-600 animate-pulse flex items-center justify-center gap-3">
                <FaSpinner className="h-6 w-6 text-blue-500 animate-spin" />
                Chargement des demandes...
              </p>
            ) : getAppointmentsForSelectedDate().length === 0 ? (
              <p className="text-center text-gray-600 text-lg font-medium">
                Aucune demande d'urgence pour le {selectedDate.toLocaleDateString("fr-FR")}.
              </p>
            ) : (
              <div className="space-y-5">
                {getAppointmentsForSelectedDate().map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusChange={handleStatusChange}
                  />
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