import React, { useState, useEffect, useRef } from 'react';
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
    const patientId = location.state?.patientId;
    const initialDoctorInfo = location.state?.doctorInfo;

    console.log("[EmergencyStatus] Page Loaded. Patient ID from state:", patientId);

    // --- États ---
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
    // --- Fin États ---

    // --- Fonction pour récupérer les détails et le temps d'attente ---
    const fetchPatientAndWaitTime = async (isInitialLoad = false) => {
        if (!patientId) {
            setError("ID Patient manquant.");
            if (isInitialLoad) setLoading(false);
            setLoadingWaitTime(false);
            return;
        }

        setError(null);
        setErrorWaitTime(null);
        setLoadingWaitTime(true);

        try {
            console.log("[Fetch] Calling APIs for details and wait time...");
            const [detailsResponse, waitTimeResponse] = await Promise.all([
                axios.get(`http://localhost:8089/api/emergency-patients/${patientId}/details`, { withCredentials: true }),
                axios.get(`http://localhost:8089/api/emergency-patients/${patientId}/estimated-wait-time`, { withCredentials: true }),
            ]);

            const detailsData = detailsResponse.data;
            console.log("[Fetch] Details Response:", detailsData);
            if (detailsData && typeof detailsData === 'object') {
                setPatientDetails(detailsData);

                const assignedDoctorData = detailsData.assignedDoctor;
                if (assignedDoctorData && (!doctorInfo || doctorInfo._id !== assignedDoctorData._id)) {
                    if (typeof assignedDoctorData === 'object' && assignedDoctorData !== null) {
                        console.log("[Fetch] Updating doctor info with object:", assignedDoctorData);
                        setDoctorInfo(assignedDoctorData);
                    }
                } else if (!assignedDoctorData && doctorInfo) {
                    console.log("[Fetch] Clearing doctor info.");
                    setDoctorInfo(null);
                }
            } else {
                console.error("[Fetch] Invalid details data format:", detailsData);
                if (!error) setError("Format de données patient invalide reçu.");
            }

            const waitTimeData = waitTimeResponse.data;
            console.log("[Fetch] Wait Time Response:", waitTimeData);
            if (waitTimeData && typeof waitTimeData.estimatedWaitTime === 'string') {
                setEstimatedWaitTime(waitTimeData.estimatedWaitTime);
            } else {
                console.warn("[Fetch] Invalid wait time format:", waitTimeData);
                setEstimatedWaitTime("Indisponible");
            }
        } catch (err) {
            console.error("[Fetch] Error fetching status/time:", err);
            if (!patientDetails && isInitialLoad) setError("Impossible de récupérer les détails initiaux.");
            setErrorWaitTime("Impossible de mettre à jour l'estimation.");
        } finally {
            if (isInitialLoad) setLoading(false);
            setLoadingWaitTime(false);
            console.log("[Fetch] Fetch cycle finished.");
        }
    };
    // --- Fin Fonction Fetch ---

    // --- Fonction pour récupérer le code d'accès médical ---
    const fetchMedicalAccessCode = async () => {
        if (!patientId || !patientDetails || !patientDetails.status) return;

        const relevantStatuses = [ 'Médecin En Route', 'Traité']; // Updated to include 'Médecin Assigné'
        console.log("[MedicalCode] Current status:", patientDetails.status); // Debug log
        if (!relevantStatuses.includes(patientDetails.status)) {
            setMedicalAccess({ code: null, shouldDisplay: false, loading: false, error: null });
            return;
        }

        console.log("[MedicalCode] Fetching access code for status:", patientDetails.status);
        setMedicalAccess(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get(
                `http://localhost:8089/api/emergency-patients/${patientId}/medical-access-code`,
                { withCredentials: true }
            );
            console.log("[MedicalCode] Response:", response.data);
            setMedicalAccess({
                code: response.data.accessCode,
                shouldDisplay: response.data.shouldDisplay ?? false,
                loading: false,
                error: null,
            });
        } catch (err) {
            console.error("[MedicalCode] Error fetching access code:", err);
            setMedicalAccess(prev => ({
                ...prev,
                loading: false,
                error: "Impossible de récupérer le code d'accès médical",
            }));
        }
    };
    // --- Fin Fonction Code Médical ---

    // --- useEffect pour le chargement initial et l'intervalle ---
    useEffect(() => {
        if (patientId) {
            console.log("[Effect Init] patientId found, performing initial fetch.");
            fetchPatientAndWaitTime(true);

            const intervalId = setInterval(() => {
                console.log("[Interval] Refreshing data...");
                fetchPatientAndWaitTime(false);
            }, 30000);

            return () => {
                console.log("[Effect Init] Cleaning up interval.");
                clearInterval(intervalId);
            };
        } else {
            setError("Aucun ID patient fourni pour suivre le statut.");
            setLoading(false);
        }
    }, [patientId]);
    // --- Fin useEffect Initial/Intervalle ---

    // --- useEffect pour déclencher la récupération du code médical ---
    useEffect(() => {
        if (patientDetails && patientDetails.status) {
            console.log("[Effect Status] Status changed or loaded:", patientDetails.status, "Checking for medical code.");
            fetchMedicalAccessCode();
        }
    }, [patientDetails?.status]);
    // --- Fin useEffect Code Médical ---

    // --- Fonctions de Rendu ---
    const renderDoctorInfo = () => {
        if (!doctorInfo) {
            return <p className="text-sm text-orange-600 italic">Assignation du médecin en cours...</p>;
        }
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
        if (medicalAccess.loading) {
            return <p className="text-sm text-gray-500 italic mt-4">Chargement du code d'accès...</p>;
        }
        if (medicalAccess.error) {
            return <p className="text-sm text-red-500 mt-4">{medicalAccess.error}</p>;
        }
        if (!medicalAccess.shouldDisplay || !medicalAccess.code) {
            return null;
        }
        return (
            <div className="border rounded-lg p-4 bg-gray-50 mt-4 shadow-sm">
                <h4 className="font-semibold mb-2 flex items-center text-blue-800">
                    <Clipboard className="mr-2 h-4 w-4 text-blue-600" /> Code d'Accès Médical
                </h4>
                <div className="bg-white p-3 rounded-md border border-blue-200 text-center">
                    <p className="text-xl font-bold text-blue-700 tracking-wider">
                        {medicalAccess.code}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Conservez ce code pour accéder à vos dossiers.
                    </p>
                </div>
            </div>
        );
    };
    // --- Fin Fonctions de Rendu ---

    // --- Logique Chatbot ---
    const ChatbotAPIStep = (props) => {
        const [loadingApi, setLoadingApi] = useState(true);
        const [result, setResult] = useState('');
        const { previousStep, triggerNextStep } = props;

        useEffect(() => {
            const userQuery = previousStep.value;
            console.log("[Chatbot Step] Received query:", userQuery);

            if (!userQuery || !patientId) {
                setResult("Désolé, besoin de votre question et ID patient.");
                setLoadingApi(false);
                if (triggerNextStep) {
                    triggerNextStep({ value: 'error', trigger: 'user-input-again' });
                }
                return;
            }

            const callApi = async () => {
                try {
                    const response = await axios.post('http://localhost:8089/api/chatbot/query', {
                        patientId: patientId,
                        queryText: userQuery,
                    }, { withCredentials: true });
                    setResult(response.data.response || "Je n'ai pas de réponse pour cela.");
                } catch (apiError) {
                    console.error("Erreur API Chatbot:", apiError);
                    setResult("Désolé, erreur de communication avec l'assistant.");
                } finally {
                    setLoadingApi(false);
                    if (triggerNextStep) {
                        triggerNextStep({ value: userQuery, trigger: 'user-input-again' });
                    }
                }
            };
            callApi();
        }, [previousStep, patientId, triggerNextStep]);

        return (
            <div>{loadingApi ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : result}</div>
        );
    };
    // --- Fin Logique Chatbot ---

    // --- Rendu JSX Principal ---
    return (
        <ThemeProvider theme={chatbotTheme}>
            <div className="min-h-screen bg-gray-100 pt-24 pb-20 px-4 md:px-6 relative">
                <Card className="max-w-2xl mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200">
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
                                <p className="text-gray-600">Chargement des informations...</p>
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
                                        Dernière mise à jour : {patientDetails.updatedAt ? new Date(patientDetails.updatedAt).toLocaleString('fr-FR') : 'N/A'}
                                    </p>
                                </div>

                                {renderDoctorInfo()}
                                {renderMedicalAccessCode()}

                                <div className="border rounded-lg p-4 bg-blue-50 shadow-sm">
                                    <h4 className="font-semibold mb-1 text-blue-800 flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-blue-700" /> Temps d'Attente Estimé / Prochaine Étape
                                    </h4>
                                    <div className="flex items-center">
                                        <p className={`text-blue-900 font-semibold ${loadingWaitTime ? 'italic text-gray-500' : ''}`}>
                                            {estimatedWaitTime}
                                        </p>
                                        {loadingWaitTime && <Loader2 className="h-4 w-4 animate-spin text-blue-600 ml-2" />}
                                    </div>
                                    {errorWaitTime && <p className="text-red-500 text-xs mt-1">{errorWaitTime}</p>}
                                </div>

                                <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-md border border-gray-200">
                                    <p className="font-medium mb-1">Que se passe-t-il maintenant ?</p>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        {patientDetails.status === "Demande Enregistrée" && <li>Notre équipe examine votre demande pour assigner le bon professionnel.</li>}
                                        {patientDetails.status === "En Cours d'Examen" && <li>Un professionnel évalue votre situation plus en détail.</li>}
                                        {patientDetails.status === "Médecin En Route" && <li>Le médecin est en chemin. Restez où vous êtes.</li>}
                                        {patientDetails.status === "Traité" && <li>Prise en charge terminée. N'oubliez pas de suivre les instructions de sortie.</li>}
                                        {patientDetails.status === "Annulé" && <li>Demande annulée. Contactez-nous si votre situation change.</li>}
                                        <li>Restez joignable par téléphone.</li>
                                    </ul>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                                    <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                                        <Link to="/home">Retour à l'Accueil</Link>
                                    </Button>
                                    {!['Traité', 'Annulé'].includes(patientDetails.status) && (
                                        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                                            <Link to="/calendar">
                                                <Calendar className="mr-2 h-4 w-4" /> Planifier un RDV de suivi
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 text-gray-600">
                                Impossible d'afficher le statut. ID Patient manquant.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {!loading && patientId && (
                    <>
                        {!showChatbot && (
                            <Button
                                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50 flex items-center justify-center p-0"
                                onClick={() => setShowChatbot(true)}
                                aria-label="Ouvrir l'assistant virtuel"
                                title="Assistant Virtuel"
                            >
                                <MessageSquare size={24} />
                            </Button>
                        )}

                        {showChatbot && (
                            <div className="fixed bottom-6 right-6 z-50 shadow-xl rounded-lg overflow-hidden border border-gray-300">
                                <ChatBot
                                    headerTitle="Assistant Virtuel"
                                    steps={[
                                        { id: 'welcome', message: 'Bonjour ! Question sur statut, attente, médecin ?', trigger: 'user-input' },
                                        { id: 'user-input', user: true, trigger: 'api-call' },
                                        { id: 'api-call', component: <ChatbotAPIStep />, waitAction: true, asMessage: true },
                                        { id: 'user-input-again', message: 'Autre question simple ?', trigger: 'user-input' },
                                        { id: 'fallback', message: 'Erreur. Autre question ?', trigger: 'user-input' },
                                    ]}
                                    floating={false}
                                    opened={true}
                                    toggleFloating={() => setShowChatbot(false)}
                                    width="330px"
                                    botDelay={500}
                                    userDelay={0}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </ThemeProvider>
    );
};

export default EmergencyStatus;