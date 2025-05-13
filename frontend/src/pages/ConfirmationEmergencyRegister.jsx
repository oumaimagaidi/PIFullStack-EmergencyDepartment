import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, User, Stethoscope } from "lucide-react";
import axios from 'axios';
import ParticlesComponent from "@/components/ParticlesComponent"; // Importez ParticlesComponent

// Color palette (si nécessaire pour d'autres éléments, sinon facultatif)
const colors = {
  primary: "#1e3a8a", // Blue-900
  secondary: "#0891b2", // Cyan
  alert: "#dc2626", // Red
  primaryLight: "#dbeafe",
  secondaryLight: "#cffafe",
  alertLight: "#fee2e2",
  bgAccent: "#e0f7fa", // Light cyan for background
};

const ConfirmationEmergencyRegister = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const formData = location.state?.formData;
    const patientId = location.state?.patientId;
    const patientCode = location.state?.patientCode;
    const initialAssignedDoctor = location.state?.assignedDoctor;

    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...');
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loadingWaitTime, setLoadingWaitTime] = useState(true);
    const [errorWaitTime, setErrorWaitTime] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(false);

    useEffect(() => {
        const fetchWaitTime = async () => {
            if (!patientId) return;
            setLoadingWaitTime(true);
            setErrorWaitTime(null);
            try {
                const response = await axios.get(`http://localhost:8089/api/emergency-patients/${patientId}/estimated-wait-time`, { withCredentials: true });
                setEstimatedWaitTime(response.data.estimatedWaitTime || "Indisponible");
            } catch (error) {
                console.error("Erreur récupération temps d'attente:", error);
                setEstimatedWaitTime("Estimation indisponible");
                setErrorWaitTime("Impossible de récupérer l'estimation du temps d'attente.");
            } finally {
                setLoadingWaitTime(false);
            }
        };

        const fetchDoctorDetails = async () => {
            if (initialAssignedDoctor && typeof initialAssignedDoctor === 'object' && initialAssignedDoctor !== null) {
                setDoctorInfo(initialAssignedDoctor);
            } else if (initialAssignedDoctor && typeof initialAssignedDoctor === 'string') {
                setLoadingDoctor(true);
                try {
                    const response = await axios.get(`http://localhost:8089/api/users/${initialAssignedDoctor}`, { withCredentials: true });
                    setDoctorInfo(response.data);
                } catch (error) {
                    console.error("Erreur récupération détails médecin:", error);
                    setDoctorInfo({ username: 'Information Indisponible', specialization: 'N/A', email: 'N/A', _id: initialAssignedDoctor });
                } finally {
                    setLoadingDoctor(false);
                }
            } else {
                setDoctorInfo(null);
            }
        };

        if (patientId) {
            fetchWaitTime();
            fetchDoctorDetails();
        } else {
            console.error("ID Patient manquant dans location.state pour ConfirmationEmergencyRegister.");
            setLoadingWaitTime(false);
            setLoadingDoctor(false);
        }
    }, [patientId, initialAssignedDoctor]);

    const handleTrackStatusClick = () => {
        console.log("Navigating to /emergency-status with state:", {
            patientId,
            patientCode,
            doctorInfo
        });
        navigate('/emergency-status', {
            state: {
                patientId,
                patientCode,
                doctorInfo
            }
        });
    };

    // Structure principale avec l'arrière-plan des particules
    return (
        // Conteneur principal : prend toute la hauteur, utilise flex pour centrer, position relative et z-index pour être au-dessus des particules
        <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">

            {/* Arrière-plan des particules */}
            <div className="fixed inset-0 z-0">
                <ParticlesComponent
                    id="confirmation-particles" // ID différent pour éviter les conflits potentiels
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#E8F4F8', // Ou la couleur de fond que vous préférez
                    }}
                />
            </div>

            {/* Contenu de la page (carte de confirmation) */}
            {/* Condition pour afficher la carte d'erreur ou la carte de confirmation */}
            {!formData || !patientId ? (
                // Carte d'erreur (reste inchangée, déjà positionnée correctement par le flex du parent)
                <Card className="max-w-md w-full shadow-lg rounded-2xl border border-red-200 bg-white transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="bg-red-50 rounded-t-2xl py-6 px-6">
                        <CardTitle className="text-red-700 flex items-center justify-center text-2xl font-semibold">
                            <AlertTriangle className="mr-2 h-6 w-6" />
                            Erreur de Confirmation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <p className="text-gray-600 text-center text-base">Les informations de confirmation n'ont pas pu être trouvées. Veuillez réessayer votre enregistrement.</p>
                        <div className="flex justify-center space-x-4">
                            <Button asChild variant="outline" className="rounded-lg">
                                <Link to="/home">Retour à l'Accueil</Link>
                            </Button>
                            <Button asChild className="bg-red-600 text-white hover:bg-red-700 rounded-lg">
                                <Link to="/emergency-register">Nouvelle Demande</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // Carte de confirmation (reste inchangée, positionnée correctement par le flex du parent)
                 <Card className="max-w-4xl w-full mx-auto shadow-xl rounded-2xl border border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl"> {/* Ajout bg-opacity et backdrop-blur comme sur l'autre page */}
                    <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-700 text-white py-8 px-6">
                        <CardTitle className="text-3xl font-bold flex items-center">
                            <CheckCircle className="mr-3 h-8 w-8 text-green-300" />
                            Demande d'Urgence Enregistrée
                        </CardTitle>
                        <CardDescription className="text-sky-100 text-lg mt-2">
                            Votre demande a été soumise avec succès. Voici un résumé des informations.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 grid gap-8">
                        {/* Section Informations Personnelles */}
                        <div className="bg-teal-50 rounded-xl p-6 shadow-sm border border-teal-100">
                            <h4 className="text-lg font-semibold text-teal-900 mb-4">Informations Personnelles</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                <p><span className="font-medium">Nom:</span> {formData.firstName} {formData.lastName}</p>
                                <p><span className="font-medium">Né(e) le:</span> {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</p>
                                <p><span className="font-medium">Genre:</span> {formData.gender}</p>
                                <p><span className="font-medium">Téléphone:</span> {formData.phoneNumber}</p>
                                {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                                <p className="sm:col-span-2"><span className="font-medium">Adresse:</span> {formData.address}</p>
                                <p className="sm:col-span-2"><span className="font-medium">Contact d'Urgence:</span> {formData.emergencyContact}</p>
                            </div>
                        </div>

                        {/* Section Informations Médicales */}
                        <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
                            <h4 className="text-lg font-semibold text-amber-900 mb-4">Informations Médicales</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                {formData.insuranceInfo && <p><span className="font-medium">Assurance:</span> {formData.insuranceInfo}</p>}
                                {formData.allergies && <p><span className="font-medium">Allergies:</span> {formData.allergies}</p>}
                                {formData.currentMedications && <p><span className="font-medium">Médicaments Actuels:</span> {formData.currentMedications}</p>}
                                {formData.medicalHistory && <p><span className="font-medium">Antécédents Médicaux:</span> {formData.medicalHistory}</p>}
                                <p className="sm:col-span-2"><span className="font-medium">Symptômes Actuels:</span> {formData.currentSymptoms}</p>
                                <p><span className="font-medium">Niveau de Douleur:</span> {formData.painLevel}/10</p>
                                <p><span className="font-medium">Niveau d'Urgence:</span> {formData.emergencyLevel}</p>
                            </div>
                        </div>

                        {/* Section Prochaines Étapes */}
                        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                            <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-blue-600" /> Prochaines Étapes
                            </h4>
                            <div className="space-y-3 text-gray-700 text-sm">
                                <p className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                                    <strong className="w-40">Temps d'attente estimé:</strong>
                                    <span className={`font-semibold ${loadingWaitTime ? 'italic text-gray-500' : ''}`}>
                                        {loadingWaitTime ? 'Calcul en cours...' : estimatedWaitTime}
                                        {errorWaitTime && <span className="text-red-500 text-xs ml-1">({errorWaitTime})</span>}
                                    </span>
                                </p>
                                <div className="flex items-start">
                                    <Stethoscope className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <strong className="w-40">Médecin Assigné:</strong>
                                    {loadingDoctor ? (
                                        <span className="italic text-gray-500">Chargement...</span>
                                    ) : doctorInfo ? (
                                        <span className="font-semibold">
                                            {doctorInfo.username}
                                            {doctorInfo.specialization && ` (${doctorInfo.specialization})`}
                                            {doctorInfo.email && `, Contact: ${doctorInfo.email}`}
                                        </span>
                                    ) : (
                                        <span className="italic text-gray-500">Assignation en cours...</span>
                                    )}
                                </div>
                                <p><strong>Restez Disponible :</strong> Notre équipe médicale vous contactera sous peu. Veuillez garder votre téléphone à proximité.</p>
                                <p><strong>Préparation :</strong> Ayez à portée de main votre carte d'assurance, la liste de vos médicaments actuels et tout document médical pertinent.</p>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-between mt-6">
                            <Button asChild variant="outline" className="rounded-lg">
                                <Link to="/home">Retour à l'Accueil</Link>
                            </Button>
                            <Button
                                onClick={handleTrackStatusClick}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                            >
                                Suivre le Statut de la Demande
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ConfirmationEmergencyRegister;