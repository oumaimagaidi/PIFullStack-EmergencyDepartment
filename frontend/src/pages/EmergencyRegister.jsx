// src/pages/EmergencyRegister.jsx
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertTriangle, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import axios from 'axios';

const emergencyFormSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
    gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
    phoneNumber: z.string().min(8, { message: "Invalid phone number" }),
    email: z.string().email({ message: "Invalid email address" }).optional(),
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
    const form = useForm({ resolver: zodResolver(emergencyFormSchema), defaultValues: { firstName: "", lastName: "", dateOfBirth: "", gender: "", phoneNumber: "", email: "", address: "", emergencyContact: "", insuranceInfo: "", allergies: "", currentMedications: "", medicalHistory: "", currentSymptoms: "", painLevel: "", emergencyLevel: "", acceptTerms: false } });
    const navigate = useNavigate();

    async function onSubmit(data) {
        try {
            const response = await axios.post('http://localhost:8089/api/emergency-patients', data);
            console.log("Response data after registration (EmergencyRegister):", JSON.stringify(response.data, null, 2));
            const patientIdToNavigate = response.data._id;
              
            toast.success("Your emergency request has been registered", { description: "A member of our medical team will contact you shortly." });
            form.reset();
            navigate('/emergency-confirmation', { state: { formData: data, patientId: patientIdToNavigate } });

        } catch (error) {
            if (error.response) {
                console.error("Server error:", error.response.data);
                if (error.response.data.message && Array.isArray(error.response.data.message)) {
                    error.response.data.message.forEach(errorMessage => { toast.error("Validation Error", { description: errorMessage }); });
                } else {
                    toast.error("Failed to register emergency request", { description: error.response.data.message || "An error occurred on the server." });
                }
            } else if (error.request) {
                console.error("No response received from server");
                toast.error("Failed to register emergency request", { description: "No response received from the server. Please check your network connection." });
            } else {
                console.error("Error setting up request:", error.message);
                toast.error("Failed to register emergency request", { description: "An unexpected error occurred. Please try again later." });
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <Card className="w-full max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-6 px-8">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-yellow-300" />
                        <Heart className="h-8 w-8 text-red-300 animate-pulse" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold mt-2">Emergency Patient Registration</CardTitle>
                    <CardDescription className="text-indigo-100 text-lg">Provide your details and describe your emergency for immediate assistance.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2">Personal Information</h3>
                                    <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">First Name</FormLabel><FormControl><Input placeholder="John" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel><FormControl><Input type="date" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2"><FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="male" className="border-indigo-500 text-indigo-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white" /></FormControl><FormLabel className="font-normal text-gray-600">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="female" className="border-indigo-500 text-indigo-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white" /></FormControl><FormLabel className="font-normal text-gray-600">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="other" className="border-indigo-500 text-indigo-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white" /></FormControl><FormLabel className="font-normal text-gray-600">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel><FormControl><Input placeholder="+1 555-555-5555" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Email (optional)</FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Address</FormLabel><FormControl><Textarea placeholder="Your full address" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="emergencyContact" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Emergency Contact</FormLabel><FormControl><Input placeholder="Name and phone number" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormDescription className="text-gray-500 text-sm">Person to contact in case of emergency</FormDescription><FormMessage className="text-red-600" /></FormItem>)} />
                                </div>
                                {/* Medical Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-2">Medical Information</h3>
                                    <FormField control={form.control} name="insuranceInfo" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Insurance Information (optional)</FormLabel><FormControl><Input placeholder="Insurance policy number" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="allergies" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Allergies (optional)</FormLabel><FormControl><Textarea placeholder="List any known allergies" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="currentMedications" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Current Medications (optional)</FormLabel><FormControl><Textarea placeholder="Medications you are currently taking" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="medicalHistory" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Medical History (optional)</FormLabel><FormControl><Textarea placeholder="Pre-existing medical conditions" {...field} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="currentSymptoms" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Current Symptoms</FormLabel><FormControl><Textarea placeholder="Describe in detail the symptoms you are experiencing" className="min-h-[140px] rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all" {...field} /></FormControl><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="painLevel" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Pain Level (1-10)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all"><SelectValue placeholder="Select pain level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1 - Very mild</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="4">4</SelectItem><SelectItem value="5">5 - Moderate</SelectItem><SelectItem value="6">6</SelectItem><SelectItem value="7">7</SelectItem><SelectItem value="8">8</SelectItem><SelectItem value="9">9</SelectItem><SelectItem value="10">10 - Unbearable</SelectItem></SelectContent></Select><FormMessage className="text-red-600" /></FormItem>)} />
                                    <FormField control={form.control} name="emergencyLevel" render={({ field }) => (<FormItem><FormLabel className="text-gray-700 font-medium">Emergency Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all"><SelectValue placeholder="Select emergency level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Low - I can wait</SelectItem><SelectItem value="medium">Medium - I need to see a doctor today</SelectItem><SelectItem value="high">High - I need care quickly</SelectItem><SelectItem value="critical">Critical - Life-threatening emergency</SelectItem></SelectContent></Select><FormMessage className="text-red-600" /></FormItem>)} />
                                </div>
                            </div>
                            <FormField control={form.control} name="acceptTerms" render={({ field }) => (<FormItem className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 bg-gray-50 shadow-sm"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" /></FormControl><div className="space-y-1"><FormLabel className="text-gray-700 font-medium">I accept the terms and conditions</FormLabel><FormDescription className="text-gray-500 text-sm">By checking this box, you authorize the facility to process your medical data for your care.</FormDescription></div><FormMessage className="text-red-600" /></FormItem>)} />
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300">Submit Emergency Request</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyRegister;