import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";

const EmergencyStatus = () => {
    const { patientId } = useParams(); // Use useParams to get patientId from URL
    console.log("PatientId from useParams:", patientId); // ADDED: Log patientId at component start
    const [status, setStatus] = useState('Chargement du statut...');
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...');
    // const patientId = "12345"; // REMOVED: Static patientId

    const fetchStatus = async () => {
        if (!patientId) {
            console.error("patientId est manquant dans l'URL");
            setStatus("ID patient manquant");
            setEstimatedWaitTime("Indisponible");
            return;
        }
        try {
            const apiUrl = `http://localhost:8089/api/emergency-patients/${patientId}/status`; // Construct URL explicitly
            console.log("URL being requested:", apiUrl); // ADDED: Log the constructed URL
            const response = await axios.get(apiUrl, { // Use apiUrl in axios.get()
                withCredentials: true,
            });

            const newStatus = response.data.status;
            setStatus(newStatus);

            switch (newStatus) {
                case "Demande Enregistrée":
                    setEstimatedWaitTime("10-15 minutes");
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
        } catch (error) {
            console.error("Erreur lors de la récupération du statut:", error);
            setStatus("Impossible de récupérer le statut");
            setEstimatedWaitTime("Indisponible");
        }
    };

    useEffect(() => {
        console.log("PatientId inside useEffect:", patientId); // ADDED: Log patientId inside useEffect
        if (patientId) {
            fetchStatus();
            const interval = setInterval(fetchStatus, 5000);
            return () => clearInterval(interval);
        } else {
            console.warn("patientId est manquant, requête de statut annulée.");
        }
    }, [patientId]);

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-col space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        <Clock className="mr-2 inline-block h-6 w-6 text-blue-500 align-top" />
                        Statut de Votre Demande d'Urgence
                    </CardTitle>
                    <CardDescription>
                        Suivez l'évolution de votre demande en temps réel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border rounded-md p-6 bg-gray-50">
                        <h4 className="font-semibold mb-4">Statut Actuel :</h4>
                        <p className="text-xl font-semibold text-blue-700">{status}</p>
                        <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleTimeString()}</p>
                    </div>

                    <div className="border rounded-md p-6 bg-blue-50">
                        <h4 className="font-semibold mb-4 flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 align-baseline" /> Temps d'Attente Estimé
                        </h4>
                        <p>
                            Le temps d'attente estimé est actuellement de : <span className="font-semibold">{estimatedWaitTime}</span>. Ce temps peut varier en fonction de l'activité du service d'urgence.
                        </p>
                    </div>

                    <div className="flex justify-between">
                        <Button asChild variant="secondary">
                            <Link to="/home">Retour à l'Accueil</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/calendar"> <Calendar className="mr-2 h-4 w-4 inline-block align-baseline" /> Prendre un Rendez-vous de Suivi</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyStatus;