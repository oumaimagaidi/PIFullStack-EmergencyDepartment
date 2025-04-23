// src/pages/EmergencyRegister.jsx
import React, { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertTriangle, Heart, Stethoscope, User, UserPlus } from "lucide-react";
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
    const form = useForm({
        resolver: zodResolver(emergencyFormSchema),
        defaultValues: {
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
            acceptTerms: false
        }
    });
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Effet de parallaxe
    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollPosition = window.scrollY;
                const offset = scrollPosition * 0.3; // Ajuster la vitesse (0.3 pour un effet subtil)
                containerRef.current.style.backgroundPositionY = `${50 - offset}px`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    async function onSubmit(data) {
        try {
            const response = await axios.post('http://localhost:8089/api/emergency-patients', data);
            console.log("Full response:", response);
            console.log("Patient data:", response.data);
            if (!response.data || !response.data.patient || !response.data.patient._id) {
                throw new Error("Invalid response format from server");
            }
            const patientData = response.data.patient;
            const patientCode = response.data.patientCode;
            toast.success("Your emergency request has been registered", {
                description: "A member of our medical team will contact you shortly."
            });
            form.reset();
            navigate('/emergency-confirmation', {
                state: {
                    formData: data,
                    patientId: patientData._id,
                    patientCode: patientCode,
                    assignedDoctor: patientData.assignedDoctor || null
                }
            });
        } catch (error) {
            console.error("Registration error:", error);
            if (error.response) {
                toast.error("Registration failed", {
                    description: error.response.data.message || "Server error occurred"
                });
            } else {
                toast.error("Registration failed", {
                    description: error.message || "Network error occurred"
                });
            }
        }
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 flex items-center justify-center pt-[90px]" // Ajout de pt-[80px] pour l'espace sous le header
            style={{
                backgroundImage: `url('/images/doctor-avatar.jpg')`,
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">
                {/* Left Section: Form */}
                <Card className="w-full md:w-3/4 max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-blue-100 animate-in fade-in duration-500 bg-white">
                    <CardHeader className="relative bg-gradient-to-r from-blue-600 to-teal-500 text-white py-8 px-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-full shadow-md">
                                <AlertTriangle className="h-8 w-8 text-yellow-400" />
                            </div>
                            <div className="p-2 bg-white rounded-full shadow-md">
                                <Heart className="h-8 w-8 text-red-400 animate-pulse" />
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-bold mt-4 tracking-tight">Emergency Patient Registration</CardTitle>
                        <CardDescription className="text-blue-100 text-lg mt-2">Our medical team is here to assist you. Please provide your details.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 bg-white">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Personal Information */}
                                    <div className="space-y-8 relative">
                                        <div className="flex items-center gap-3">
                                            <UserPlus className="h-8 w-8 text-blue-600" />
                                            <h3 className="text-2xl font-semibold text-blue-700">Personal Information</h3>
                                        </div>
                                        <FormField control={form.control} name="firstName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> First Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Last Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Date of Birth
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="gender" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Gender
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-3">
                                                        <FormItem className="flex items-center space-x-3">
                                                            <FormControl>
                                                                <RadioGroupItem value="male" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-gray-700">Male</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3">
                                                            <FormControl>
                                                                <RadioGroupItem value="female" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-gray-700">Female</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3">
                                                            <FormControl>
                                                                <RadioGroupItem value="other" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-gray-700">Other</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 555-555-5555" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Email (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="email@example.com" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Your full address" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-500" /> Emergency Contact
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Name and phone number" {...field} className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormDescription className="text-gray-600 text-sm">Person to contact in case of emergency</FormDescription>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                    </div>
                                    {/* Medical Information */}
                                    <div className="space-y-8 relative">
                                        <div className="flex items-center gap-3">
                                            <Stethoscope className="h-8 w-8 text-teal-600" />
                                            <h3 className="text-2xl font-semibold text-teal-700">Medical Information</h3>
                                        </div>
                                        <FormField control={form.control} name="insuranceInfo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Insurance Information (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Insurance policy number" {...field} className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="allergies" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Allergies (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="List any known allergies" {...field} className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="currentMedications" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Current Medications (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Medications you are currently taking" {...field} className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Medical History (optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Pre-existing medical conditions" {...field} className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="currentSymptoms" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Current Symptoms
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Describe in detail the symptoms you are experiencing" className="min-h-[160px] rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="painLevel" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Pain Level (1-10)
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm">
                                                            <SelectValue placeholder="Select pain level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 - Very mild</SelectItem>
                                                        <SelectItem value="2">2</SelectItem>
                                                        <SelectItem value="3">3</SelectItem>
                                                        <SelectItem value="4">4</SelectItem>
                                                        <SelectItem value="5">5 - Moderate</SelectItem>
                                                        <SelectItem value="6">6</SelectItem>
                                                        <SelectItem value="7">7</SelectItem>
                                                        <SelectItem value="8">8</SelectItem>
                                                        <SelectItem value="9">9</SelectItem>
                                                        <SelectItem value="10">10 - Unbearable</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="emergencyLevel" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    <Stethoscope className="h-4 w-4 text-teal-500" /> Emergency Level
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-sm">
                                                            <SelectValue placeholder="Select emergency level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low - I can wait</SelectItem>
                                                        <SelectItem value="medium">Medium - I need to see a doctor today</SelectItem>
                                                        <SelectItem value="high">High - I need care quickly</SelectItem>
                                                        <SelectItem value="critical">Critical - Life-threatening emergency</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                                    <FormItem className="flex items-start space-x-4 rounded-xl border border-gray-200 p-6 bg-gray-50 shadow-sm">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-5 w-5" />
                                        </FormControl>
                                        <div className="space-y-2">
                                            <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                <User className="h-4 w-4 text-blue-500" /> I accept the terms and conditions
                                            </FormLabel>
                                            <FormDescription className="text-gray-600 text-sm">By checking this box, you authorize the facility to process your medical data for your care.</FormDescription>
                                        </div>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )} />
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                                    <Heart className="h-5 w-5" /> Submit Emergency Request
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmergencyRegister;