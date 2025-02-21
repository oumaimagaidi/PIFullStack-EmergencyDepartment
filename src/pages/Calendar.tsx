import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Calendar from "react-calendar"; // Importer la bibliothèque react-calendar
import 'react-calendar/dist/Calendar.css'; // Importer les styles du calendrier

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  type: string;
}

const appointments: Appointment[] = [
  {
    id: "1",
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    date: new Date(),
    time: "09:00 AM",
    type: "Check-up",
  },
  {
    id: "2",
    patientName: "Jane Smith",
    doctorName: "Dr. Johnson",
    date: new Date(),
    time: "10:30 AM",
    type: "Follow-up",
  },
];

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fonction pour gérer la sélection d'une date
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Schedule Appointment</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <Input placeholder="Patient Name" />
              <Input placeholder="Doctor Name" />
              <Input type="date" />
              <Input type="time" />
              <Input placeholder="Appointment Type" />
              <Button className="w-full">Schedule</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="calendar-widget">
              <Calendar
                onChange={handleDateChange}  // Gérer le changement de date
                value={selectedDate}          // Passer la date sélectionnée
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments
                .filter(appointment => appointment.date.toLocaleDateString() === selectedDate.toLocaleDateString())
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover-scale"
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
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarComponent;
