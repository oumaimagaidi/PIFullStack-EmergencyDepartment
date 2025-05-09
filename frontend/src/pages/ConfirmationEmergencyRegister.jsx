// frontend/src/pages/ConfirmationEmergencyRegister.jsx
import React, { useState, useEffect } from 'react'; // Importer useState et useEffect
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Assurez-vous que Stethoscope est importé si vous l'utilisez pour l'icône médecin
import { AlertTriangle, CheckCircle, Clock, User, Stethoscope } from "lucide-react";
import axios from 'axios';

const ConfirmationEmergencyRegister = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialiser useNavigate

    // Récupération des données depuis l'état de la navigation
    const formData = location.state?.formData;
    const patientId = location.state?.patientId;
    const patientCode = location.state?.patientCode; // Peut être utilisé plus tard
    const initialAssignedDoctor = location.state?.assignedDoctor; // Peut être un ID ou un objet

    // --- États pour les données récupérées ---
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calcul en cours...'); // Pour le temps d'attente
    const [doctorInfo, setDoctorInfo] = useState(null); // Pour les détails complets du médecin
    const [loadingWaitTime, setLoadingWaitTime] = useState(true); // État de chargement pour le temps d'attente
    const [errorWaitTime, setErrorWaitTime] = useState(null); // Erreur pour le temps d'attente
    const [loadingDoctor, setLoadingDoctor] = useState(false); // État de chargement pour les détails du médecin

    // --- Effet pour récupérer le temps d'attente et les détails du médecin ---
    useEffect(() => {
        // Fonction pour récupérer le temps d'attente estimé
        const fetchWaitTime = async () => {
            if (!patientId) return; // Sortir si pas d'ID patient
            setLoadingWaitTime(true);
            setErrorWaitTime(null);
            try {
                // Appel API pour obtenir le temps d'attente
                const response = await axios.get(`http://localhost:8089/api/emergency-patients/${patientId}/estimated-wait-time`, { withCredentials: true });
                setEstimatedWaitTime(response.data.estimatedWaitTime || "Indisponible"); // Mettre à jour l'état
            } catch (error) {
                console.error("Erreur récupération temps d'attente:", error);
                setEstimatedWaitTime("Estimation indisponible"); // Message d'erreur
                setErrorWaitTime("Impossible de récupérer l'estimation.");
            } finally {
                setLoadingWaitTime(false); // Fin du chargement
            }
        };

        // Fonction pour récupérer les détails du médecin si nécessaire
        const fetchDoctorDetails = async () => {
            // Si on a déjà l'objet docteur complet via l'état de navigation
            if (initialAssignedDoctor && typeof initialAssignedDoctor === 'object' && initialAssignedDoctor !== null) {
                setDoctorInfo(initialAssignedDoctor);
            }
            // Si on a seulement l'ID du docteur via l'état de navigation
            else if (initialAssignedDoctor && typeof initialAssignedDoctor === 'string') {
                setLoadingDoctor(true);
                try {
                    // Appel API pour obtenir les détails de l'utilisateur (médecin)
                    // Assurez-vous que cette route existe et renvoie les infos voulues (username, specialization...)
                    const response = await axios.get(`http://localhost:8089/api/users/${initialAssignedDoctor}`, { withCredentials: true });
                    setDoctorInfo(response.data); // Mettre à jour avec les détails complets
                } catch (error) {
                    console.error("Erreur récupération détails médecin:", error);
                    // Fournir un fallback si l'appel échoue
                    setDoctorInfo({ username: 'Information Indisponible', specialization: 'N/A', _id: initialAssignedDoctor });
                } finally {
                    setLoadingDoctor(false);
                }
            } else {
                // Pas de médecin assigné initialement
                setDoctorInfo(null);
            }
        };

        // Appeler les fonctions au montage si patientId existe
        if (patientId) {
            fetchWaitTime();
            fetchDoctorDetails();
        } else {
            // Gérer le cas où l'ID patient est manquant dès le début
             setLoadingWaitTime(false);
             setLoadingDoctor(false);
             console.error("ID Patient manquant dans location.state");
        }

    }, [patientId, initialAssignedDoctor]); // Dépendances: re-exécuter si l'ID patient ou l'info médecin initiale change


    // --- Gestion de l'erreur si les données initiales manquent ---
   if (!formData || !patientId) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full shadow-lg rounded-2xl border border-red-200 bg-white transition-all duration-300 hover:shadow-xl">
                <CardHeader className="bg-red-50 rounded-t-2xl py-6 px-6">
                    <CardTitle className="text-red-700 flex items-center justify-center text-2xl font-semibold">
                        <AlertTriangle className="mr-2 h-6 w-6" />
                        Confirmation Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <p className="text-gray-600 text-center text-base">The confirmation information could not be found.</p>
                    <div className="flex justify-center space-x-4">
                        <Button asChild variant="outline" className="rounded-lg">
                            <Link to="/home">Back to Home</Link>
                        </Button>
                        <Button asChild className="bg-red-600 text-white hover:bg-red-700 rounded-lg">
                            <Link to="/emergency-register">New Request</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Rendu JSX ---
return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* CardHeader */}
            <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-700 text-white py-8 px-6">
                <CardTitle className="text-3xl font-bold flex items-center">
                    <CheckCircle className="mr-3 h-8 w-8 text-green-300" />
                    Emergency Request Registered
                </CardTitle>
                <CardDescription className="text-sky-100 text-lg mt-2">
                    Your request has been successfully submitted. Here is a summary.
                </CardDescription>
            </CardHeader>

            {/* CardContent */}
            <CardContent className="p-8 grid gap-8">
                {/* Section Personal Information */}
                <div className="bg-teal-50 rounded-xl p-6 shadow-sm border border-teal-100">
                    <h4 className="text-lg font-semibold text-teal-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                        <p><span className="font-medium">Born on:</span> {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-US') : 'N/A'}</p>
                        <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                        <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                        {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                        <p className="sm:col-span-2"><span className="font-medium">Address:</span> {formData.address}</p>
                        <p className="sm:col-span-2"><span className="font-medium">Emergency Contact:</span> {formData.emergencyContact}</p>
                    </div>
                </div>

                {/* Section Medical Information */}
                <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
                    <h4 className="text-lg font-semibold text-amber-900 mb-4">Medical Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        {formData.insuranceInfo && <p><span className="font-medium">Insurance:</span> {formData.insuranceInfo}</p>}
                        {formData.allergies && <p><span className="font-medium">Allergies:</span> {formData.allergies}</p>}
                        {formData.currentMedications && <p><span className="font-medium">Medications:</span> {formData.currentMedications}</p>}
                        {formData.medicalHistory && <p><span className="font-medium">Medical History:</span> {formData.medicalHistory}</p>}
                        <p className="sm:col-span-2"><span className="font-medium">Symptoms:</span> {formData.currentSymptoms}</p>
                        <p><span className="font-medium">Pain Level:</span> {formData.painLevel}/10</p>
                        <p><span className="font-medium">Emergency Level:</span> {formData.emergencyLevel}</p>
                    </div>
                </div>

                {/* Section Next Steps */}
                <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-blue-600" /> Next Steps
                    </h4>
                    <div className="space-y-3 text-gray-700 text-sm">
                        <p className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                            <strong className="w-40">Estimated Wait Time:</strong>
                            <span className={`font-semibold ${loadingWaitTime ? 'italic text-gray-500' : ''}`}>
                                {loadingWaitTime ? 'Calculating...' : estimatedWaitTime}
                                {errorWaitTime && <span className="text-red-500 text-xs ml-1">({errorWaitTime})</span>}
                            </span>
                        </p>
                        <div className="flex items-start">
                            <Stethoscope className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <strong className="w-40">Assigned Doctor:</strong>
                            {loadingDoctor ? (
                                <span className="italic text-gray-500">Loading...</span>
                            ) : doctorInfo ? (
                                <span className="font-semibold">{doctorInfo.username} ({doctorInfo.specialization || 'N/A'})</span>
                            ) : (
                                <span className="italic text-gray-500">Assignment in progress...</span>
                            )}
                        </div>
                        <p><strong>Stay Available:</strong> Our team will contact you. Keep your phone nearby.</p>
                        <p><strong>Preparation:</strong> Have your insurance card and medication list ready.</p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between mt-6">
                    <Button asChild variant="outline" className="rounded-lg">
                        <Link to="/home">Back to Home</Link>
                    </Button>
                    <Button
                        onClick={handleTrackStatusClick}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                    >
                        Track Request Status
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
);
};

export default ConfirmationEmergencyRegister;