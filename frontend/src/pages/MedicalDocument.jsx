"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Clipboard,
  FileText,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Shield,
  Heart,
  Pill,
  AlertTriangle,
  Activity,
  Phone,
  FilePlus,
  Clock,
  Calendar,
  Thermometer,
  Droplet,
  ActivityIcon,
  ClipboardList
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const MedicalDocument = () => {
  const [accessCode, setAccessCode] = useState("")
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isValid, setIsValid] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError("Veuillez entrer un code d'accès valide")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://localhost:8089/api/medical-records/by-access-code/${accessCode}`)

      if (response.data) {
        setMedicalRecord(response.data)
        setIsValid(true)
      } else {
        setError("Aucun dossier médical trouvé avec ce code d'accès")
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du dossier:", err)
      setError(err.response?.data?.message || "Erreur lors de l'accès au dossier")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "Prescription": return <Pill className="h-5 w-5 text-emerald-500" />
      case "Diagnostic": return <Stethoscope className="h-5 w-5 text-violet-500" />
      case "Treatment": return <Activity className="h-5 w-5 text-amber-500" />
      case "VitalSigns": return <Heart className="h-5 w-5 text-rose-500" />
      case "Triage": return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "Discharge": return <Clipboard className="h-5 w-5 text-sky-500" />
      case "PatientInformation": return <User className="h-5 w-5 text-slate-500" />
      default: return <FileText className="h-5 w-5 text-slate-500" />
    }
  }

  const renderFileDetails = (file) => {
    switch (file.type) {
      case "Prescription":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-500" />
              <h3 className="font-medium text-lg">Prescription médicale</h3>
            </div>
            
            {file.details?.medications?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Médicaments prescrits</h4>
                <div className="grid gap-3">
                  {file.details.medications.map((med, idx) => (
                    <Card key={idx} className="bg-emerald-50 border-emerald-100">
                      <CardContent className="p-3">
                        <div className="flex justify-between">
                          <div className="font-medium">{med.name}</div>
                          <Badge variant="outline" className="bg-white">
                            {med.dosage}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {med.frequency}, {med.duration}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Aucun médicament prescrit</p>
            )}
            
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      case "Diagnostic":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-violet-500" />
              <h3 className="font-medium text-lg">Diagnostic</h3>
            </div>
            
            {file.details?.diagnosis && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Diagnostic principal</h4>
                <Card className="bg-violet-50 border-violet-100">
                  <CardContent className="p-3">
                    <p>{file.details.diagnosis}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {file.details?.diagnosticTests?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Tests diagnostiques</h4>
                <div className="grid gap-2">
                  {file.details.diagnosticTests.map((test, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded-md bg-white">
                      <div>
                        <span className="font-medium">{test.testName}</span>
                        <div className="text-sm text-slate-500">
                          {test.date ? formatDate(test.date) : "Date non spécifiée"}
                        </div>
                      </div>
                      <Badge variant={test.result.toLowerCase().includes("normal") ? "outline" : "secondary"}>
                        {test.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      // ... Ajoutez les autres cas (Treatment, VitalSigns, etc.) de la même manière

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h3 className="font-medium text-lg">Document médical</h3>
            </div>
            
            {file.notes && (
              <Card>
                <CardContent className="p-3">
                  <p>{file.notes}</p>
                </CardContent>
              </Card>
            )}
            
            <div className="text-sm text-slate-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Créé le {formatDate(file.createdAt)}
            </div>
          </div>
        )
    }
  }

  const renderMedicalRecord = () => {
    if (!medicalRecord) return null

    return (
      <div className="space-y-6">
        {/* En-tête du dossier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-800">Dossier Médical Électronique</h3>
              <p className="text-sm text-gray-500">
                Patient: {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Code: {medicalRecord.accessCode}
          </Badge>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">
              <User className="h-4 w-4 mr-2" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="medical">
              <Heart className="h-4 w-4 mr-2" />
              Médical
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <Phone className="h-4 w-4 mr-2" />
              Urgence
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations Patient */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informations Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Nom complet:</span>
                      <span className="font-semibold">
                        {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName || "Non spécifié"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Date de naissance:</span>
                      <span className="font-semibold">
                        {medicalRecord.patientId?.dateOfBirth
                          ? formatDate(medicalRecord.patientId.dateOfBirth)
                          : "Non spécifié"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Sexe:</span>
                      <span className="font-semibold">{medicalRecord.patientId?.gender || "Non spécifié"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Téléphone:</span>
                      <span className="font-semibold">{medicalRecord.patientId?.phoneNumber || "Non spécifié"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Email:</span>
                      <span className="font-semibold">{medicalRecord.patientId?.email || "Non spécifié"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-40">Adresse:</span>
                      <span className="font-semibold">{medicalRecord.patientId?.address || "Non spécifié"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Informations Médicales */}
          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-blue-600" />
                  Informations Médicales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Droplet className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Groupe Sanguin</h4>
                        <p className="text-lg font-bold text-blue-700">{medicalRecord.bloodType || "Non spécifié"}</p>
                      </div>
                    </div>

                    {medicalRecord.knownAllergies?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                          Allergies Connues
                        </h4>
                        <div className="space-y-1">
                          {medicalRecord.knownAllergies.map((allergy, index) => (
                            <div
                              key={index}
                              className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 rounded-r text-sm"
                            >
                              {allergy}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {medicalRecord.chronicConditions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                          <ActivityIcon className="h-4 w-4 mr-1 text-blue-600" />
                          Conditions Chroniques
                        </h4>
                        <div className="space-y-1">
                          {medicalRecord.chronicConditions.map((condition, index) => (
                            <div key={index} className="bg-gray-50 px-3 py-2 rounded text-sm">
                              {condition}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
                  Documents Médicaux
                </CardTitle>
                <CardDescription>
                  {medicalRecord.patientFiles?.length || 0} document(s) disponible(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecord.patientFiles?.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecord.patientFiles.map((file) => (
                      <Card key={file._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <div className="ml-3">
                                <CardTitle className="text-lg">{file.type}</CardTitle>
                                <CardDescription className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(file.createdAt)}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {file.creator?.username || "Système"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                          {renderFileDetails(file)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <FilePlus className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Aucun document</h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto">
                      Ce dossier médical ne contient pas encore de documents.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Urgence */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Contact d'Urgence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecord.emergencyContact ? (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-500 w-32">Nom:</span>
                          <span className="font-semibold">{medicalRecord.emergencyContact.name || "Non spécifié"}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-500 w-32">Relation:</span>
                          <span className="font-semibold">
                            {medicalRecord.emergencyContact.relationship || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-500 w-32">Téléphone:</span>
                          <span className="font-semibold">
                            {medicalRecord.emergencyContact.phone || "Non spécifié"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <User className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>Aucun contact d'urgence enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsValid(false)}>
            Vérifier un autre dossier
          </Button>
          <Button onClick={() => navigate("/home")}>Retour à l'accueil</Button>
        </CardFooter>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 mt-20">
      <div className="max-w-4xl mx-auto">
        {!isValid ? (
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-2 hidden md:flex flex-col justify-center items-center bg-blue-50 rounded-l-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-blue-800 mb-2">Dossier Médical Électronique</h2>
                <p className="text-blue-600 mb-6">Accès sécurisé à vos informations médicales</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Accès sécurisé et confidentiel</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Informations médicales à jour</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Contacts d'urgence disponibles</span>
                  </div>
                </div>
              </div>
            </div>

            <Card className="md:col-span-3 border-0 md:border md:border-l-0 md:rounded-l-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">Accès au Dossier Médical</CardTitle>
                <CardDescription>
                  Entrez votre code d'accès unique pour consulter votre dossier médical électronique
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="accessCode" className="text-sm font-medium">
                      Code d'Accès
                    </label>
                    <div className="relative">
                      <Input
                        id="accessCode"
                        type="text"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="Entrez votre code (ex: MR-ABC123)"
                        className="pl-10"
                      />
                      <Clipboard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">
                      Le code d'accès vous a été fourni par votre médecin ou le personnel hospitalier
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="animate-pulse mr-2">⏳</span> Chargement...
                      </>
                    ) : (
                      <>
                        Accéder au Dossier <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                <div className="text-xs text-gray-500 text-center w-full">
                  Pour toute assistance, veuillez contacter le service d'assistance au{" "}
                  <a href="tel:+21656800822" className="text-blue-600 font-medium">
                    +216 56 800 822
                  </a>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6">{renderMedicalRecord()}</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MedicalDocument