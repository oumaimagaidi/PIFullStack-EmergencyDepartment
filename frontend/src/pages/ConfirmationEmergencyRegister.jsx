import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react";
import axios from 'axios';

const ConfirmationEmergencyRegister = () => {
    const location = useLocation();
    const formData = location.state?.formData;
    const patientId = location.state?.patientId;
    const patientCode = location.state?.patientCode; // Added missing variable
    const predictedWaitTime = location.state?.predictedWaitTime;
    const assignedDoctor = location.state?.assignedDoctor;

    // Declare state variables
    const [waitTime, setWaitTime] = useState(predictedWaitTime || null);
    const [doctorInfo, setDoctorInfo] = useState(assignedDoctor || null);

    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (!patientId) return;

        // Simuler un temps d'attente estimé
        const timer = setTimeout(() => {
            setWaitTime(Math.random() * 30 + 15); // 15-45 minutes
        }, 1000);

        // Si un médecin est assigné, récupérer ses infos
        if (assignedDoctor && typeof assignedDoctor === 'object') {
            setDoctorInfo(assignedDoctor);
        } else if (assignedDoctor) {
            // Si c'est juste un ID, faire une requête pour récupérer les infos
            axios.get(`http://localhost:8089/api/users/${assignedDoctor}`)
                .then(response => setDoctorInfo(response.data))
                .catch(console.error);
        }

        return () => clearTimeout(timer);
    }, [patientId, assignedDoctor]);

    if (!formData || !patientId) {
        return (
            <div className="container mx-auto py-12 px-4 md:px-6 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-red-500 flex items-center justify-center">
                            <AlertTriangle className="mr-2" />
                            Erreur de Confirmation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Les informations de confirmation n'ont pas été trouvées.</p>
                        <div className="space-x-2">
                            <Button asChild variant="secondary">
                                <Link to="/home">Retour à l'accueil</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/emergency-register">Nouvelle demande</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleTrackStatusClick = () => {
        navigate('/emergency-status', { 
            state: { 
                patientId,
                patientCode,
                doctorInfo
            }
        });
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-col space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        <CheckCircle className="mr-2 inline-block h-6 w-6 text-green-500 align-top" />
                        Demande d'Urgence Enregistrée !
                    </CardTitle>
                    <CardDescription>
                        Votre demande a été soumise avec succès. Voici un résumé des informations que vous avez fournies :
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="border rounded-md p-4">
                        <h4 className="font-semibold mb-2">Informations Personnelles</h4>
                        <p>Nom: {formData.firstName} {formData.lastName}</p>
                        <p>Date de Naissance: {formData.dateOfBirth}</p>
                        <p>Genre: {formData.gender}</p>
                        <p>Téléphone: {formData.phoneNumber}</p>
                        {formData.email && <p>Email: {formData.email}</p>}
                        <p>Adresse: {formData.address}</p>
                        <p>Contact d'Urgence: {formData.emergencyContact}</p>
                    </div>

                    <div className="border rounded-md p-4">
                        <h4 className="font-semibold mb-2">Informations Médicales</h4>
                        {formData.insuranceInfo && <p>Information d'Assurance: {formData.insuranceInfo}</p>}
                        {formData.allergies && <p>Allergies: {formData.allergies}</p>}
                        {formData.currentMedications && <p>Médications Actuelles: {formData.currentMedications}</p>}
                        {formData.medicalHistory && <p>Historique Médical: {formData.medicalHistory}</p>}
                        <p>Symptômes Actuels: {formData.currentSymptoms}</p>
                        <p>Niveau de Douleur: {formData.painLevel}</p>
                        <p>Niveau d'Urgence: {formData.emergencyLevel}</p>
                    </div>

                    <div className="border rounded-md p-4 bg-blue-50">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4 text-blue-600 align-baseline" /> Prochaines Étapes Importantes</h4>
                        <p className="mb-2">
                            <strong className="flex items-center">
                                <Clock className="mr-2 inline-block h-4 w-4 text-blue-600 align-baseline" /> Temps d'attente estimé: {waitTime ? `${waitTime.toFixed(0)} minutes` : "Calcul en cours..."}
                            </strong>
                        </p>
                        {doctorInfo ? (
                            <p className="mb-2">
                                <strong><User className="mr-2 inline-block h-4 w-4 text-green-600 align-baseline" />
                                Médecin Attribué :</strong> {doctorInfo.username} (Spécialité : {doctorInfo.specialization}, Contact : {doctorInfo.email})
                            </p>
                        ) : (
                            <p className="mb-2">
                                <strong className="flex items-center">
                                    <Clock className="mr-2 inline-block h-4 w-4 text-blue-600 align-baseline" /> Affectation du médecin en cours...
                                </strong>
                            </p>
                        )}
                        <p className="mb-2">
                            <strong className="flex items-center">
                                <Clock className="mr-2 inline-block h-4 w-4 text-blue-600 align-baseline" /> Restez Disponible :</strong> Une équipe médicale va examiner votre demande sous peu et vous contactera au numéro de téléphone que vous avez fourni. Veuillez rester joignable.
                        </p>
                        <p className="mb-2">
                            <strong>Préparation (si possible) :</strong> Rassemblez votre carte d'assurance, une liste de vos médicaments actuels et tout document médical pertinent qui pourrait aider l'équipe médicale.
                        </p>
                        <p>
                            <strong>Ne Quittez Pas Votre Domicile (sauf indication contraire) :</strong> Sauf indication contraire de notre part, veuillez rester à votre adresse pour faciliter l'intervention des secours ou de l'ambulance si nécessaire.
                        </p>
                    </div>

                    <div className="flex justify-between">
                        <Button asChild variant="secondary">
                            <Link to="/home">Retour à l'Accueil</Link>
                        </Button>
                        <Button variant="outline" onClick={handleTrackStatusClick}>
                            Suivre le Statut de ma Demande
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfirmationEmergencyRegister;