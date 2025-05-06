import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertTriangle, Heart, Stethoscope, User, UserPlus, Sparkles, Loader2, Info } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from 'axios';
import ParticlesComponent from "@/components/ParticlesComponent";

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
    painLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], { required_error: "Please select your pain level" }),
    emergencyLevel: z.enum(["low", "medium", "high", "critical"], { required_error: "Please select the emergency level" }),
    acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" }),
});

const EmergencyRegister = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(emergencyFormSchema),
        defaultValues: {
            firstName: "", lastName: "", dateOfBirth: "", gender: undefined,
            phoneNumber: "", email: "", address: "", emergencyContact: "",
            insuranceInfo: "", allergies: "", currentMedications: "", medicalHistory: "",
            currentSymptoms: "", painLevel: undefined, emergencyLevel: undefined,
            acceptTerms: false
        }
    });

    const [aiSuggestions, setAiSuggestions] = useState({ keywords: [], suggestedQuestions: [] });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollPosition = window.scrollY;
                const offset = scrollPosition * 0.2;
                containerRef.current.style.backgroundPositionY = `calc(50% + ${-offset}px)`;
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAnalyzeSymptoms = async () => {
        const symptomText = form.getValues('currentSymptoms');
        if (!symptomText || symptomText.trim().length < 10) {
            setAnalysisError("Veuillez décrire vos symptômes plus en détail (au moins 10 caractères) avant d'analyser.");
            setAiSuggestions({ keywords: [], suggestedQuestions: [] });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);
        setAiSuggestions({ keywords: [], suggestedQuestions: [] });

        try {
            console.log("[Frontend] Envoi pour analyse:", symptomText);
            const response = await axios.post('http://localhost:8089/api/ai/analyze-symptoms', { symptomText });
            console.log("[Frontend] Suggestions reçues:", response.data);
            setAiSuggestions(response.data);
            if (response.data.error) {
                setAnalysisError(response.data.error);
            }
        } catch (error) {
            console.error("[Frontend] Erreur d'analyse:", error);
            const message = error.response?.data?.message || "L'analyse des symptômes a échoué. Vérifiez la connexion au serveur ou réessayez.";
            setAnalysisError(message);
            toast.error("Erreur d'analyse", { description: message });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addSuggestedQuestionToSymptoms = (question) => {
        const currentSymptoms = form.getValues('currentSymptoms');
        const newSymptoms = `${currentSymptoms}\n\nQuestion suggérée: ${question}\n- `;
        form.setValue('currentSymptoms', newSymptoms, { shouldValidate: true });
        const textarea = document.querySelector('textarea[name="currentSymptoms"]');
        if (textarea) {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        }
    };

    async function onSubmit(data) {
        const submitData = {
            ...data,
            email: data.email === "" ? undefined : data.email,
        };
        console.log("Soumission des données:", submitData);

        try {
            const response = await axios.post('http://localhost:8089/api/emergency-patients', submitData, { withCredentials: true });
            console.log("Réponse complète:", response);

            const responseData = response.data;
            const patientData = responseData?.patient;

            if (!patientData) {
                console.error("Objet 'patient' manquant dans la réponse:", responseData);
                throw new Error("Format de réponse inattendu du serveur (patient manquant).");
            }

            const patientId = patientData._id;
            const patientCode = responseData?.patientCode;
            const assignedDoctor = patientData?.assignedDoctor;

            if (!patientId) {
                console.error("ID Patient (_id) manquant dans l'objet patient:", patientData);
                throw new Error("Format de réponse invalide après enregistrement (ID manquant).");
            }

            console.log("Enregistrement réussi. Patient ID:", patientId);

            toast.success("Votre demande d'urgence a été enregistrée.", {
                description: "Notre équipe vous contactera sous peu.",
            });
            form.reset();

            navigate('/emergency-confirmation', {
                state: {
                    formData: submitData,
                    patientId: patientId,
                    patientCode: patientCode,
                    assignedDoctor: assignedDoctor || null
                },
            });

        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            let errorDescription = "Une erreur inattendue s'est produite. Veuillez réessayer.";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error("Détails Erreur Axios (Response):", {
                        data: error.response.data,
                        status: error.response.status,
                        headers: error.response.headers
                    });
                    errorDescription = error.response.data?.message || `Erreur serveur: ${error.response.status}`;
                    if (error.response.data?.details) {
                        errorDescription += ` Détails: ${JSON.stringify(error.response.data.details)}`;
                    }
                } else if (error.request) {
                    console.error("Détails Erreur Axios (Request):", error.request);
                    errorDescription = "Aucune réponse du serveur. Vérifiez la connexion.";
                } else {
                    console.error("Détails Erreur Axios (Setup):", error.message);
                    errorDescription = error.message;
                }
            } else if (error instanceof Error && error.message.includes("Format de réponse invalide")) {
                errorDescription = error.message;
            } else if (error instanceof Error) {
                errorDescription = error.message;
            }

            toast.error("Échec de l'enregistrement", { description: errorDescription });
        }
    }

    return (
        <div className="relativeflex-2 max-w-5xl mx-auto py-20 px-4 relative z-10 flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 font-sans">
            <div className="fixed inset-0 z-0">
                <ParticlesComponent 
                    id="emergency-particles"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#E8F4F8'
                    }}
                />
            </div>

            <div className="max-w-6xl w-full bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 relative z-10">
                <Card className="w-full border-none shadow-none bg-transparent">
                    <CardHeader className="relative text-gray-800 pb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 bg-gradient-to-br from-red-100 to-yellow-100 rounded-full shadow-md">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full shadow-md">
                                <Heart className="h-8 w-8 text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-bold tracking-tight text-gray-900">Enregistrement Urgence Patient</CardTitle>
                        <CardDescription className="text-gray-600 text-lg mt-2">Notre équipe est là pour vous aider. Veuillez fournir vos détails.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                                    <div className="space-y-6 border-r lg:border-r-gray-200 lg:pr-8">
                                        <div className="flex items-center gap-3 border-b pb-3 border-blue-200">
                                            <UserPlus className="h-6 w-6 text-blue-600" />
                                            <h3 className="text-xl font-semibold text-blue-800">Informations Personnelles</h3>
                                        </div>
                                        <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>Prénom *</FormLabel><FormControl><Input placeholder="Ex: Jean" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Nom *</FormLabel><FormControl><Input placeholder="Ex: Dupont" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel>Date de Naissance *</FormLabel><FormControl><Input type="date" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Genre *</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center gap-4 pt-1"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Homme</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Femme</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Autre</FormLabel></FormItem></RadioGroup></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => ( <FormItem><FormLabel>Téléphone *</FormLabel><FormControl><Input placeholder="Ex: 55 123 456" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email (Optionnel)</FormLabel><FormControl><Input type="email" placeholder="email@exemple.com" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Adresse *</FormLabel><FormControl><Textarea placeholder="Votre adresse complète" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="emergencyContact" render={({ field }) => ( <FormItem><FormLabel>Contact d'Urgence *</FormLabel><FormControl><Input placeholder="Nom et numéro de téléphone" {...field} className="rounded-lg" /></FormControl><FormDescription className="text-xs">Personne à contacter en cas d'urgence.</FormDescription><FormMessage className="text-xs" /></FormItem> )} />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b pb-3 border-teal-200">
                                            <Stethoscope className="h-6 w-6 text-teal-600" />
                                            <h3 className="text-xl font-semibold text-teal-800">Informations Médicales</h3>
                                        </div>
                                        <FormField control={form.control} name="insuranceInfo" render={({ field }) => ( <FormItem><FormLabel>Assurance (Optionnel)</FormLabel><FormControl><Input placeholder="Numéro de police d'assurance" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="allergies" render={({ field }) => ( <FormItem><FormLabel>Allergies (Optionnel)</FormLabel><FormControl><Textarea placeholder="Listez vos allergies connues" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="currentMedications" render={({ field }) => ( <FormItem><FormLabel>Médicaments Actuels (Optionnel)</FormLabel><FormControl><Textarea placeholder="Médicaments que vous prenez actuellement" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="medicalHistory" render={({ field }) => ( <FormItem><FormLabel>Antécédents Médicaux (Optionnel)</FormLabel><FormControl><Textarea placeholder="Conditions médicales préexistantes" {...field} className="rounded-lg" /></FormControl><FormMessage className="text-xs" /></FormItem> )} />

                                        <FormField control={form.control} name="currentSymptoms" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-800 font-medium flex items-center gap-2">
                                                    Symptômes Actuels *
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Décrivez en détail les symptômes..."
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
                                                        disabled={isAnalyzing || form.getValues('currentSymptoms').length < 10}
                                                        className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs h-8"
                                                    >
                                                        {isAnalyzing ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                        )}
                                                        Analyser symptômes (IA)
                                                    </Button>

                                                    {analysisError && (
                                                        <Alert variant="destructive" className="text-xs p-2">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <AlertTitle>Erreur</AlertTitle>
                                                            <AlertDescription>{analysisError}</AlertDescription>
                                                        </Alert>
                                                    )}

                                                    {(aiSuggestions.keywords.length > 0 || aiSuggestions.suggestedQuestions.length > 0) && !isAnalyzing && !analysisError && (
                                                        <Card className="bg-blue-50 border border-blue-100 p-3 mt-2 rounded-lg shadow-sm">
                                                            <CardHeader className="p-0 mb-2">
                                                                <CardTitle className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                                                                    <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Suggestions IA
                                                                </CardTitle>
                                                                <CardDescription className="text-xs text-blue-600 mt-1 flex items-start gap-1">
                                                                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                                                                    <span>NON médical. Aide à la description.</span>
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-0 space-y-2 text-xs">
                                                                {aiSuggestions.keywords.length > 0 && (
                                                                    <div>
                                                                        <h4 className="font-medium text-blue-700 mb-1 text-[11px]">Mots-clés :</h4>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {aiSuggestions.keywords.map((keyword, index) => (
                                                                                <Badge key={index} variant="secondary" className="bg-white text-blue-800 border border-blue-200 text-[10px] px-1.5 py-0.5">{keyword}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {aiSuggestions.suggestedQuestions.length > 0 && (
                                                                    <div>
                                                                        <h4 className="font-medium text-blue-700 mb-1 text-[11px]">Questions suggérées :</h4>
                                                                        <ul className="space-y-1 list-disc pl-4 text-blue-900">
                                                                            {aiSuggestions.suggestedQuestions.map((question, index) => (
                                                                                <li key={index} className="flex items-start gap-1.5">
                                                                                    <span className="flex-grow text-[11px] leading-snug">{question}</span>
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-auto px-1 py-0 text-[10px] text-blue-600 hover:bg-blue-100"
                                                                                        onClick={() => addSuggestedQuestionToSymptoms(question)}
                                                                                        title="Ajouter à la description"
                                                                                    >
                                                                                        Ajouter
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
                                        )} />
                                        <FormField control={form.control} name="painLevel" render={({ field }) => ( <FormItem><FormLabel>Niveau de Douleur (1-10) *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner niveau" /></SelectTrigger></FormControl><SelectContent>{[...Array(10)].map((_, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}{i + 1 === 1 ? ' - Très légère': ''}{i + 1 === 5 ? ' - Modérée': ''}{i + 1 === 10 ? ' - Insupportable': ''}</SelectItem>)}</SelectContent></Select><FormMessage className="text-xs" /></FormItem> )} />
                                        <FormField control={form.control} name="emergencyLevel" render={({ field }) => ( <FormItem><FormLabel>Niveau d'Urgence *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="rounded-lg"><SelectValue placeholder="Sélectionner niveau" /></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Bas - Je peux attendre</SelectItem><SelectItem value="medium">Moyen - Besoin de voir un médecin aujourd'hui</SelectItem><SelectItem value="high">Élevé - Besoin de soins rapides</SelectItem><SelectItem value="critical">Critique - Urgence vitale</SelectItem></SelectContent></Select><FormDescription className="text-xs">Évaluez la gravité de votre situation.</FormDescription><FormMessage className="text-xs" /></FormItem> )} />
                                    </div>
                                </div>

                                <div className="pt-8 border-t mt-10">
                                    <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                                        <FormItem className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 bg-gray-50 shadow-sm mb-8">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-5 w-5 border-gray-400" />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="font-medium text-gray-800">J'accepte les termes et conditions *</FormLabel>
                                                <FormDescription className="text-sm text-gray-600">
                                                    En cochant cette case, vous autorisez l'établissement à traiter vos données médicales pour votre prise en charge.
                                                </FormDescription>
                                                <FormMessage className="text-red-600 text-xs" />
                                            </div>
                                        </FormItem>
                                    )} />

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-center gap-2 flex-1">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                            <AlertDescription className="text-xs">
                                                Pour les urgences vitales immédiates, composez le numéro d'urgence local (ex: 190 ou 198).
                                            </AlertDescription>
                                        </Alert>
                                        <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Heart className="h-5 w-5" />
                                            )}
                                            {form.formState.isSubmitting ? 'Envoi en cours...' : "Soumettre la Demande d'Urgence"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmergencyRegister;