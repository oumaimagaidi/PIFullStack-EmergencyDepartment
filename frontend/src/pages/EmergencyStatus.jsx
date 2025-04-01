// src/pages/EmergencyStatus.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Stethoscope } from "lucide-react"; // Ajout Stethoscope

const EmergencyStatus = () => {
    const location = useLocation();
    const patientId = location.state?.patientId;

    // --- État pour stocker toutes les informations du patient ---
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- Fin Nouvel État ---

    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...');

    const fetchPatientDetails = async () => {
        if (!patientId) {
            console.error("patientId est manquant dans l'état de navigation");
            setError("ID patient manquant pour récupérer les détails.");
            setLoading(false);
            return;
        }

        setLoading(true); // Mettre à jour le chargement au début de la requête
        try {
            // --- Appel de la nouvelle route /details ---
            const apiUrl = `http://localhost:8089/api/emergency-patients/${patientId}/details`;
            console.log("Appel de l'API Détails:", apiUrl);
            const response = await axios.get(apiUrl, {
                withCredentials: true,
            });
            // --- Fin Appel API ---

            console.log("Détails du patient reçus:", response.data);
            setPatientDetails(response.data); // Stocker l'objet patient complet
            setError(null); // Réinitialiser l'erreur en cas de succès

            // Logique pour le temps d'attente basée sur le statut
            const currentStatus = response.data.status;
            switch (currentStatus) {
                case "Demande Enregistrée":
                    setEstimatedWaitTime("10-15 minutes (en attente d'assignation/examen)");
                    break;
                case "Médecin Assigné": // Vous pouvez ajouter ce statut si besoin
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

        } catch (err) {
            console.error("Erreur lors de la récupération des détails:", err);
            setError("Impossible de récupérer les détails de la demande.");
            setPatientDetails(null); // Réinitialiser les détails en cas d'erreur
        } finally {
             setLoading(false);
        }
    };

    useEffect(() => {
        console.log("PatientId au montage:", patientId);
        if (patientId) {
            fetchPatientDetails(); // Premier appel
            const interval = setInterval(fetchPatientDetails, 10000); // Mise à jour toutes les 10 secondes
            return () => clearInterval(interval); // Nettoyage à la destruction du composant
        } else {
             setError("Aucun ID patient fourni.");
             setLoading(false);
        }
    }, [patientId]); // Dépendance à patientId

    // --- Fonction pour afficher les informations du médecin ---
    const renderDoctorInfo = () => {
        if (!patientDetails?.assignedDoctor) {
            return <p className="text-orange-600">En attente d'assignation d'un médecin...</p>;
        }
        const doctor = patientDetails.assignedDoctor;
        return (
            <div className="border rounded-md p-6 bg-green-50">
                <h4 className="font-semibold mb-4 flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5 text-green-700 align-baseline" /> Médecin Assigné
                </h4>
                <p>
                    <strong>Nom :</strong> {doctor.username || 'Information non disponible'}
                </p>
                <p>
                    <strong>Spécialisation :</strong> {doctor.specialization || 'Non spécifiée'}
                </p>
                {/* Vous pouvez ajouter d'autres infos si nécessaire, ex: doctor.email */}
                 {/* <p><strong>Contact:</strong> {doctor.email || 'Non disponible'}</p> */}
            </div>
        );
    };
     // --- Fin fonction ---


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
                            {/* Peut-être ajouter un spinner ici */}
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
                                <p className="text-sm text-gray-500 mt-1">Dernière mise à jour : {new Date(patientDetails.updatedAt).toLocaleString()}</p>
                             </div>

                            {/* --- Affichage du médecin assigné --- */}
                            {renderDoctorInfo()}
                            {/* --- Fin Affichage --- */}


                            <div className="border rounded-md p-6 bg-blue-100">
                                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-blue-700" /> Temps d'Attente Estimé
                                </h4>
                                <p className="text-blue-900">
                                    Le temps d'attente estimé est actuellement de : <span className="font-semibold">{estimatedWaitTime}</span>. Ce temps peut varier.
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