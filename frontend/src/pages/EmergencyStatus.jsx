import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Stethoscope, Clipboard } from "lucide-react";

const EmergencyStatus = () => {
    const location = useLocation();
    const patientId = location.state?.patientId;

    console.log("[EmergencyStatus] Page Loaded. Patient ID from state:", patientId); // Log 1: Check ID

    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calculating...'); // Initial state
    const [medicalAccess, setMedicalAccess] = useState({
        code: null,
        shouldDisplay: false,
        loading: false,
        error: null
    });

    // --- updateWaitTime Function (with logging) ---
    const updateWaitTime = (status) => {
        // Log 2: Check the exact status value and type received by this function
        console.log(`[updateWaitTime] Checking status: "${status}" (Type: ${typeof status})`);

        let newWaitTime; // Use a temporary variable

        switch (status) {
            // Use the EXACT French strings from your backend
            case 'Demande Enregistrée':
                newWaitTime = "10-20 minutes (En attente d'assignation/examen)";
                break;
            case 'En Cours d\'Examen':
                 newWaitTime = "5-15 minutes (En cours d'examen)";
                 break;
            case 'Médecin Assigné':
                newWaitTime = "5-10 minutes (Médecin notifié)";
                break;
            case 'Médecin En Route':
                newWaitTime = "Dès que possible (Médecin en route)";
                break;
            case 'Traité':
                newWaitTime = "Traitement terminé";
                break;
            case 'Annulé':
                newWaitTime = "Demande annulée";
                break;
            default:
                // Log 3: If no case matched
                console.warn(`[updateWaitTime] Status "${status}" did NOT match any expected case.`);
                newWaitTime = "Indisponible"; // Set default to "Indisponible"
                break;
        }
        // Log 4: Show what value is about to be set
        console.log("[updateWaitTime] Setting estimatedWaitTime state to:", newWaitTime);
        setEstimatedWaitTime(newWaitTime);
    };
    // --- End updateWaitTime ---


    // --- fetchPatientDetails Function (with logging) ---
    const fetchPatientDetails = async () => {
        if (!patientId) {
            setError("Missing patient ID.");
            setLoading(false);
            return;
        }

        // Only set loading true on the initial fetch, not subsequent intervals
        // setLoading(true); // Moved initial setLoading outside interval

        try {
            const response = await axios.get(
                `http://localhost:8089/api/emergency-patients/${patientId}/details`,
                { withCredentials: true }
            );

            // Log 5: Log the entire response data
            console.log("[fetchPatientDetails] API Response Data:", response.data);

            if (response.data && typeof response.data === 'object') {
                setPatientDetails(response.data);
                setError(null);

                // Check if status field exists before calling updateWaitTime
                if (response.data.hasOwnProperty('status')) {
                    updateWaitTime(response.data.status); // Call updateWaitTime with the received status
                } else {
                    console.error("[fetchPatientDetails] API response is missing the 'status' field.");
                    updateWaitTime(undefined); // Trigger default wait time if status is missing
                }
            } else {
                console.error("[fetchPatientDetails] Received invalid data format from API:", response.data);
                setError("Invalid data received from server.");
                setPatientDetails(null);
                updateWaitTime(undefined); // Trigger default wait time
            }

        } catch (err) {
            console.error("[fetchPatientDetails] Error fetching details:", err);
             if (err.response) {
                setError(`Error ${err.response.status}: ${err.response.data?.message || 'Failed to load details'}`);
            } else {
                setError("Network error or server unreachable.");
            }
            setPatientDetails(null);
            updateWaitTime(undefined); // Trigger default wait time on error
        } finally {
             // setLoading(false); // Removed setLoading false here, only set on initial load
        }
    };
    // --- End fetchPatientDetails ---


    // --- fetchMedicalAccessCode Function ---
    const fetchMedicalAccessCode = async () => {
       // ... (keep existing implementation) ...
        if (!patientId) return;
        if (!patientDetails || !['Médecin En Route', 'Traité'].includes(patientDetails.status)) { // Match French status
            return;
        }
        setMedicalAccess(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get( /* ... */ );
            setMedicalAccess({ code: response.data.accessCode, shouldDisplay: response.data.shouldDisplay, loading: false, error: null});
        } catch (err) {
             console.error("Error fetching access code:", err);
             setMedicalAccess(prev => ({ ...prev, loading: false, error: "Unable to retrieve medical access code" }));
        }
    };
    // --- End fetchMedicalAccessCode ---

    // Initial Fetch and Interval Setup
    useEffect(() => {
        if (patientId) {
            console.log("[Effect] patientId found, performing initial fetch.");
            setLoading(true); // Set loading true only for the first fetch
            fetchPatientDetails().finally(() => {
                 console.log("[Effect] Initial fetch complete.");
                 setLoading(false); // Set loading false after initial fetch completes
            });

            const intervalId = setInterval(() => {
                 console.log("[Interval] Fetching details...");
                 fetchPatientDetails();
             }, 15000); // Refresh every 15 seconds

            return () => {
                console.log("[Effect] Cleaning up interval.");
                clearInterval(intervalId);
            };
        } else {
            setError("No patient ID provided.");
            setLoading(false);
        }
    }, [patientId]); // Re-run only if patientId changes

    // Fetch access code when status changes
    useEffect(() => {
        if (patientDetails && patientDetails.status) {
            console.log("[Effect] Status changed or patientDetails loaded, checking for medical code fetch. Status:", patientDetails.status);
             if (['Médecin En Route', 'Traité'].includes(patientDetails.status)) { // Match French Status
                 fetchMedicalAccessCode();
             } else {
                 setMedicalAccess({ code: null, shouldDisplay: false, loading: false, error: null });
             }
        }
    }, [patientDetails?.status]); // Depend only on status


    // --- Render Functions (renderDoctorInfo, renderMedicalAccessCode) ---
    const renderDoctorInfo = () => {
        // ... (keep existing implementation)
    };

    const renderMedicalAccessCode = () => {
       // ... (keep existing implementation)
    };
    // --- End Render Functions ---


    // --- Main Return JSX ---
    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto shadow-lg">
                {/* CardHeader */}
                <CardHeader className="flex flex-col space-y-1 bg-blue-50 p-6 rounded-t-lg">
                    {/* ... */}
                     <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                        <Clock className="mr-2 h-6 w-6 text-blue-600" />
                        Status of Your Emergency Request
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        Track the progress of your request in real time. (Refreshes automatically)
                    </CardDescription>
                </CardHeader>

                {/* CardContent */}
                <CardContent className="space-y-6 p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="text-center p-4">
                            <p className="text-gray-600 animate-pulse">Loading information...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                         <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
                            <p>{error}</p>
                            {!patientId && <p>Please go back and resubmit the form.</p>}
                        </div>
                    )}

                    {/* Success State */}
                    {!loading && !error && patientDetails && (
                        <>
                            {/* Current Status */}
                            <div className="border rounded-md p-6 bg-gray-100">
                                <h4 className="font-semibold mb-2 text-gray-800">Current Status:</h4>
                                <p className="text-xl font-bold text-blue-700">{patientDetails.status || 'N/A'}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Last updated: {patientDetails.updatedAt ? new Date(patientDetails.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>

                             {/* Doctor Info */}
                             {renderDoctorInfo()}

                             {/* Medical Access Code */}
                            {renderMedicalAccessCode()}

                            {/* Estimated Wait Time */}
                            <div className="border rounded-md p-6 bg-blue-100">
                                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-blue-700" /> Estimated Wait Time / Next Step
                                </h4>
                                <p className="text-blue-900">
                                    {/* Display the state variable */}
                                    <span className="font-semibold">{estimatedWaitTime}</span>.
                                </p>
                            </div>

                             {/* Action Buttons */}
                             <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                                {/* ... Buttons ... */}
                                 <Button asChild variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                                    <Link to="/home">Back to Home</Link>
                                </Button>
                                {patientDetails.status !== 'Traité' && patientDetails.status !== 'Annulé' && ( // Match French status
                                    <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link to="/calendar">
                                            <Calendar className="mr-2 h-4 w-4" /> Schedule a Follow-Up Appointment
                                        </Link>
                                    </Button>
                                )}
                             </div>
                        </>
                    )}

                    {/* Fallback if no data and no error */}
                     {!loading && !error && !patientDetails && (
                        <div className="text-center p-4 text-gray-600">
                            {!patientId ? "No patient ID provided." : "Could not load patient details."}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
    // --- End Main Return ---
};

export default EmergencyStatus;