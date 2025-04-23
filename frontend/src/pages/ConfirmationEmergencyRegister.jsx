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
    const patientCode = location.state?.patientCode;
    const predictedWaitTime = location.state?.predictedWaitTime;
    const assignedDoctor = location.state?.assignedDoctor;

    const [waitTime, setWaitTime] = useState(predictedWaitTime || null);
    const [doctorInfo, setDoctorInfo] = useState(assignedDoctor || null);

    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (!patientId) return;

        const timer = setTimeout(() => {
            setWaitTime(Math.random() * 30 + 15);
        }, 1000);

        if (assignedDoctor && typeof assignedDoctor === 'object') {
            setDoctorInfo(assignedDoctor);
        } else if (assignedDoctor) {
            axios.get(`http://localhost:8089/api/users/${assignedDoctor}`)
                .then(response => setDoctorInfo(response.data))
                .catch(console.error);
        }

        return () => clearTimeout(timer);
    }, [patientId, assignedDoctor]);

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
                        <p className="text-gray-600 text-center text-base">Confirmation information could not be found.</p>
                        <div className="flex justify-center space-x-4">
                            <Button asChild variant="outline" className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 px-6 py-2">
                                <Link to="/home">Back to Home</Link>
                            </Button>
                            <Button asChild className="bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200 px-6 py-2">
                                <Link to="/emergency-register">New Request</Link>
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
        <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto shadow-xl rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-sky-400 to-sky-600 text-white py-8 px-6">
                    <CardTitle className="text-3xl font-bold flex items-center">
                        <CheckCircle className="mr-3 h-8 w-8 text-green-300" />
                        Emergency Request Registered
                    </CardTitle>
                    <CardDescription className="text-sky-100 text-lg mt-2">
                        Your request has been successfully submitted. Here is a summary of the information provided.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 grid gap-8">
                    <div className="bg-teal-50 rounded-xl p-6 shadow-md border border-teal-100 transition-all duration-200">
                        <h4 className="text-lg font-semibold text-teal-900 mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                            <p><span className="font-medium">Date of Birth:</span> {formData.dateOfBirth}</p>
                            <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                            <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                            {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                            <p><span className="font-medium">Address:</span> {formData.address}</p>
                            <p><span className="font-medium">Emergency Contact:</span> {formData.emergencyContact}</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6 shadow-md border border-amber-100 transition-all duration-200">
                        <h4 className="text-lg font-semibold text-amber-900 mb-4">Medical Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            {formData.insuranceInfo && <p><span className="font-medium">Insurance:</span> {formData.insuranceInfo}</p>}
                            {formData.allergies && <p><span className="font-medium">Allergies:</span> {formData.allergies}</p>}
                            {formData.currentMedications && <p><span className="font-medium">Current Medications:</span> {formData.currentMedications}</p>}
                            {formData.medicalHistory && <p><span className="font-medium">Medical History:</span> {formData.medicalHistory}</p>}
                            <p><span className="font-medium">Current Symptoms:</span> {formData.currentSymptoms}</p>
                            <p><span className="font-medium">Pain Level:</span> {formData.painLevel}</p>
                            <p><span className="font-medium">Emergency Level:</span> {formData.emergencyLevel}</p>
                        </div>
                    </div>

                    <div className="bg-sky-100 rounded-xl p-6 shadow-md border border-sky-200 transition-all duration-200">
                        <h4 className="text-lg font-semibold text-sky-800 mb-4 flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5 text-sky-600" /> Next Steps
                        </h4>
                        <div className="space-y-4 text-gray-700">
                            <p>
                                <strong className="flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-sky-600" /> Estimated Wait Time:
                                </strong> {waitTime ? `${waitTime.toFixed(0)} minutes` : "Calculating..."}
                            </p>
                            {doctorInfo ? (
                                <p>
                                    <strong className="flex items-center">
                                        <User className="mr-2 h-5 w-5 text-green-600" /> Assigned Doctor:
                                    </strong> {doctorInfo.username} (Specialty: {doctorInfo.specialization}, Contact: {doctorInfo.email})
                                </p>
                            ) : (
                                <p>
                                    <strong className="flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-sky-600" /> Doctor Assignment:
                                    </strong> In progress...
                                </p>
                            )}
                            <p>
                                <strong className="flex items-center">
                                    <Clock className="mr-2 h-5 w-5 text-sky-600" /> Stay Available:
                                </strong> A medical team will contact you shortly. Please remain reachable.
                            </p>
                            <p>
                                <strong>Preparation:</strong> Gather your insurance card, current medications, and any relevant medical documents.
                            </p>
                            <p>
                                <strong>Stay at Your Location:</strong> Unless otherwise instructed, remain at your address to facilitate emergency or ambulance response if needed.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <Button asChild variant="outline" className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-base px-6 py-2">
                            <Link to="/home">Back to Home</Link>
                        </Button>
                        <Button 
                            onClick={handleTrackStatusClick} 
                            className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors duration-200 text-base px-6 py-2"
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