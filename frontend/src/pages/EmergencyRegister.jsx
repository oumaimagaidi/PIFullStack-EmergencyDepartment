// src/pages/EmergencyRegister.jsx
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertTriangle, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Importez useNavigate
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
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }), // Keep as string for now, handle formatting later if needed
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender"
  }),
  phoneNumber: z.string().min(8, { message: "Invalid phone number" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  emergencyContact: z.string().min(8, { message: "Invalid emergency contact" }),
  insuranceInfo: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentSymptoms: z.string().min(5, { message: "Please describe your current symptoms" }),
  painLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    required_error: "Please select your pain level"
  }),
  emergencyLevel: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select the emergency level"
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

const EmergencyRegister = () => {
  const form = useForm({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "", // Initialize gender
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      insuranceInfo: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      currentSymptoms: "",
      painLevel: "", // Initialize painLevel
      emergencyLevel: "", // Initialize emergencyLevel
      acceptTerms: false,
    },
  });
  const navigate = useNavigate(); // Initialisez useNavigate
  async function onSubmit(data) {
    try {
      // Correct URL for the backend endpoint
      const response = await axios.post('http://localhost:8089/api/emergency-patients', data);
      console.log(response.data);
      toast.success("Your emergency request has been registered", {
        description: "A member of our medical team will contact you shortly.",
      });
      form.reset(); // Reset the form after successful submission
      navigate('/emergency-confirmation', { state: { formData: data } }); // Redirection après succès

    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        // Handle specific validation errors from the backend
        if (error.response.data.message && Array.isArray(error.response.data.message)) {
          error.response.data.message.forEach(errorMessage => {
            toast.error("Validation Error", { description: errorMessage });
          });

        } else {
          toast.error("Failed to register emergency request", {
            description: error.response.data.message || "An error occurred on the server.",
          });
        }


      } else if (error.request) {
        console.error("No response received from server");
        toast.error("Failed to register emergency request", {
          description: "No response received from the server. Please check your network connection.",
        });
      } else {
        console.error("Error setting up request:", error.message);
        toast.error("Failed to register emergency request", {
          description: "An unexpected error occurred. Please try again later.",
        });
      }
    }
  }


  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-400 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <Heart className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Patient Emergency Registration
          </CardTitle>
          <CardDescription className="text-base">
            Please fill out this form with your information and the issues you are currently experiencing.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-blue-600">Personal Information</h3>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                              </FormControl>
                              <FormLabel className="font-normal text-blue-700">
                                Male
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                              </FormControl>
                              <FormLabel className="font-normal text-blue-700">
                                Female
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" className="border-blue-500 text-blue-600 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                              </FormControl>
                              <FormLabel className="font-normal text-blue-700">
                                Other
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 555-555-5555" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Email (optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Your full address" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Name and phone number" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormDescription className="text-blue-600">
                          Person to contact in case of emergency
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Medical Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-blue-600">Medical Information</h3>

                  <FormField
                    control={form.control}
                    name="insuranceInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Insurance Information (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Insurance policy number" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Allergies (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="List any known allergies" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Current Medications (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Medications you are currently taking" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Medical History (optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Pre-existing medical conditions" {...field} className="border-blue-300 focus:ring-blue-500 focus:border-blue-500" />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Current Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe in detail the symptoms you are experiencing"
                            className="min-h-[120px] border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Pain Level (1-10)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500">
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
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800">Emergency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500">
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
                    )}
                  />
                </div>
              </div>

              {/* Terms and Conditions Section */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-300 p-4 bg-blue-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-blue-800">
                        I accept the terms and conditions and authorize the facility to process my medical data
                      </FormLabel>
                      <FormDescription className="text-blue-600">
                        By checking this box, you agree to your information being used for your medical care.
                      </FormDescription>
                    </div>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
              >
                Submit Emergency Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyRegister;