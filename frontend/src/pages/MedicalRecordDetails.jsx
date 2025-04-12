
import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import Cookies from "js-cookie"
import { Activity, AlertCircle, Calendar, Clipboard, FileText, FilePlus, Heart, Pill, Stethoscope, Thermometer, Trash2, User, Edit, X, AlertTriangle, BarChart, Droplet, BugIcon as Allergens } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Import the AddPatientFileModal component
import AddPatientFileModal from './AddPatientFileModal';

const MedicalRecordDetails = () => {
  const { id } = useParams()
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [patientFiles, setPatientFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editFile, setEditFile] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const [recordRes, filesRes] = await Promise.all([
          axios.get(`http://localhost:8089/api/medical-records/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8089/api/medical-records/${id}/files`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
    
        // Add error handling for responses
        if (recordRes.status !== 200 || filesRes.status !== 200) {
          throw new Error('Failed to fetch data');
        }
    
        setMedicalRecord(recordRes.data);
        setPatientFiles(filesRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Erreur lors du chargement des données");
        
        // If 404, redirect or show not found message
        if (err.response?.status === 404) {
          setError("Dossier médical non trouvé");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData()
  }, [id])

  const handleAddFile = async (newFile) => {
    try {
      const token = Cookies.get("token")
      const res = await axios.post(`http://localhost:8089/api/medical-records/${id}/files`, newFile, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatientFiles([...patientFiles, res.data])
      setShowAddModal(false)
    } catch (err) {
      setError("Erreur lors de l'ajout du fichier")
      console.error("Erreur:", err)
    }
  }

  const handleUpdateFile = async (updatedFile) => {
    try {
      const token = Cookies.get("token")
      const res = await axios.put(`http://localhost:8089/api/patient-files/${updatedFile._id}`, updatedFile, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatientFiles(patientFiles.map((f) => (f._id === res.data._id ? res.data : f)))
      setShowAddModal(false)
      setEditFile(null)
    } catch (err) {
      setError("Erreur lors de la mise à jour du fichier")
      console.error("Erreur:", err)
    }
  }

  const confirmDeleteFile = (fileId) => {
    setFileToDelete(fileId)
    setShowDeleteDialog(true)
  }

  const handleDeleteFile = async () => {
    try {
      const token = Cookies.get("token")
      await axios.delete(`http://localhost:8089/api/patient-files/${fileToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPatientFiles(patientFiles.filter((f) => f._id !== fileToDelete))
      setShowDeleteDialog(false)
      setFileToDelete(null)
      if (selectedFile && selectedFile._id === fileToDelete) {
        setSelectedFile(null)
      }
    } catch (err) {
      setError("Erreur lors de la suppression du fichier")
      console.error("Erreur:", err)
    }
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "Prescription":
        return <Pill className="h-5 w-5 text-emerald-500" />
      case "Diagnostic":
        return <Stethoscope className="h-5 w-5 text-violet-500" />
      case "Treatment":
        return <Activity className="h-5 w-5 text-amber-500" />
      case "VitalSigns":
        return <Heart className="h-5 w-5 text-rose-500" />
      case "Triage":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "Discharge":
        return <Clipboard className="h-5 w-5 text-sky-500" />
      case "PatientInformation":
        return <User className="h-5 w-5 text-slate-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-500" />
    }
  }

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case "Prescription":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Diagnostic":
        return "bg-violet-100 text-violet-800 border-violet-200"
      case "Treatment":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "VitalSigns":
        return "bg-rose-100 text-rose-800 border-rose-200"
      case "Triage":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Discharge":
        return "bg-sky-100 text-sky-800 border-sky-200"
      case "PatientInformation":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-slate-700">Médicaments prescrits</h4>
              {file.details.medications?.length > 0 ? (
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
              ) : (
                <p className="text-sm text-slate-500 italic">Aucun médicament prescrit</p>
              )}
            </div>
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
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-slate-700">Diagnostic principal</h4>
              <Card className="bg-violet-50 border-violet-100">
                <CardContent className="p-3">
                  <p>{file.details.diagnosis}</p>
                </CardContent>
              </Card>
            </div>
            {file.details.diagnosticTests?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Tests diagnostiques</h4>
                <div className="grid gap-2">
                  {file.details.diagnosticTests.map((test, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded-md bg-white">
                      <div>
                        <span className="font-medium">{test.testName}</span>
                        <div className="text-sm text-slate-500">
                          {new Date(test.date).toLocaleDateString()}
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

      case "Treatment":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-lg">Plan de traitement</h3>
            </div>
            {file.details.procedures?.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Procédures médicales</h4>
                <div className="grid gap-3">
                  {file.details.procedures.map((proc, idx) => (
                    <Card key={idx} className="bg-amber-50 border-amber-100">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{proc.name}</div>
                            <div className="text-sm text-slate-500">
                              {new Date(proc.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {proc.notes && <p className="text-sm mt-2 text-slate-600">{proc.notes}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Aucune procédure enregistrée</p>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      case "VitalSigns":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <h3 className="font-medium text-lg">Signes vitaux</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-rose-50 border-rose-100">
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <Thermometer className="h-5 w-5 text-rose-500 mb-1" />
                  <div className="text-sm text-slate-500">Température</div>
                  <div className="text-xl font-semibold">{file.details.vitalSigns?.temperature}°C</div>
                </CardContent>
              </Card>
              <Card className="bg-rose-50 border-rose-100">
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <Activity className="h-5 w-5 text-rose-500 mb-1" />
                  <div className="text-sm text-slate-500">Pression artérielle</div>
                  <div className="text-xl font-semibold">
                    {file.details.vitalSigns?.bloodPressure?.systolic}/{file.details.vitalSigns?.bloodPressure?.diastolic}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-rose-50 border-rose-100">
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-500 mb-1" />
                  <div className="text-sm text-slate-500">Rythme cardiaque</div>
                  <div className="text-xl font-semibold">{file.details.vitalSigns?.heartRate} bpm</div>
                </CardContent>
              </Card>
              <Card className="bg-rose-50 border-rose-100">
                <CardContent className="p-3 flex flex-col items-center justify-center">
                  <BarChart className="h-5 w-5 text-rose-500 mb-1" />
                  <div className="text-sm text-slate-500">Saturation O₂</div>
                  <div className="text-xl font-semibold">{file.details.vitalSigns?.oxygenSaturation}%</div>
                </CardContent>
              </Card>
            </div>
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      case "Triage":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-lg">Triage</h3>
            </div>
            <div className="grid gap-3">
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-sm text-slate-700">Niveau de priorité</div>
                    <Badge
                      className={
                        file.details.priorityLevel?.toLowerCase().includes("élevé") ||
                        file.details.priorityLevel?.toLowerCase().includes("urgent")
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : file.details.priorityLevel?.toLowerCase().includes("moyen")
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : "bg-green-100 text-green-800 hover:bg-green-100"
                      }
                    >
                      {file.details.priorityLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-3">
                  <div className="font-medium text-sm text-slate-700">Motif principal</div>
                  <p className="mt-1">{file.details.chiefComplaint}</p>
                </CardContent>
              </Card>
            </div>
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      case "Discharge":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-sky-500" />
              <h3 className="font-medium text-lg">Sortie du patient</h3>
            </div>
            <Card className="bg-sky-50 border-sky-100">
              <CardContent className="p-3">
                <div className="font-medium text-sm text-slate-700">Instructions de sortie</div>
                <p className="mt-1">{file.details.dischargeInstructions}</p>
              </CardContent>
            </Card>
            {file.details.followUpDate && (
              <Card className="bg-sky-50 border-sky-100">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm text-slate-700">Rendez-vous de suivi</div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-sky-500" />
                      <span>{new Date(file.details.followUpDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      case "PatientInformation":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" />
              <h3 className="font-medium text-lg">Informations patient</h3>
            </div>
            <div className="grid gap-3">
              <Card className="bg-slate-50 border-slate-100">
                <CardContent className="p-3">
                  <div className="font-medium text-sm text-slate-700">Identité</div>
                  <p className="mt-1">
                    {file.details.patientInfo?.firstName} {file.details.patientInfo?.lastName}
                  </p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-slate-50 border-slate-100">
                  <CardContent className="p-3">
                    <div className="font-medium text-sm text-slate-700">Symptômes actuels</div>
                    <p className="mt-1">{file.details.patientInfo?.currentSymptoms || "Non spécifiés"}</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-100">
                  <CardContent className="p-3">
                    <div className="font-medium text-sm text-slate-700">Niveau de douleur</div>
                    <div className="flex items-center mt-1">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: "100%" }}
                      ></div>
                      <div
                        className="ml-2 font-medium"
                        style={{
                          color:
                            file.details.patientInfo?.painLevel >= 7
                              ? "rgb(220, 38, 38)"
                              : file.details.patientInfo?.painLevel >= 4
                              ? "rgb(245, 158, 11)"
                              : "rgb(22, 163, 74)",
                        }}
                      >
                        {file.details.patientInfo?.painLevel}/10
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h3 className="font-medium text-lg">Document</h3>
            </div>
            {file.notes && (
              <Card>
                <CardContent className="p-3">
                  <p>{file.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )
    }
  }

  const filteredFiles = () => {
    if (activeTab === "all") return patientFiles
    return patientFiles.filter((file) => file.type === activeTab)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <Skeleton className="h-8 w-[250px]" />
            </div>
            <div className="p-6">
              <div className="mb-6">
                <Skeleton className="h-6 w-[200px] mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-[150px]" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-[80px]" />
                        <Skeleton className="h-8 w-[80px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!medicalRecord) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertDescription>Dossier médical non trouvé</AlertDescription>
          </Alert>
          <Button onClick={() => window.history.back()} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center text-slate-800">
                  <FileText className="mr-2 h-6 w-6 text-slate-600" />
                  Dossier Médical
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
                </CardDescription>
              </div>
              <Button onClick={() => window.history.back()} variant="outline" size="sm" className="sm:self-start">
                Retour à la liste
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Card className="mb-6 bg-slate-50 border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <User className="mr-2 h-5 w-5 text-slate-500" />
                  Informations Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-700">Nom:</span>
                    <span className="ml-2">
                      {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-red-400" />
                    <span className="font-medium text-slate-700">Type de sang:</span>
                    <span className="ml-2">{medicalRecord.bloodType || "Non spécifié"}</span>
                  </div>
                  <div className="flex items-start">
                    <Allergens className="h-4 w-4 mr-2 mt-0.5 text-amber-400" />
                    <span className="font-medium text-slate-700">Allergies:</span>
                    <span className="ml-2">
                      {medicalRecord.knownAllergies?.length
                        ? medicalRecord.knownAllergies.join(", ")
                        : "Aucune allergie connue"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <Clipboard className="mr-2 h-5 w-5 text-slate-600" />
                Documents Médicaux
              </h3>
              <Button onClick={() => setShowAddModal(true)} className="sm:self-start">
                <FilePlus className="mr-2 h-4 w-4" />
                Ajouter un Document
              </Button>
            </div>

            {patientFiles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Aucun document</h3>
                <p className="text-slate-500 mt-1 max-w-md mx-auto">
                  Ce dossier médical ne contient pas encore de documents.
                  Cliquez sur "Ajouter un Document" pour commencer à créer le dossier.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-lg border h-fit">
                  <div className="p-4 border-b">
                    <h4 className="font-medium text-slate-800">Liste des documents</h4>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-4 pt-2">
                      <TabsList className="w-full">
                        <TabsTrigger value="all" className="flex-1">
                          Tous
                        </TabsTrigger>
                        <TabsTrigger value="Prescription" className="flex-1">
                          Prescriptions
                        </TabsTrigger>
                        <TabsTrigger value="Diagnostic" className="flex-1">
                          Diagnostics
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-2">
                        {filteredFiles().map((file) => (
                          <div
                            key={file._id}
                            onClick={() => setSelectedFile(file)}
                            className={`p-3 rounded-md cursor-pointer flex items-center justify-between transition-colors ${
                              selectedFile?._id === file._id
                                ? "bg-slate-100 border-slate-300"
                                : "bg-white border hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <div className="ml-3">
                                <div className="font-medium text-sm">{file.type}</div>
                                <div className="text-xs text-slate-500">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditFile(file)
                                  setShowAddModal(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  confirmDeleteFile(file._id)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Tabs>
                </div>

                <div className="lg:col-span-2">
                  {selectedFile ? (
                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {getFileIcon(selectedFile.type)}
                            <span className="ml-2">{selectedFile.type}</span>
                          </CardTitle>
                          <CardDescription>
                            Créé le {new Date(selectedFile.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditFile(selectedFile)
                              setShowAddModal(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => confirmDeleteFile(selectedFile._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-6">{renderFileDetails(selectedFile)}</CardContent>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-white rounded-lg border p-8">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-800">Aucun document sélectionné</h3>
                        <p className="text-slate-500 mt-1 max-w-md">
                          Sélectionnez un document dans la liste pour afficher ses détails.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAddModal && (
        <AddPatientFileModal
          medicalRecordId={id}
          initialData={editFile}
          onClose={() => {
            setShowAddModal(false)
            setEditFile(null)
          }}
          onSubmit={editFile ? handleUpdateFile : handleAddFile}
        />
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MedicalRecordDetails