import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Stethoscope, Clipboard } from "lucide-react";

const EmergencyStatus = () => {
    const location = useLocation();
    const patientId = location.state?.patientId;

    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...');
    const [medicalAccess, setMedicalAccess] = useState({
        code: null,
        shouldDisplay: false,
        loading: false,
        error: null
    });

    const fetchPatientDetails = async () => {
        if (!patientId) {
            setError("ID patient manquant pour récupérer les détails.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8089/api/emergency-patients/${patientId}/details`,
                { withCredentials: true }
            );

            setPatientDetails(response.data);
            setError(null);

            // Mettre à jour le temps d'attente estimé
            updateWaitTime(response.data.status);

        } catch (err) {
            console.error("Erreur récupération détails:", err);
            setError("Impossible de récupérer les détails de la demande.");
            setPatientDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicalAccessCode = async () => {
        if (!patientId) return;

        // Ne chercher le code que si le statut le justifie
        if (!patientDetails || 
            !['Médecin En Route', 'Traité'].includes(patientDetails.status)) {
            return;
        }

        setMedicalAccess(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get(
                `http://localhost:8089/api/emergency-patients/${patientId}/medical-access-code`,
                { withCredentials: true }
            );

            setMedicalAccess({
                code: response.data.accessCode,
                shouldDisplay: response.data.shouldDisplay,
                loading: false,
                error: null
            });

        } catch (err) {
            console.error("Erreur récupération code accès:", err);
            setMedicalAccess(prev => ({
                ...prev,
                loading: false,
                error: "Impossible de récupérer le code d'accès médical"
            }));
        }
    };

    const updateWaitTime = (status) => {
        switch (status) {
            case "Demande Enregistrée":
                setEstimatedWaitTime("10-15 minutes (en attente d'assignation/examen)");
                break;
            case "Médecin Assigné":
                setEstimatedWaitTime("5-10 minutes (médecin informé)");
                break;
            case "En Cours d'Examen":
                setEstimatedWaitTime("5-10 minutes");
                break;
            case "Médecin En Route":
                setEstimatedWaitTime("2-5 minutes");
                break;
            case "Traité":
                setEstimatedWaitTime("Traitement terminé");
                break;
            case "Annulé":
                setEstimatedWaitTime("Demande annulée");
                break;
            default:
                setEstimatedWaitTime("Indisponible");
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchPatientDetails();
            const interval = setInterval(fetchPatientDetails, 10000);
            return () => clearInterval(interval);
        } else {
            setError("Aucun ID patient fourni.");
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (patientDetails) {
            fetchMedicalAccessCode();
        }
    }, [patientDetails?.status]); // Déclenché quand le statut change

    const renderDoctorInfo = () => {
        if (!patientDetails?.assignedDoctor) {
            return <p className="text-orange-600">En attente d'assignation d'un médecin...</p>;
        }
        const doctor = patientDetails.assignedDoctor;
        return (
            <div className="border rounded-md p-6 bg-green-50">
                <h4 className="font-semibold mb-4 flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5 text-green-700" /> 
                    Médecin Assigné
                </h4>
                <p><strong>Nom :</strong> {doctor.username || 'Information non disponible'}</p>
                <p><strong>Spécialisation :</strong> {doctor.specialization || 'Non spécifiée'}</p>
            </div>
        );
    };

    const renderMedicalAccessCode = () => {
        if (medicalAccess.loading) {
            return <p className="text-gray-600">Chargement du code d'accès...</p>;
        }

        if (medicalAccess.error) {
            return <p className="text-red-500">{medicalAccess.error}</p>;
        }

        if (!medicalAccess.shouldDisplay || !medicalAccess.code) {
            return null;
        }

        return (
            <div className="border rounded-md p-6 bg-purple-50 mt-4">
                <h4 className="font-semibold mb-4 flex items-center">
                    <Clipboard className="mr-2 h-5 w-5 text-purple-700" /> 
                    Votre Code d'Accès Médical
                </h4>
                <div className="bg-white p-4 rounded-md border border-purple-200">
                    <p className="text-center text-2xl font-bold text-purple-800">
                        {medicalAccess.code}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        Conservez ce code précieusement pour accéder à votre dossier
                    </p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Ce code vous permettra de :</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Consulter votre dossier médical en ligne</li>
                        <li>Partager vos informations avec des professionnels</li>
                        <li>Accéder à votre historique médical complet</li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader className="flex flex-col space-y-1 bg-blue-50 p-6 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                        <Clock className="mr-2 h-6 w-6 text-blue-600" />
                        Statut de Votre Demande d'Urgence
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        Suivez l'évolution de votre demande en temps réel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {loading && (
                        <div className="text-center p-4">
                            <p className="text-gray-600">Chargement des informations...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
                            <p>{error}</p>
                            {!patientId && <p>Veuillez retourner et soumettre à nouveau le formulaire.</p>}
                        </div>
                    )}
                    {!loading && !error && patientDetails && (
                        <>
                            <div className="border rounded-md p-6 bg-gray-100">
                                <h4 className="font-semibold mb-2 text-gray-800">Statut Actuel :</h4>
                                <p className="text-xl font-bold text-blue-700">{patientDetails.status}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Dernière mise à jour : {new Date(patientDetails.updatedAt).toLocaleString()}
                                </p>
                            </div>

                            {renderDoctorInfo()}
                            {renderMedicalAccessCode()}

                            <div className="border rounded-md p-6 bg-blue-100">
                                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-blue-700" /> Temps d'Attente Estimé
                                </h4>
                                <p className="text-blue-900">
                                    Le temps d'attente estimé est actuellement de : {' '}
                                    <span className="font-semibold">{estimatedWaitTime}</span>.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                                <Button asChild variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                                    <Link to="/home">Retour à l'Accueil</Link>
                                </Button>
                                {patientDetails.status !== 'Traité' && patientDetails.status !== 'Annulé' && (
                                    <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link to="/calendar">
                                            <Calendar className="mr-2 h-4 w-4" /> Prendre un RDV de Suivi
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                    {!loading && !error && !patientDetails && !patientId && (
                        <div className="text-center p-4 text-gray-600">
                            Impossible d'afficher le statut sans ID patient.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyStatus;