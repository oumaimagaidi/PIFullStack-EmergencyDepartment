

import { useEffect, useRef, useState } from "react"; // Added useState
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertTriangle, Heart, Stethoscope, User, UserPlus } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs imports
import axios from 'axios'; // Added axios

// Zod Schema (remains the same)
const emergencyFormSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
    gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
    phoneNumber: z.string().min(8, { message: "Invalid phone number" }),
    email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")), // Allow empty string
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    emergencyContact: z.string().min(8, { message: "Invalid emergency contact" }),
    insuranceInfo: z.string().optional(),
    allergies: z.string().optional(),
    currentMedications: z.string().optional(),
    medicalHistory: z.string().optional(),
    currentSymptoms: z.string().min(5, { message: "Please describe your current symptoms" }),
    painLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], { required_error: "Please select your pain level" }),
    emergencyLevel: z.enum(["low", "medium", "high", "critical"], { required_error: "Please select the emergency level" }),
    acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" }),
});


const EmergencyRegister = () => {
    // Removed activeTab state as Tabs component handles it internally
    const containerRef = useRef(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const form = useForm({
        resolver: zodResolver(emergencyFormSchema),
        defaultValues: { // Kept default values
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "",
            phoneNumber: "",
            email: "",
            address: "",
            emergencyContact: "",
            insuranceInfo: "",
            allergies: "",
            currentMedications: "",
            medicalHistory: "",
            currentSymptoms: "",
            painLevel: "",
            emergencyLevel: "",
            acceptTerms: false,
        },
    });

    // Parallax effect (kept from functional snippet)
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollPosition = window.scrollY;
                const offset = scrollPosition * 0.3;
                containerRef.current.style.backgroundPositionY = `${50 - offset}px`;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // onSubmit function (kept from functional snippet)
    async function onSubmit(data) {
        // Ensure optional email is null if empty string before sending
        const submitData = {
            ...data,
            email: data.email === "" ? undefined : data.email,
        };
        console.log("Submitting data:", submitData); // Log data being sent

        try {
            const response = await axios.post('http://localhost:8089/api/emergency-patients', submitData); // Use submitData
            console.log("Full response:", response);

            // Check nested structure correctly
            if (!response.data || !response.data.patient || !response.data.patient._id) {
                 console.error("API Response missing expected patient data:", response.data);
                throw new Error("Invalid response format from server after registration.");
            }
            const patientData = response.data.patient;
            const patientCode = response.data.patientCode; // Assuming backend sends this

            toast.success("Your emergency request has been registered", {
                description: "A member of our medical team will contact you shortly."
            });
            form.reset(); // Reset form after successful submission
            navigate('/emergency-confirmation', { // Navigate to confirmation page
                state: {
                    formData: submitData, // Send submitted data
                    patientId: patientData._id,
                    patientCode: patientCode,
                    assignedDoctor: patientData.assignedDoctor || null // Pass assigned doctor info if available
                }
            });
        } catch (error) {
            console.error("Registration error:", error);
            let errorDescription = "An unexpected error occurred. Please try again.";
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with a status code outside 2xx range
                    console.error("Error data:", error.response.data);
                    console.error("Error status:", error.response.status);
                    errorDescription = error.response.data.message || `Server error: ${error.response.status}`;
                    if (error.response.data.details) {
                        errorDescription += ` Details: ${JSON.stringify(error.response.data.details)}`;
                    }
                } else if (error.request) {
                    // Request was made but no response received
                    console.error("Error request:", error.request);
                    errorDescription = "No response from server. Please check your connection.";
                } else {
                    // Something happened setting up the request
                    errorDescription = error.message;
                }
            } else {
                 errorDescription = error.message || "An unknown error occurred.";
            }

            toast.error("Registration failed", {
                description: errorDescription
            });
        }
    }


    return (
        <div
            ref={containerRef} // Added ref
            className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 flex items-center justify-center pt-[90px]"
            style={{
                // Updated placeholder image URL if needed, or keep doctor-avatar
                backgroundImage: `url('/images/doctor-avatar.jpg')`,
                backgroundPosition: "right center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundAttachment: "fixed",
            }}
        >
            {/* --- UI Structure from the first snippet --- */}
            <div className="max-w-7xl w-full">
                <Card className="shadow-2xl border-0 overflow-hidden">
                    {/* Card Header (kept from UI snippet) */}
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-8">
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <AlertTriangle className="h-8 w-8 text-white" />
                            </div>
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                                <Heart className="h-8 w-8 text-white animate-pulse" />
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-bold mt-4">Emergency Patient Registration</CardTitle>
                        <CardDescription className="text-blue-100 text-lg">
                            Our medical team is here to assist you. Please provide your details.
                        </CardDescription>
                    </CardHeader>

                    {/* Form integrated with Tabs UI */}
                    <Form {...form}>
                        {/* Use form.handleSubmit with integrated onSubmit function */}
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col lg:flex-row">

                                {/* Left Side: Personal Info (kept from UI snippet) */}
                                <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 p-8">
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <UserPlus className="h-7 w-7 text-blue-600" />
                                            <h3 className="text-2xl font-semibold text-blue-800">Personal Information</h3>
                                        </div>
                                        <div className="space-y-6">
                                            {/* All FormField components for personal info here... */}
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                                <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                            </div>
                                            <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="phoneNumber" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+1 555-555-5555" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email (optional)</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Your full address" {...field} className="rounded-lg bg-white/70" /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="emergencyContact" render={({ field }) => ( <FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input placeholder="Name and phone number" {...field} className="rounded-lg bg-white/70" /></FormControl><FormDescription>Person to contact in case of emergency</FormDescription><FormMessage /></FormItem> )} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Medical Info with Tabs (kept from UI snippet) */}
                                <div className="w-full lg:w-1/2 bg-white p-8">
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Stethoscope className="h-7 w-7 text-teal-600" />
                                            <h3 className="text-2xl font-semibold text-teal-800">Medical Information</h3>
                                        </div>
                                        <Tabs defaultValue="symptoms" className="w-full">
                                            <TabsList className="grid grid-cols-3 mb-6">
                                                <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                                                <TabsTrigger value="history">Medical History</TabsTrigger>
                                                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                                            </TabsList>

                                            {/* Symptoms Tab */}
                                            <TabsContent value="symptoms" className="space-y-6">
                                                 {/* FormFields for symptoms, painLevel, emergencyLevel */}
                                                <FormField control={form.control} name="currentSymptoms" render={({ field }) => ( <FormItem><FormLabel>Current Symptoms</FormLabel><FormControl><Textarea placeholder="Describe symptoms..." className="min-h-[120px] rounded-lg" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name="painLevel" render={({ field }) => ( <FormItem><FormLabel>Pain Level (1-10)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select level" /></SelectTrigger></FormControl><SelectContent>{[...Array(10)].map((_, i) => <SelectItem key={i + 1} value={`${i + 1}`}>{`${i + 1}${i + 1 === 1 ? ' - Very mild': ''}${i + 1 === 5 ? ' - Moderate': ''}${i + 1 === 10 ? ' - Unbearable': ''}`}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                                <FormField control={form.control} name="emergencyLevel" render={({ field }) => ( <FormItem><FormLabel>Emergency Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Select level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                </div>
                                            </TabsContent>

                                            {/* History Tab */}
                                            <TabsContent value="history" className="space-y-6">
                                                 {/* FormFields for allergies, currentMedications, medicalHistory */}
                                                <FormField control={form.control} name="allergies" render={({ field }) => ( <FormItem><FormLabel>Allergies (optional)</FormLabel><FormControl><Textarea placeholder="List known allergies" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem> )} />
                                                <FormField control={form.control} name="currentMedications" render={({ field }) => ( <FormItem><FormLabel>Current Medications (optional)</FormLabel><FormControl><Textarea placeholder="List current medications" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem> )} />
                                                <FormField control={form.control} name="medicalHistory" render={({ field }) => ( <FormItem><FormLabel>Medical History (optional)</FormLabel><FormControl><Textarea placeholder="List pre-existing conditions" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem> )} />
                                            </TabsContent>

                                            {/* Insurance Tab */}
                                            <TabsContent value="insurance" className="space-y-6">
                                                 {/* FormField for insuranceInfo */}
                                                <FormField control={form.control} name="insuranceInfo" render={({ field }) => ( <FormItem><FormLabel>Insurance Information (optional)</FormLabel><FormControl><Input placeholder="Insurance policy number" {...field} className="rounded-lg" /></FormControl><FormMessage /></FormItem> )} />
                                                <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm text-blue-700">Insurance information is optional...</p></div>
                                            </TabsContent>
                                        </Tabs>

                                        {/* Terms and Submit Button (kept from UI snippet) */}
                                        <div className="mt-8 space-y-6">
                                            <FormField control={form.control} name="acceptTerms" render={({ field }) => ( <FormItem className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl><div className="space-y-1"><FormLabel>I accept the terms and conditions</FormLabel><FormDescription>By checking this box...</FormDescription><FormMessage /></div></FormItem> )} />
                                            <div className="flex justify-between items-center gap-4">
                                                <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3 flex-1"><AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" /><p className="text-sm text-yellow-700">For immediate life-threatening emergencies, please call 911.</p></div>
                                                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-6 px-8 rounded-xl shadow-lg transition-all duration-300 flex-shrink-0">
                                                    <Heart className="h-5 w-5 mr-2" /> Submit
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default EmergencyRegister;