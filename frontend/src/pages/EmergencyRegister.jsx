"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { AlertTriangle, Heart, Stethoscope, UserPlus, Sparkles, Loader2, Info } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import ParticlesComponent from "@/components/ParticlesComponent"

// Updated color palette
const colors = {
  primary: "#213448", // Dark blue
  secondary: "#547792", // Medium blue
  alert: "#dc2626", // Red
  primaryLight: "#94B4C1", // Light blue
  secondaryLight: "#ECEFCA", // Light cream/beige
  alertLight: "#fee2e2",
  bgAccent: "#ECEFCA", // Light cream/beige for background
}

const emergencyFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  phoneNumber: z.string().min(8, { message: "Invalid phone number" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  emergencyContact: z.string().min(8, { message: "Invalid emergency contact" }),
  insuranceInfo: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentSymptoms: z.string().min(10, { message: "Please describe your symptoms in more detail (min 10 chars)" }),
  painLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    required_error: "Please select your pain level",
  }),
  emergencyLevel: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select the emergency level",
  }),
  acceptTerms: z.boolean().refine((val) => val === true, { message: "You must accept the terms and conditions" }),
})

const EmergencyRegister = () => {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined,
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      insuranceInfo: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      currentSymptoms: "",
      painLevel: undefined,
      emergencyLevel: undefined,
      acceptTerms: false,
    },
  })

  const [aiSuggestions, setAiSuggestions] = useState({ keywords: [], suggestedQuestions: [] })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = window.scrollY
        const offset = scrollPosition * 0.2
        containerRef.current.style.backgroundPositionY = `calc(50% + ${-offset}px)`
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAnalyzeSymptoms = async () => {
    const symptomText = form.getValues("currentSymptoms")
    if (!symptomText || symptomText.trim().length < 10) {
      setAnalysisError("Please describe your symptoms in more detail (at least 10 characters) before analyzing.")
      setAiSuggestions({ keywords: [], suggestedQuestions: [] })
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAiSuggestions({ keywords: [], suggestedQuestions: [] })

    try {
      console.log("[Frontend] Sending for analysis:", symptomText)
      const response = await axios.post("http://localhost:8089/api/ai/analyze-symptoms", { symptomText })
      console.log("[Frontend] Suggestions received:", response.data)
      setAiSuggestions(response.data)
      if (response.data.error) {
        setAnalysisError(response.data.error)
      }
    } catch (error) {
      console.error("[Frontend] Analysis error:", error)
      const message = error.response?.data?.message || "Symptom analysis failed. Check server connection or try again."
      setAnalysisError(message)
      toast.error("Analysis Error", { description: message })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addSuggestedQuestionToSymptoms = (question) => {
    const currentSymptoms = form.getValues("currentSymptoms")
    const newSymptoms = `${currentSymptoms}\n\nSuggested Question: ${question}\n- `
    form.setValue("currentSymptoms", newSymptoms, { shouldValidate: true })
    const textarea = document.querySelector('textarea[name="currentSymptoms"]')
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length
    }
  }

  async function onSubmit(data) {
    const submitData = {
      ...data,
      email: data.email === "" ? undefined : data.email,
    }
    console.log("Submitting data:", submitData)

    try {
      const response = await axios.post("http://localhost:8089/api/emergency-patients", submitData, {
        withCredentials: true,
      })
      console.log("Full response:", response)

      const responseData = response.data
      const patientData = responseData?.patient

      if (!patientData) {
        console.error("Patient object missing in response:", responseData)
        throw new Error("Unexpected server response format (patient missing).")
      }

      const patientId = patientData._id
      const patientCode = responseData?.patientCode
      const assignedDoctor = patientData?.assignedDoctor

      if (!patientId) {
        console.error("Patient ID (_id) missing in patient object:", patientData)
        throw new Error("Invalid response format after submission (ID missing).")
      }

      console.log("Submission successful. Patient ID:", patientId)

      toast.success("Your emergency request has been registered.", {
        description: "Our team will contact you shortly.",
      })
      form.reset()

      navigate("/emergency-confirmation", {
        state: {
          formData: submitData,
          patientId: patientId,
          patientCode: patientCode,
          assignedDoctor: assignedDoctor || null,
        },
      })
    } catch (error) {
      console.error("Submission error:", error)
      let errorDescription = "An unexpected error occurred. Please try again."

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Axios Error Details (Response):", {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers,
          })
          errorDescription = error.response.data?.message || `Server error: ${error.response.status}`
          if (error.response.data?.details) {
            errorDescription += ` Details: ${JSON.stringify(error.response.data.details)}`
          }
        } else if (error.request) {
          console.error("Axios Error Details (Request):", error.request)
          errorDescription = "No response from server. Check your connection."
        } else {
          console.error("Axios Error Details (Setup):", error.message)
          errorDescription = error.message
        }
      } else if (error instanceof Error && error.message.includes("Invalid response format")) {
        errorDescription = error.message
      } else if (error instanceof Error) {
        errorDescription = error.message
      }

      toast.error("Submission Failed", { description: errorDescription })
    }
  }

  return (
    <div className="w-6xl mx-auto py-20 px-4 relative z-10 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF] font-sans">    
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="emergency-particles"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#ECEFCA",
          }}
        />
      </div>

      <div className="max-w-6xl w-full bg-white bg-opacity-95 backdrop-blur-sm shadow-xl border border-gray-100 relative">
        <Card className="w-full border-none shadow-none">
          <CardHeader className="relative pb-8 rounded-t-lg" style={{ backgroundColor: colors.primary }}>
            <CardTitle className="text-4xl font-bold tracking-tight text-white">
              Emergency Patient Registration
            </CardTitle>
            <CardDescription className="text-white text-opacity-90 text-lg mt-2">
              Our team is here to assist you. Please provide your details.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                  <div className="space-y-6 border-r lg:border-r-gray-200 lg:pr-8">
                    <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: colors.primaryLight }}>
                      <UserPlus className="h-6 w-6" style={{ color: colors.primary }} />
                      <h3 className="text-xl font-semibold" style={{ color: colors.primary }}>
                        Personal Information
                      </h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex items-center gap-4 pt-1"
                            >
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">Other</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: +1234567890" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your full address" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact *</FormLabel>
                          <FormControl>
                            <Input placeholder="Name and phone number" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormDescription className="text-xs">Person to contact in case of emergency.</FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <div
                      className="flex items-center gap-3 border-b pb-3"
                      style={{ borderColor: colors.secondaryLight }}
                    >
                      <Stethoscope className="h-6 w-6" style={{ color: colors.secondary }} />
                      <h3 className="text-xl font-semibold" style={{ color: colors.secondary }}>
                        Medical Information
                      </h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="insuranceInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Insurance policy number" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List known allergies" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentMedications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medications (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medications you are currently taking"
                              {...field}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="medicalHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical History (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Pre-existing medical conditions" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentSymptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                            Current Symptoms *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your symptoms in detail..."
                              className="min-h-[120px] rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 text-xs" />
                          <div className="mt-3 space-y-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAnalyzeSymptoms}
                              disabled={isAnalyzing || form.getValues("currentSymptoms").length < 10}
                              className="gap-1.5 text-xs h-8"
                              style={{
                                borderColor: colors.primaryLight,
                                color: colors.primary,
                                backgroundColor: "white",
                              }}
                            >
                              {isAnalyzing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                              Analyze Symptoms (AI)
                            </Button>

                            {analysisError && (
                              <Alert variant="destructive" className="text-xs p-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{analysisError}</AlertDescription>
                              </Alert>
                            )}

                            {(aiSuggestions.keywords.length > 0 || aiSuggestions.suggestedQuestions.length > 0) &&
                              !isAnalyzing &&
                              !analysisError && (
                                <Card
                                  className="p-3 mt-2 rounded-lg shadow-sm"
                                  style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}
                                >
                                  <CardHeader className="p-0 mb-2">
                                    <CardTitle
                                      className="text-xs font-semibold flex items-center gap-1.5"
                                      style={{ color: colors.primary }}
                                    >
                                      <Sparkles className="h-3.5 w-3.5" style={{ color: colors.primary }} /> AI
                                      Suggestions
                                    </CardTitle>
                                    <CardDescription
                                      className="text-xs mt-1 flex items-start gap-1"
                                      style={{ color: colors.primary }}
                                    >
                                      <Info size={12} className="flex-shrink-0 mt-0.5" />
                                      <span>Non-medical. Assists with description.</span>
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="p-0 space-y-2 text-xs">
                                    {aiSuggestions.keywords.length > 0 && (
                                      <div>
                                        <h4 className="font-medium text-blue-700 mb-1 text-[11px]">Keywords:</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {aiSuggestions.keywords.map((keyword, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="bg-white border text-[10px] px-1.5 py-0.5"
                                              style={{ borderColor: colors.primaryLight, color: colors.primary }}
                                            >
                                              {keyword}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {aiSuggestions.suggestedQuestions.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-1 text-[11px]" style={{ color: colors.primary }}>
                                          Suggested Questions:
                                        </h4>
                                        <ul className="space-y-1 list-disc pl-4" style={{ color: colors.primary }}>
                                          {aiSuggestions.suggestedQuestions.map((question, index) => (
                                            <li key={index} className="flex items-start gap-1.5">
                                              <span className="flex-grow text-[11px] leading-snug">{question}</span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="h-auto px-1 py-0 text-[10px] hover:bg-opacity-20"
                                                style={{
                                                  color: colors.primary,
                                                  backgroundColor: "transparent",
                                                  hoverBackgroundColor: colors.primaryLight,
                                                }}
                                                onClick={() => addSuggestedQuestionToSymptoms(question)}
                                                title="Add to description"
                                              >
                                                Add
                                              </Button>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="painLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pain Level (1-10) *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}
                                  {i + 1 === 1 ? " - Very mild" : ""}
                                  {i + 1 === 5 ? " - Moderate" : ""}
                                  {i + 1 === 10 ? " - Unbearable" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Level *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - I can wait</SelectItem>
                              <SelectItem value="medium">Medium - Need to see a doctor today</SelectItem>
                              <SelectItem value="high">High - Need prompt care</SelectItem>
                              <SelectItem value="critical">Critical - Life-threatening</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">Assess the severity of your situation.</FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-8 border-t mt-10">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 bg-gray-50 shadow-sm mb-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1 h-5 w-5 border-gray-400"
                            style={{
                              "--checkbox-checked-bg": colors.primary,
                              "--checkbox-checked-border": colors.primary,
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium text-gray-800">
                            I accept the terms and conditions *
                          </FormLabel>
                          <FormDescription className="text-sm text-gray-600">
                            By checking this box, you authorize the facility to process your medical data for your care.
                          </FormDescription>
                          <FormMessage className="text-red-600 text-xs" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Alert
                      className="p-3 rounded-lg flex items-center gap-2 flex-1"
                      style={{ borderColor: colors.alert, backgroundColor: colors.alertLight, color: colors.alert }}
                    >
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: colors.alert }} />
                      <AlertDescription className="text-xs">
                        For immediate life-threatening emergencies, call the local emergency number (e.g., 911).
                      </AlertDescription>
                    </Alert>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                        hover: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                      }}
                    >
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                      {form.formState.isSubmitting ? "Submitting..." : "Submit Emergency Request"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmergencyRegister
