// frontend/src/pages/EmergencyStatus.jsx
import React, { useState, useEffect, useCallback } from 'react'; // useRef retiré si le chatbot n'est plus là
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
// Si vous retirez complètement react-simple-chatbot, retirez aussi ces imports :
// import ChatBot from 'react-simple-chatbot';
// import { ThemeProvider } from 'styled-components';
// --- Fin Chatbot Imports ---
// --- UI Imports ---
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Stethoscope, AlertTriangle, Loader2, Clipboard, User } from "lucide-react"; // MessageSquare retiré si chatbot retiré
// --- Fin UI Imports ---
import ParticlesComponent from "@/components/ParticlesComponent";

// Updated color palette (can remain as is)
const colors = {
  primary: "#213448",
  secondary: "#547792",
  alert: "#dc2626",
  primaryLight: "#94B4C1",
  secondaryLight: "#ECEFCA",
  alertLight: "#fee2e2",
  bgAccent: "#ECEFCA",
}

// Chatbot theme can be removed if ChatBot component is removed
// const chatbotTheme = { ... };

const EmergencyStatus = () => {
    const location = useLocation();
    const patientIdFromState = location.state?.patientId;
    const initialDoctorInfo = location.state?.doctorInfo;

    console.log("[EmergencyStatus] Page Loaded. Patient ID from state:", patientIdFromState);

    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calculating...'); // Anglais
    const [loadingWaitTime, setLoadingWaitTime] = useState(false);
    const [errorWaitTime, setErrorWaitTime] = useState(null);
    const [doctorInfo, setDoctorInfo] = useState(initialDoctorInfo || null);
    const [medicalAccess, setMedicalAccess] = useState({
        code: null,
        shouldDisplay: false,
        loading: false,
        error: null,
    });
    // Chatbot states removed if chatbot functionality is removed
    // const [showChatbot, setShowChatbot] = useState(false);
    // const [chatbotIsProcessing, setChatbotIsProcessing] = useState(false);

    const fetchPatientAndWaitTime = useCallback(async (isInitialLoad = false) => {
        if (!patientIdFromState) {
            setError("Patient ID missing for tracking."); // Anglais
            if (isInitialLoad) setLoading(false);
            setLoadingWaitTime(false);
            return;
        }
        if (!isInitialLoad) { setError(null); setErrorWaitTime(null); }
        setLoadingWaitTime(true);
        try {
            const [detailsResponse, waitTimeResponse] = await Promise.all([
                axios.get(`http://localhost:8089/api/emergency-patients/${patientIdFromState}/details`, { withCredentials: true }),
                axios.get(`http://localhost:8089/api/emergency-patients/${patientIdFromState}/estimated-wait-time`, { withCredentials: true }),
            ]);
            const detailsData = detailsResponse.data;
            if (detailsData && typeof detailsData === 'object') {
                setPatientDetails(detailsData);
                const assignedDoctorData = detailsData.assignedDoctor;
                if (assignedDoctorData) {
                    if (!doctorInfo || doctorInfo._id !== assignedDoctorData._id || doctorInfo.username !== assignedDoctorData.username) {
                        setDoctorInfo(assignedDoctorData);
                    }
                } else if (doctorInfo) {
                    setDoctorInfo(null);
                }
            } else {
                if (isInitialLoad) setError("Invalid patient data format received."); // Anglais
            }
            const waitTimeData = waitTimeResponse.data;
            if (waitTimeData && typeof waitTimeData.estimatedWaitTime === 'string') {
                setEstimatedWaitTime(waitTimeData.estimatedWaitTime);
            } else {
                setEstimatedWaitTime("Unavailable"); // Anglais
            }
        } catch (err) {
            if (isInitialLoad) setError("Could not retrieve details."); // Anglais
            setErrorWaitTime("Could not update estimation."); // Anglais
        } finally {
            if (isInitialLoad) setLoading(false);
            setLoadingWaitTime(false);
        }
    }, [patientIdFromState, doctorInfo]);

    const fetchMedicalAccessCode = useCallback(async () => {
        if (!patientIdFromState || !patientDetails || !patientDetails.status) return;
        const relevantStatuses = ['Médecin En Route', 'Traité']; // These statuses might need translation if they come from DB in French
        if (!relevantStatuses.includes(patientDetails.status)) {
            setMedicalAccess({ code: null, shouldDisplay: false, loading: false, error: null });
            return;
        }
        setMedicalAccess(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get(`http://localhost:8089/api/emergency-patients/${patientIdFromState}/medical-access-code`, { withCredentials: true });
            setMedicalAccess({ code: response.data.accessCode, shouldDisplay: response.data.shouldDisplay ?? false, loading: false, error: null });
        } catch (err) {
            setMedicalAccess(prev => ({ ...prev, loading: false, error: "Could not retrieve access code." })); // Anglais
        }
    }, [patientIdFromState, patientDetails]);


    useEffect(() => {
        if (patientIdFromState) {
            fetchPatientAndWaitTime(true);
            const intervalId = setInterval(() => fetchPatientAndWaitTime(false), 30000);
            return () => clearInterval(intervalId);
        } else {
            setError("No Patient ID provided."); // Anglais
            setLoading(false);
        }
    }, [patientIdFromState, fetchPatientAndWaitTime]); // fetchPatientAndWaitTime added as dependency

    useEffect(() => {
        if (patientDetails?.status && patientIdFromState) {
            fetchMedicalAccessCode();
        }
    }, [patientDetails?.status, patientIdFromState, fetchMedicalAccessCode]);


    const renderDoctorInfo = () => {
        if (loading && !doctorInfo) return <p className="text-sm text-gray-500 italic">Loading doctor info...</p>; // Anglais
        if (!doctorInfo) return <p className="text-sm text-orange-600 italic">Doctor assignment in progress...</p>; // Anglais
        return (
            <div className="border rounded-lg p-4 bg-green-50 text-sm shadow-sm">
                <h4 className="font-semibold mb-2 flex items-center text-green-800">
                    <Stethoscope className="mr-2 h-4 w-4" /> Assigned Doctor
                </h4>
                <p><strong>Name:</strong> {doctorInfo.username || 'N/A'}</p>
                <p><strong>Specialization:</strong> {doctorInfo.specialization || 'N/A'}</p>
                {doctorInfo.email && <p><strong>Contact:</strong> {doctorInfo.email}</p>}
            </div>
        );
    };
    const renderMedicalAccessCode = () => {
        if (medicalAccess.loading) return <p className="text-sm text-gray-500 italic mt-4">Loading code...</p>; // Anglais
        if (medicalAccess.error) return <p className="text-sm text-red-500 mt-4">{medicalAccess.error}</p>;
        if (!medicalAccess.shouldDisplay || !medicalAccess.code) return null;
        return (
            <div className="border rounded-lg p-4 bg-gray-50 mt-4 shadow-sm">
                <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                    <Clipboard className="mr-2 h-4 w-4 text-blue-600" /> Medical Access Code
                </h4>
                <div className="bg-white p-3 rounded-md border border-blue-200 text-center">
                    <p className="text-xl font-bold text-blue-700 tracking-wider">{medicalAccess.code}</p>
                    <p className="text-xs text-gray-500 mt-1">Keep this code safe.</p> {/* Anglais */}
                </div>
            </div>
        );
    };

    // processUserQuery and Chatbot related JSX are removed if chatbot is no longer used here.

    // Translate patient status if it comes from backend in French
    const translateStatus = (status) => {
        const statusMap = {
            "Demande Enregistrée": "Request Registered",
            "En Cours d'Examen": "Under Review",
            "Médecin Assigné": "Doctor Assigned",
            "Médecin En Route": "Doctor En Route",
            "Traité": "Treated",
            "Annulé": "Cancelled"
        };
        return statusMap[status] || status; // Return original if no translation
    };


    return (
        // <ThemeProvider theme={chatbotTheme}> // Remove if ChatBot is removed
        <>
            <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4 md:px-6 relative z-10 bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF]">
                <div className="fixed inset-0 z-0">
                    <ParticlesComponent
                        id="status-particles"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#ECEFCA',
                        }}
                    />
                </div>

                <Card className="max-w-2xl w-full mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
                    <CardHeader className="bg-[#213448] p-6 border-b text-white">
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Clock className="mr-2 h-6 w-6" />
                            Your Emergency Request Status
                        </CardTitle>
                        <CardDescription className="text-[#94B4C1]">
                            Real-time tracking (auto-refresh).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                        {loading ? (
                            <div className="text-center p-6">
                                <Loader2 className="h-8 w-8 animate-spin text-[#547792] mx-auto mb-3" />
                                <p className="text-gray-600">Loading...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : patientDetails ? (
                            <>
                                <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                                    <h4 className="font-semibold mb-1 text-gray-700">Current Status:</h4>
                                    <p className="text-xl font-bold text-[#213448]">{translateStatus(patientDetails.status) || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Last Update: {patientDetails.updatedAt ? new Date(patientDetails.updatedAt).toLocaleString('en-US') : 'N/A'}
                                    </p>
                                </div>
                                {renderDoctorInfo()}
                                <div className="border rounded-lg p-4 bg-[#ECEFCA] shadow-sm">
                                    <h4 className="font-semibold mb-1 text-[#213448] flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-[#547792]" /> Estimated Wait Time / Next Step
                                    </h4>
                                    <div className="flex items-center">
                                        <p className={`text-[#213448] font-semibold ${loadingWaitTime ? 'italic text-gray-500' : ''}`}>
                                            {estimatedWaitTime}
                                        </p>
                                        {loadingWaitTime && <Loader2 className="h-4 w-4 animate-spin text-[#547792] ml-2" />}
                                    </div>
                                    {errorWaitTime && <p className="text-red-500 text-xs mt-1">{errorWaitTime}</p>}
                                </div>
                                {renderMedicalAccessCode()}
                                <div className="text-xs text-gray-600 bg-[#94B4C1] bg-opacity-20 p-3 rounded-md border">
                                    <p className="font-medium mb-1">Important Information:</p>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        {/* Translate status-specific messages if they are static */}
                                        {patientDetails.status === "Demande Enregistrée" && <li>Your request is being reviewed.</li>}
                                        {patientDetails.status === "En Cours d'Examen" && <li>Your situation is being assessed by a professional.</li>}
                                        {patientDetails.status === "Médecin Assigné" && <li>Dr. {doctorInfo?.username || 'The doctor'} has been notified.</li>}
                                        {patientDetails.status === "Médecin En Route" && <li>The doctor is on their way.</li>}
                                        {patientDetails.status === "Traité" && <li>Your care is complete.</li>}
                                        {patientDetails.status === "Annulé" && <li>Your request has been cancelled.</li>}
                                        <li>Stay reachable.</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                                    <Button asChild variant="outline">
                                        <Link to="/home">Home</Link>
                                    </Button>
                                    {!['Traité', 'Annulé'].includes(patientDetails.status) && ( // Compare with original French status from DB or translated status
                                         <Button 
                                            asChild 
                                            variant="default" 
                                            className="text-white"
                                            style={{ backgroundColor: colors.primary }} // Removed hover style from inline for consistency
                                         >
                                            <Link to="/document">
                                               View your medical record
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 text-gray-600">
                                Patient ID missing or data not found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Chatbot section removed */}
            </div>
        {/* </ThemeProvider> // Remove if ChatBot is removed */}
        </>
    );
};

export default EmergencyStatus;