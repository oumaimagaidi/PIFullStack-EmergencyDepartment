// src/pages/Staff.jsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, UserCircle, BadgeCheck, Mail, Phone, ToggleLeft, ToggleRight, Filter } from "lucide-react"; // Ajout Filter si manquant
import StaffOverview from "@/components/staff/StaffOverview";
import ResourceManagement from "@/components/staff/ResourceManagement";
import axios from "axios";
import { toast } from "sonner"; // Pour les notifications

// --- Composant StaffDirectory (déplacé à l'intérieur ou importé) ---
const StaffDirectory = ({ staffMembers, searchQuery, onSearchChange, onDoctorAvailabilityChange }) => {
    // Fonction pour la couleur du statut (peut être déplacée hors du composant si utilisée ailleurs)
    const getAvailabilityStyle = (isAvailable) => {
        return isAvailable
            ? { text: "Available", color: "text-green-600", Icon: ToggleRight }
            : { text: "Occupied", color: "text-red-600", Icon: ToggleLeft };
    };

    const filteredStaff = staffMembers.filter(staff =>
        staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.specialization && staff.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card className="glass-card col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Staff Directory</CardTitle>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-8 w-[300px]"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredStaff.length === 0 ? (
                    <p className="text-center text-muted-foreground">No staff found matching your search.</p>
                ) : (
                    <div className="space-y-4">
                        {filteredStaff.map((staff) => {
                            const availability = staff.role === "Doctor" ? getAvailabilityStyle(staff.isAvailable) : null;

                            return (
                                <div
                                    key={staff._id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white/50 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Remplacer UserCircle par l'image si disponible */}
                                        {staff.profileImage ? (
                                            <img src={`http://localhost:8089${staff.profileImage}`} alt={staff.username} className="h-10 w-10 rounded-full object-cover" />
                                        ) : (
                                            <UserCircle className="h-10 w-10 text-primary" />
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{staff.username}</h3>
                                                {staff.isValidated && <BadgeCheck className="h-4 w-4 text-blue-500" title="Validated" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {staff.role} {staff.specialization ? `- ${staff.specialization}` : ''}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {staff.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {staff.phoneNumber}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Section Disponibilité pour les Médecins */}
                                    {staff.role === "Doctor" && availability && (
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onDoctorAvailabilityChange(staff._id, !staff.isAvailable)} title="Click to toggle availability">
                                            <availability.Icon className={`w-6 h-6 ${availability.color}`} />
                                            <span className={`text-sm font-medium ${availability.color}`}>
                                                {availability.text}
                                            </span>
                                        </div>
                                    )}
                                    {/* Afficher autre chose pour les non-médecins si besoin */}
                                    {staff.role !== "Doctor" && (
                                        <span className="text-sm text-gray-400 italic">N/A</span> // Ou rien du tout
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
// --- Fin Composant StaffDirectory ---


const Staff = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [resourcesSearchQuery, setResourcesSearchQuery] = useState(""); // Doit être une string, pas un array
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [staffError, setStaffError] = useState(null);

    // --- Données statiques pour ResourceManagement (peuvent être dynamiques plus tard) ---
    const resources = [
        // ... (vos données de ressources)
          {
            id: "1",
            name: "ICU Beds",
            total: 20,
            available: 8,
            type: "bed",
            location: "ICU Wing",
            status: "operational"
        },
           {
            id: "2",
            name: "Operating Rooms",
            total: 5,
            available: 2,
            type: "room",
            location: "Surgery Wing",
            status: "operational"
        },
           {
            id: "3",
            name: "Ventilators",
            total: 15,
            available: 6,
            type: "machine",
            status: "operational"
        },
           {
            id: "4",
            name: "ECG Machines",
            total: 10,
            available: 4,
            type: "equipment",
            status: "operational"
        }
    ];
    // --- Fin Données statiques ---

    // --- Fonction pour récupérer le staff ---
    const fetchStaff = async () => {
        setLoadingStaff(true);
        setStaffError(null);
        try {
            // Note: Pas besoin de token si on utilise les cookies correctement configurés avec 'withCredentials: true'
            const response = await axios.get('http://localhost:8089/api/users/doctors', { withCredentials: true });
             console.log("Staff data fetched:", response.data); // Log pour vérifier les données
            // Assurez-vous que chaque docteur a une propriété isAvailable (même si undefined au début)
            const staffWithAvailability = response.data.map(staff => ({
                ...staff,
                isAvailable: staff.isAvailable === undefined ? true : staff.isAvailable // Default to true if undefined
            }));
            setStaffMembers(staffWithAvailability);
        } catch (error) {
            console.error("Error fetching staff:", error);
            setStaffError("Failed to load staff data.");
             if (error.response) {
                 console.error("Server responded with status code:", error.response.status);
                 console.error("Response data:", error.response.data);
             } else if (error.request) {
                 console.error("No response received from server:", error.request);
             } else {
                 console.error("Error setting up the request:", error.message);
             }
        } finally {
            setLoadingStaff(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []); // Charger au montage du composant

    // --- Fonction pour modifier la disponibilité du docteur ---
    const handleDoctorAvailabilityChange = async (doctorId, newAvailability) => {
        // Optimistic UI Update: Change l'état local immédiatement
        const originalStaffMembers = [...staffMembers]; // Copie pour rollback
         setStaffMembers(prevStaff => prevStaff.map(staff =>
            staff._id === doctorId ? { ...staff, isAvailable: newAvailability } : staff
        ));

        try {
            // Appel API pour mettre à jour le backend
            const response = await axios.put(`http://localhost:8089/api/users/${doctorId}/availability`,
             { isAvailable: newAvailability },
             { withCredentials: true } // Important pour envoyer les cookies d'authentification
             );

            // Si succès, afficher une notification
            toast.success(response.data.message || `Doctor availability updated successfully.`);
             // Pas besoin de re-fetch, l'état local est déjà à jour.
             // fetchStaff(); // Optionnel: re-fetch pour être sûr à 100%

        } catch (error) {
            console.error("Error updating doctor availability:", error);
             toast.error(`Failed to update availability: ${error.response?.data?.message || error.message}`);
            // Rollback l'état local en cas d'erreur
            setStaffMembers(originalStaffMembers);
        }
    };
    // --- Fin Fonction ---

    return (
        <div className="space-y-6 p-6"> {/* Ajout de padding */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Staff Management</h1>
                {/* Sheet pour ajouter un membre (gardé tel quel) */}
                <Sheet>
                     <SheetTrigger asChild>
                         <Button className="gap-2">
                             <Plus className="h-4 w-4" />
                             Add Staff Member
                         </Button>
                     </SheetTrigger>
                     <SheetContent>
                         <SheetHeader>
                             <SheetTitle>Add New Staff Member</SheetTitle>
                         </SheetHeader>
                         <div className="space-y-4 mt-6">
                             <Input placeholder="Full Name" />
                             <Input placeholder="Role" />
                             <Input placeholder="Department" />
                             <Input placeholder="Email" type="email" />
                             <Input placeholder="Phone" type="tel" />
                             <Button className="w-full">Add Staff Member</Button>
                         </div>
                     </SheetContent>
                 </Sheet>
            </div>

            <StaffOverview /> {/* Composant pour les stats générales */}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Composant pour la gestion des ressources */}
                <ResourceManagement
                    resources={resources}
                    searchQuery={resourcesSearchQuery}
                    onSearchChange={setResourcesSearchQuery} // Attention: Doit être une string
                />

                {/* Composant pour l'annuaire du personnel */}
                 {loadingStaff && <p>Loading staff...</p>}
                 {staffError && <p className="text-red-500">{staffError}</p>}
                 {!loadingStaff && !staffError && (
                     <StaffDirectory
                         staffMembers={staffMembers}
                         searchQuery={searchQuery}
                         onSearchChange={setSearchQuery}
                         onDoctorAvailabilityChange={handleDoctorAvailabilityChange} // Passer la fonction ici
                    />
                 )}
            </div>
        </div>
    );
};

export default Staff;