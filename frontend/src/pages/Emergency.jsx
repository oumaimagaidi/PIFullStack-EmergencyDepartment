import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Ambulance, Phone, UserCog, X } from "lucide-react";

// Fonction pour récupérer les patients en urgence
const fetchEmergencyPatients = async () => {
    try {
        const response = await fetch("http://localhost:8089/api/emergency-patients"); // Fix URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching emergency cases:", error);
        throw error;
    }
};

const Emergency = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [emergencyCases, setEmergencyCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadEmergencyCases = async () => {
            setLoading(true);
            setError(null);
            try {
                const responseData = await fetchEmergencyPatients();
                console.log(responseData);  // Log la réponse de l'API pour vérifier la structure
                setEmergencyCases(responseData);
            } catch (err) {
                setError("Failed to load emergency cases. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadEmergencyCases();
    }, []);

    const getStatusFromEmergencyLevel = (emergencyLevel) => {
        const statusMap = {
            critical: "critical",
            high: "moderate",
            medium: "stable",
            low: "minor",
        };
        return statusMap[emergencyLevel] || "unknown";
    };

    const getStatusColor = (status) => {
        const colorMap = {
            critical: "text-red-500",
            moderate: "text-yellow-500",
            stable: "text-green-500",
            minor: "text-gray-500",
        };
        return colorMap[status] || "text-gray-500";
    };

    const triageOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    const triagedEmergencyCases = useMemo(() => {
        return [...emergencyCases].sort((a, b) => {
            return (triageOrder[a.emergencyLevel] || 99) - (triageOrder[b.emergencyLevel] || 99);
        });
    }, [emergencyCases]);

    const filteredEmergencyCases = useMemo(() => {
        return triagedEmergencyCases.filter((emergency) =>
            `${emergency.firstName} ${emergency.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, triagedEmergencyCases]);

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    const handleDeletePatient = async (patientId) => {
        if (!patientId) {
            console.error("Patient ID is missing");
            alert("Patient ID is missing");
            return;
        }
        
        if (window.confirm("Are you sure you want to delete this emergency case?")) {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8089/api/emergency-patients/${patientId}`, {
                    method: "DELETE",
                });
    
                if (!response.ok) {
                    throw new Error("Failed to delete the patient.");
                }
    
                // Remove the deleted patient from the state
                setEmergencyCases((prevCases) =>
                    prevCases.filter((emergency) => emergency._id !== patientId) // Utilisation de "_id" ici
                );
                setLoading(false);
            } catch (error) {
                setError("Failed to delete the patient. Please try again.");
                setLoading(false);
            }
        }
    };
    
    const closeModal = () => {
        setSelectedPatient(null);
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Emergency Management</h1>
                <Button variant="destructive" className="gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Declare Emergency
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass-card hover-scale">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ambulance className="h-5 w-5 text-red-500" />
                            Emergency Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>Ambulance: 911</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCog className="h-4 w-4" />
                                <span>On-call Doctor: Dr. Smith</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-scale">
                    <CardHeader>
                        <CardTitle>Available Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>Emergency Room 1: Available</div>
                            <div>Emergency Room 2: Occupied</div>
                            <div>Emergency Room 3: Available</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-scale">
                    <CardHeader>
                        <CardTitle>Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>Available Doctors: 4</div>
                            <div>Available Nurses: 8</div>
                            <div>Available Beds: 6</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Active Emergency Cases</CardTitle>
                    <Input
                        placeholder="Search cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center">Loading emergency cases...</div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : filteredEmergencyCases.length === 0 ? (
                        <div className="text-center">No active emergency cases found.</div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEmergencyCases.map((emergency) => (
                                <div
                                    key={emergency._id} // Assure-toi d'utiliser "_id" ici
                                    className="flex items-center justify-between p-4 border rounded-lg bg-white/50"
                                >
                                    <div>
                                        <h3 className="font-semibold">{emergency.firstName} {emergency.lastName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {emergency.location}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-medium ${getStatusColor(getStatusFromEmergencyLevel(emergency.emergencyLevel))}`}>
                                            {getStatusFromEmergencyLevel(emergency.emergencyLevel).toUpperCase()}
                                        </span>
                                        <Button size="sm" onClick={() => handleViewDetails(emergency)}>View Details</Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeletePatient(emergency._id)} // Utilisation de "_id" ici pour la suppression
                                            className="gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {showModal && selectedPatient && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                            <Button size="icon" variant="ghost" onClick={closeModal}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="mt-4 space-y-3">
                            <p><strong>Location:</strong> {selectedPatient.location}</p>
                            <p><strong>Emergency Level:</strong> {selectedPatient.emergencyLevel.toUpperCase()}</p>
                            <p><strong>Symptoms:</strong> {selectedPatient.symptoms || "Not provided"}</p>
                            <p><strong>Doctor Assigned:</strong> {selectedPatient.assignedDoctor || "Not assigned"}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="secondary" onClick={closeModal}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Emergency;
