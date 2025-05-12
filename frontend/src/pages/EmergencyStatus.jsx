// frontend/src/pages/EmergencyStatus.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
// --- Chatbot Imports ---
import ChatBot from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
// --- Fin Chatbot Imports ---
// --- UI Imports ---
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Stethoscope, Calendar, AlertTriangle, Loader2, MessageSquare, Clipboard, User } from "lucide-react";
// --- Fin UI Imports ---
import ParticlesComponent from "@/components/ParticlesComponent"; // <-- Import ParticlesComponent

// --- Thème Chatbot ---
const chatbotTheme = {
    background: '#f5f8fb',
    fontFamily: 'Arial, Helvetica, sans-serif',
    headerBgColor: '#1d4ed8',
    headerFontColor: '#ffffff',
    headerFontSize: '15px',
    botBubbleColor: '#1d4ed8',
    botFontColor: '#ffffff',
    userBubbleColor: '#ffffff',
    userFontColor: '#4a4a4a',
};
// --- Fin Thème ---

const EmergencyStatus = () => {
    const location = useLocation();
    const patientIdFromState = location.state?.patientId;
    const initialDoctorInfo = location.state?.doctorInfo;

    console.log("[EmergencyStatus] Page Loaded. Patient ID from state:", patientIdFromState);

    // --- États du composant ---
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...');
    const [loadingWaitTime, setLoadingWaitTime] = useState(false);
    const [errorWaitTime, setErrorWaitTime] = useState(null);
    const [doctorInfo, setDoctorInfo] = useState(initialDoctorInfo || null);
    const [medicalAccess, setMedicalAccess] = useState({
        code: null,
        shouldDisplay: false,
        loading: false,
        error: null,
    });
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatbotIsProcessing, setChatbotIsProcessing] = useState(false);
    // --- Fin États ---

    // --- Fonctions Fetch (UNCHANGED) ---
    const fetchPatientAndWaitTime = useCallback(async (isInitialLoad = false) => {
        if (!patientIdFromState) {
            setError("ID Patient manquant pour le suivi.");
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
                if (isInitialLoad) setError("Format de données patient invalide reçu.");
            }
            const waitTimeData = waitTimeResponse.data;
            if (waitTimeData && typeof waitTimeData.estimatedWaitTime === 'string') {
                setEstimatedWaitTime(waitTimeData.estimatedWaitTime);
            } else {
                setEstimatedWaitTime("Indisponible");
            }
        } catch (err) {
            if (isInitialLoad) setError("Impossible de récupérer les détails.");
            setErrorWaitTime("Impossible de mettre à jour l'estimation.");
        } finally {
            if (isInitialLoad) setLoading(false);
            setLoadingWaitTime(false);
        }
    }, [patientIdFromState, doctorInfo]); // Added doctorInfo to dependencies for comparison

    const fetchMedicalAccessCode = useCallback(async () => {
        if (!patientIdFromState || !patientDetails || !patientDetails.status) return;
        const relevantStatuses = ['Médecin En Route', 'Traité'];
        if (!relevantStatuses.includes(patientDetails.status)) {
            setMedicalAccess({ code: null, shouldDisplay: false, loading: false, error: null });
            return;
        }
        setMedicalAccess(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get(`http://localhost:8089/api/emergency-patients/${patientIdFromState}/medical-access-code`, { withCredentials: true });
            setMedicalAccess({ code: response.data.accessCode, shouldDisplay: response.data.shouldDisplay ?? false, loading: false, error: null });
        } catch (err) {
            setMedicalAccess(prev => ({ ...prev, loading: false, error: "Impossible de récupérer le code d'accès." }));
        }
    }, [patientIdFromState, patientDetails]); // Dependencies updated


    useEffect(() => {
        if (patientIdFromState) {
            fetchPatientAndWaitTime(true); // Initial load
            const intervalId = setInterval(() => fetchPatientAndWaitTime(false), 30000); // Periodic fetch
            return () => clearInterval(intervalId); // Cleanup on unmount
        } else {
            setError("Aucun ID patient fourni.");
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientIdFromState]); // Run only when patientId changes

    useEffect(() => {
        // Fetch medical code only when status changes to relevant ones or on initial load if relevant
        if (patientDetails?.status && patientIdFromState) {
            fetchMedicalAccessCode();
        }
    }, [patientDetails?.status, patientIdFromState, fetchMedicalAccessCode]); // Dependency on the memoized function


    // --- Fonctions de Rendu (UNCHANGED) ---
    const renderDoctorInfo = () => {
        if (loading && !doctorInfo) return <p className="text-sm text-gray-500 italic">Chargement info médecin...</p>;
        if (!doctorInfo) return <p className="text-sm text-orange-600 italic">Assignation du médecin en cours...</p>;
        return (
            <div className="border rounded-lg p-4 bg-green-50 text-sm shadow-sm">
                <h4 className="font-semibold mb-2 flex items-center text-green-800">
                    <Stethoscope className="mr-2 h-4 w-4" /> Médecin Assigné
                </h4>
                <p><strong>Nom:</strong> {doctorInfo.username || 'N/A'}</p>
                <p><strong>Spécialisation:</strong> {doctorInfo.specialization || 'N/A'}</p>
                {doctorInfo.email && <p><strong>Contact:</strong> {doctorInfo.email}</p>}
            </div>
        );
    };
    const renderMedicalAccessCode = () => {
        if (medicalAccess.loading) return <p className="text-sm text-gray-500 italic mt-4">Chargement du code...</p>;
        if (medicalAccess.error) return <p className="text-sm text-red-500 mt-4">{medicalAccess.error}</p>;
        if (!medicalAccess.shouldDisplay || !medicalAccess.code) return null;
        return (
            <div className="border rounded-lg p-4 bg-gray-50 mt-4 shadow-sm">
                <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                    <Clipboard className="mr-2 h-4 w-4 text-blue-600" /> Code d'Accès Médical
                </h4>
                <div className="bg-white p-3 rounded-md border border-blue-200 text-center">
                    <p className="text-xl font-bold text-blue-700 tracking-wider">{medicalAccess.code}</p>
                    <p className="text-xs text-gray-500 mt-1">Conservez ce code.</p>
                </div>
            </div>
        );
    };
    // --- Fin Fonctions de Rendu ---

    // --- Fonction Asynchrone pour l'Appel API du Chatbot (UNCHANGED) ---
    const processUserQuery = useCallback(async (props) => {
        const { value: userQuery, triggerNextStep: triggerFn } = props;
        console.log("[processUserQuery] User Query:", userQuery, "PatientID:", patientIdFromState);
        if (!userQuery || !patientIdFromState) {
            const errorMsg = !patientIdFromState ? "ID Patient non disponible." : "Question vide.";
            console.error("[processUserQuery] Info manquante:", errorMsg);
            setChatbotIsProcessing(false);
            if (triggerFn) { triggerFn({ value: errorMsg, trigger: '5_error_display' }); }
            return ' ';
        }
        setChatbotIsProcessing(true);
        let apiResponseText = "Désolé, une erreur est survenue.";
        try {
            console.log(`[processUserQuery] Appel API avec query: "${userQuery}" pour patient: ${patientIdFromState}`);
            const response = await axios.post('http://localhost:8089/api/chatbot/query', {
                patientId: patientIdFromState,
                queryText: userQuery
            }, { withCredentials: true });
            apiResponseText = response.data.response || "Je n'ai pas de réponse spécifique.";
            console.log("[processUserQuery] Réponse API:", apiResponseText);
        } catch (error) {
            console.error("[processUserQuery] Erreur API:", error);
            apiResponseText = "Erreur technique avec l'assistant.";
        } finally {
            setChatbotIsProcessing(false);
            if (triggerFn) { triggerFn({ value: apiResponseText, trigger: '3_bot_response_display' }); }
        }
        return ' ';
    }, [patientIdFromState]); // Dépendance à patientIdFromState

    // --- Rendu JSX Principal ---
    return (
        <ThemeProvider theme={chatbotTheme}>
             {/* Conteneur principal: flex pour centrer, relatif pour être au-dessus du z-0 */}
            <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4 md:px-6 relative z-10">
                {/* Arrière-plan des particules: fixe, derrière tout (z-0) */}
                <div className="fixed inset-0 z-0">
                    <ParticlesComponent
                        id="status-particles" // ID unique
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#E8F4F8', // Couleur de fond souhaitée
                        }}
                    />
                </div>

                {/* Carte de contenu: w-full pour prendre la largeur max-w, opacité/flou pour l'effet */}
                <Card className="max-w-2xl w-full mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm">
                    <CardHeader className="bg-blue-50 p-6 border-b">
                        <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                            <Clock className="mr-2 h-6 w-6 text-blue-600" />
                            Statut de Votre Demande d'Urgence
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            Suivi en temps réel (rafraîchissement auto).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                        {loading ? (
                            <div className="text-center p-6">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                                <p className="text-gray-600">Chargement...</p>
                            </div>
                        ) : error ? (
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : patientDetails ? (
                            <>
                                <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                                    <h4 className="font-semibold mb-1 text-gray-700">Statut Actuel :</h4>
                                    <p className="text-xl font-bold text-blue-700">{patientDetails.status || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dernière MAJ : {patientDetails.updatedAt ? new Date(patientDetails.updatedAt).toLocaleString('fr-FR') : 'N/A'}
                                    </p>
                                </div>
                                {renderDoctorInfo()}
                                <div className="border rounded-lg p-4 bg-blue-50 shadow-sm">
                                    <h4 className="font-semibold mb-1 text-blue-800 flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-blue-700" /> Temps d'Attente / Prochaine Étape
                                    </h4>
                                    <div className="flex items-center">
                                        <p className={`text-blue-900 font-semibold ${loadingWaitTime ? 'italic text-gray-500' : ''}`}>
                                            {estimatedWaitTime}
                                        </p>
                                        {loadingWaitTime && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
                                    </div>
                                    {errorWaitTime && <p className="text-red-500 text-xs mt-1">{errorWaitTime}</p>}
                                </div>
                                {renderMedicalAccessCode()}
                                <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-md border">
                                    <p className="font-medium mb-1">Infos importantes :</p>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        {patientDetails.status === "Demande Enregistrée" && <li>Examen de votre demande en cours.</li>}
                                        {patientDetails.status === "En Cours d'Examen" && <li>Évaluation de votre situation par un professionnel.</li>}
                                        {patientDetails.status === "Médecin Assigné" && <li>Dr. {doctorInfo?.username || 'Le médecin'} a été notifié.</li>}
                                        {patientDetails.status === "Médecin En Route" && <li>Le médecin est en chemin.</li>}
                                        {patientDetails.status === "Traité" && <li>Prise en charge terminée.</li>}
                                        {patientDetails.status === "Annulé" && <li>Demande annulée.</li>}
                                        <li>Restez joignable.</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                                    <Button asChild variant="outline">
                                        <Link to="/home">Accueil</Link>
                                    </Button>
                                    {!['Traité', 'Annulé'].includes(patientDetails.status) && (
                                         <Button asChild variant="default" className="bg-blue-900 hover:bg-blue-700 text-white">
                                            <Link to="/document">
                                               See your medical record
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 text-gray-600">
                                ID Patient manquant ou données non trouvées.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* --- Section Chatbot --- */}
                {/* Positionnement fixe (z-[100]) devrait fonctionner correctement au-dessus de z-0 et z-10 */}
                {!loading && patientIdFromState && (
                    <>
                        {!showChatbot && (
                            <Button
                                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-[100] flex items-center justify-center p-0"
                                onClick={() => setShowChatbot(true)}
                                aria-label="Ouvrir l'assistant virtuel"
                                title="Assistant Virtuel"
                            >
                                <MessageSquare size={24} />
                            </Button>
                        )}

                        {showChatbot && (
                            <div className="fixed bottom-6 right-6 z-[100] shadow-xl rounded-lg overflow-hidden border border-gray-300 bg-white">
                                <ChatBot
                                    key={patientIdFromState + "_chatbot_" + (showChatbot ? "open" : "closed")}
                                    headerTitle="Assistant Virtuel"
                                    steps={[
                                        { id: '0_welcome', message: 'Bonjour ! Comment puis-je vous aider concernant votre statut ?', trigger: '1_user_input' },
                                        { id: '1_user_input', user: true, trigger: '2_async_trigger_step' },
                                        { id: '2_async_trigger_step', message: () => chatbotIsProcessing ? 'Recherche...' : 'Un instant...', trigger: processUserQuery },
                                        { id: '3_bot_response_display', message: '{previousValue}', trigger: '4_ask_again' },
                                        { id: '4_ask_again', message: 'Autre question ?', trigger: '1_user_input' },
                                        { id: '5_error_display', message: '{previousValue}', trigger: '4_ask_again' },
                                    ]}
                                    floating={false}
                                    opened={true}
                                    toggleFloating={() => setShowChatbot(false)}
                                    width="350px"
                                    botDelay={100}
                                    userDelay={0}
                                />
                            </div>
                        )}
                    </>
                )}
                {/* --- Fin Section Chatbot --- */}
            </div>
        </ThemeProvider>
    );
};

export default EmergencyStatus;