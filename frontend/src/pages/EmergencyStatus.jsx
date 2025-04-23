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
    const [estimatedWaitTime, setEstimatedWaitTime] = useState('Calculating...');
    const [medicalAccess, setMedicalAccess] = useState({
        code: null,
        shouldDisplay: false,
        loading: false,
        error: null
    });

    const fetchPatientDetails = async () => {
        if (!patientId) {
            setError("Missing patient ID to retrieve details.");
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

            // Update estimated wait time
            updateWaitTime(response.data.status);

        } catch (err) {
            console.error("Error fetching details:", err);
            setError("Unable to retrieve request details.");
            setPatientDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicalAccessCode = async () => {
        if (!patientId) return;

        // Fetch code only if status warrants it
        if (!patientDetails || 
            !['Doctor En Route', 'Treated'].includes(patientDetails.status)) {
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
            console.error("Error fetching access code:", err);
            setMedicalAccess(prev => ({
                ...prev,
                loading: false,
                error: "Unable to retrieve medical access code"
            }));
        }
    };

    const updateWaitTime = (status) => {
        switch (status) {
            case "Request Registered":
                setEstimatedWaitTime("10-15 minutes (awaiting assignment/review)");
                break;
            case "Doctor Assigned":
                setEstimatedWaitTime("5-10 minutes (doctor notified)");
                break;
            case "Under Review":
                setEstimatedWaitTime("5-10 minutes");
                break;
            case "Doctor En Route":
                setEstimatedWaitTime("2-5 minutes");
                break;
            case "Treated":
                setEstimatedWaitTime("Treatment completed");
                break;
            case "Canceled":
                setEstimatedWaitTime("Request canceled");
                break;
            default:
                setEstimatedWaitTime("Unavailable");
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchPatientDetails();
            const interval = setInterval(fetchPatientDetails, 10000);
            return () => clearInterval(interval);
        } else {
            setError("No patient ID provided.");
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (patientDetails) {
            fetchMedicalAccessCode();
        }
    }, [patientDetails?.status]);

    const renderDoctorInfo = () => {
        if (!patientDetails?.assignedDoctor) {
            return <p className="text-orange-600">Awaiting doctor assignment...</p>;
        }
        const doctor = patientDetails.assignedDoctor;
        return (
            <div className="border rounded-md p-6 bg-green-50">
                <h4 className="font-semibold mb-4 flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5 text-green-700" /> 
                    Assigned Doctor
                </h4>
                <p><strong>Name:</strong> {doctor.username || 'Information not available'}</p>
                <p><strong>Specialization:</strong> {doctor.specialization || 'Not specified'}</p>
            </div>
        );
    };

    const renderMedicalAccessCode = () => {
        if (medicalAccess.loading) {
            return <p className="text-gray-600">Loading access code...</p>;
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
                    Your Medical Access Code
                </h4>
                <div className="bg-white p-4 rounded-md border border-purple-200">
                    <p className="text-center text-2xl font-bold text-purple-800">
                        {medicalAccess.code}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        Keep this code secure to access your records
                    </p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <p>This code allows you to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>View your medical records online</li>
                        <li>Share information with professionals</li>
                        <li>Access your complete medical history</li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 md:px-6">
            <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader className="flex flex-col space-y-1 bg-blue-50 p-6 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                        <Clock className="mr-2 h-6 w-6 text-blue-600" />
                        Status of Your Emergency Request
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        Track the progress of your request in real time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {loading && (
                        <div className="text-center p-4">
                            <p className="text-gray-600">Loading information...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
                            <p>{error}</p>
                            {!patientId && <p>Please go back and resubmit the form.</p>}
                        </div>
                    )}
                    {!loading && !error && patientDetails && (
                        <>
                            <div className="border rounded-md p-6 bg-gray-100">
                                <h4 className="font-semibold mb-2 text-gray-800">Current Status:</h4>
                                <p className="text-xl font-bold text-blue-700">{patientDetails.status}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Last updated: {new Date(patientDetails.updatedAt).toLocaleString()}
                                </p>
                            </div>

                            {renderDoctorInfo()}
                            {renderMedicalAccessCode()}

                            <div className="border rounded-md p-6 bg-blue-100">
                                <h4 className="font-semibold mb-2 text-blue-800 flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-blue-700" /> Estimated Wait Time
                                </h4>
                                <p className="text-blue-900">
                                    The estimated wait time is currently: {' '}
                                    <span className="font-semibold">{estimatedWaitTime}</span>.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                                <Button asChild variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                                    <Link to="/home">Back to Home</Link>
                                </Button>
                                {patientDetails.status !== 'Treated' && patientDetails.status !== 'Canceled' && (
                                    <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Link to="/calendar">
                                            <Calendar className="mr-2 h-4 w-4" /> Schedule a Follow-Up Appointment
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                    {!loading && !error && !patientDetails && !patientId && (
                        <div className="text-center p-4 text-gray-600">
                            Unable to display status without patient ID.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyStatus;