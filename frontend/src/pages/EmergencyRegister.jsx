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
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  dateOfBirth: z.string().min(1, { message: "La date de naissance est requise" }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Veuillez sélectionner un genre"
  }),
  phoneNumber: z.string().min(8, { message: "Numéro de téléphone invalide" }),
  email: z.string().email({ message: "Adresse e-mail invalide" }).optional(),
  address: z.string().min(5, { message: "L'adresse doit contenir au moins 5 caractères" }),
  emergencyContact: z.string().min(8, { message: "Contact d'urgence invalide" }),
  insuranceInfo: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentSymptoms: z.string().min(5, { message: "Veuillez décrire vos symptômes actuels" }),
  painLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    required_error: "Veuillez indiquer votre niveau de douleur"
  }),
  emergencyLevel: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Veuillez indiquer le niveau d'urgence"
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions",
  }),
});

const EmergencyRegister = () => {
  const form = useForm({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      insuranceInfo: "",
      allergies: "",
      currentMedications: "",
      medicalHistory: "",
      currentSymptoms: "",
      acceptTerms: false,
    },
  });

  function onSubmit(data) {
    console.log(data);
    toast.success("Votre demande d'urgence a été enregistrée", {
      description: "Un membre de notre équipe médicale vous contactera rapidement.",
    });
    // Ici vous pouvez ajouter le code pour envoyer les données à votre backend
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 bg-medical-blue-light/20">
      <Card className="w-full max-w-4xl mx-auto border-medical-blue-light shadow-lg">
        {/* En-tête du formulaire */}
        <CardHeader className="bg-gradient-to-r from-medical-blue-light to-medical-blue/10 border-b border-medical-blue/20">
          <div className="flex items-center gap-2 text-medical-blue">
            <AlertTriangle className="h-6 w-6" />
            <Heart className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-medical-blue">
            Enregistrement d'Urgence Patient
          </CardTitle>
          <CardDescription className="text-base text-medical-blue-dark/80">
            Veuillez remplir ce formulaire avec vos informations et les problèmes que vous rencontrez actuellement.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section d'informations personnelles */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-medical-blue-dark">Informations personnelles</h3>

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Homme
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Femme
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Autre
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 6 12 34 56 78" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemple.fr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Votre adresse complète" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact d'urgence</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom et numéro" {...field} />
                        </FormControl>
                        <FormDescription>
                          Personne à contacter en cas d'urgence
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section d'informations médicales */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-medical-blue-dark">Informations médicales</h3>

                  <FormField
                    control={form.control}
                    name="insuranceInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informations d'assurance (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro de sécurité sociale / Mutuelle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Listez vos allergies connues" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Médicaments actuels (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Médicaments que vous prenez actuellement" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antécédents médicaux (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Conditions médicales préexistantes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptômes actuels</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez en détail les symptômes que vous ressentez"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau de douleur (1-10)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez le niveau de douleur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Très légère</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5 - Modérée</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10 - Insupportable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'urgence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Faible - Je peux attendre</SelectItem>
                            <SelectItem value="medium">Moyen - J'ai besoin de voir un médecin aujourd'hui</SelectItem>
                            <SelectItem value="high">Élevé - J'ai besoin de soins rapidement</SelectItem>
                            <SelectItem value="critical">Critique - Situation d'urgence vitale</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section des conditions */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-medical-blue-light p-4 bg-medical-blue-light/10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-medical-blue data-[state=checked]:border-medical-blue"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-medical-blue-dark">
                        J'accepte les conditions et j'autorise l'établissement à traiter mes données médicales
                      </FormLabel>
                      <FormDescription className="text-medical-blue-dark/70">
                        En cochant cette case, vous acceptez que vos informations soient utilisées pour votre prise en charge médicale.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-medical-blue hover:bg-medical-blue-dark text-white"
                size="lg"
              >
                Soumettre la demande d'urgence
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyRegister;