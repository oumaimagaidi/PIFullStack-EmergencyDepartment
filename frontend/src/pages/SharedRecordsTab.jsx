"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import {
  FileText,
  User,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  Heart,
  Pill,
  Stethoscope,
  Clipboard,
  AlertTriangle,
  Thermometer,
  BarChart,
  Eye,
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"

const SharedRecordsTab = () => {
  const [sharedRecords, setSharedRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedRecord, setExpandedRecord] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSharedRecords = async () => {
      try {
        const token = Cookies.get("token")
        const response = await axios.get("http://localhost:8089/api/users/medical-records/shared-with-me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Shared records:", response.data)
        setSharedRecords(response.data)
      } catch (err) {
        console.error("Erreur lors de la récupération des dossiers partagés:", err)
        setError("Erreur lors du chargement des dossiers partagés")
      } finally {
        setLoading(false)
      }
    }

    fetchSharedRecords()
  }, [])

  

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
    if (!file) return null

    switch (file.type) {
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
                    {file.details.vitalSigns?.bloodPressure?.systolic}/
                    {file.details.vitalSigns?.bloodPressure?.diastolic}
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
                            <div className="text-sm text-slate-500">{new Date(proc.date).toLocaleDateString()}</div>
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
            {file.details.tests?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Tests diagnostiques</h4>
                <div className="grid gap-2">
                  {file.details.tests.map((test, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded-md bg-white">
                      <div>
                        <span className="font-medium">{test.testName}</span>
                        <div className="text-sm text-slate-500">{new Date(test.date).toLocaleDateString()}</div>
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
                  <div className="font-medium text-sm text-slate-700">Date d'enregistrement</div>
                  <p className="mt-1">{new Date(file.dateRecorded).toLocaleDateString()}</p>
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

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <h3 className="font-medium text-lg">Document</h3>
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="font-medium text-sm text-slate-700">Type</div>
                <p className="mt-1">{file.type}</p>
              </CardContent>
            </Card>
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-slate-700">Notes</h4>
                <p className="text-slate-600 mt-1">{file.notes}</p>
              </div>
            )}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[170px]" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (sharedRecords.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Aucun dossier partagé</h3>
        <p className="text-slate-500 mt-1">Aucun médecin n'a partagé de dossier médical avec vous pour le moment.</p>
      </div>
    )
  }

  // If a file is selected, show detailed view
  if (selectedFile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setSelectedFile(null)} className="flex items-center">
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Retour aux dossiers partagés
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center text-xl">
                  {getFileIcon(selectedFile.type)}
                  <span className="ml-2">{selectedFile.type}</span>
                </CardTitle>
                <CardDescription>
                  Créé le {new Date(selectedFile.dateRecorded || selectedFile.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={getFileTypeColor(selectedFile.type)}>{selectedFile.type}</Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">{renderFileDetails(selectedFile)}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sharedRecords.map((record, index) => (
        <Collapsible
          key={index}
          open={expandedRecord === index}
          onOpenChange={() => setExpandedRecord(expandedRecord === index ? null : index)}
          className="border rounded-lg overflow-hidden bg-white"
        >
          <div className="p-4 border-b">
            <CollapsibleTrigger className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <h3 className="font-medium text-lg">
                    Dossier médical {record.medicalRecord?.patient?.firstName} {record.medicalRecord?.patient?.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Partagé par {record.sharer?.username} le {new Date(record.sharedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  {record.medicalRecord?.files?.length || 0} documents
                </Badge>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedRecord === index ? "transform rotate-180" : ""}`}
                />
              </div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="p-4 bg-slate-50">
              {record.note && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm text-slate-700 italic">"{record.note}"</p>
                </div>
              )}

              <h4 className="font-medium mb-3">Documents médicaux</h4>

              <div className="grid gap-3">
                {record.medicalRecord?.files?.map((file) => (
                  <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          {getFileIcon(file.type)}
                          <div className="ml-3">
                            <div className="font-medium">{file.type}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(file.dateRecorded).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center"
                          onClick={() => setSelectedFile(file)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>

                      {/* Preview based on file type */}
                      <div className="mt-3">
                        {file.type === "VitalSigns" && (
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="bg-rose-50 p-2 rounded-md text-center">
                              <div className="font-medium text-slate-700">Temp.</div>
                              <div className="text-rose-600">{file.details.vitalSigns?.temperature}°C</div>
                            </div>
                            <div className="bg-rose-50 p-2 rounded-md text-center">
                              <div className="font-medium text-slate-700">Tension</div>
                              <div className="text-rose-600">
                                {file.details.vitalSigns?.bloodPressure?.systolic}/
                                {file.details.vitalSigns?.bloodPressure?.diastolic}
                              </div>
                            </div>
                            <div className="bg-rose-50 p-2 rounded-md text-center">
                              <div className="font-medium text-slate-700">Pouls</div>
                              <div className="text-rose-600">{file.details.vitalSigns?.heartRate} bpm</div>
                            </div>
                            <div className="bg-rose-50 p-2 rounded-md text-center">
                              <div className="font-medium text-slate-700">O₂</div>
                              <div className="text-rose-600">{file.details.vitalSigns?.oxygenSaturation}%</div>
                            </div>
                          </div>
                        )}

                        {file.type === "Diagnostic" && (
                          <div className="bg-violet-50 p-2 rounded-md">
                            <div className="font-medium text-xs text-slate-700">Diagnostic:</div>
                            <div className="text-sm">{file.details.diagnosis}</div>
                          </div>
                        )}

                        {file.type === "Treatment" && (
                          <div className="bg-amber-50 p-2 rounded-md">
                            <div className="font-medium text-xs text-slate-700">Procédures:</div>
                            <div className="text-sm">
                              {file.details.procedures?.map((proc, i) => (
                                <div key={i} className="flex items-center">
                                  <span className="text-amber-600 mr-1">•</span> {proc.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {file.notes && (
                          <div className="mt-2 text-xs text-slate-500 italic truncate">Note: {file.notes}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

           
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}

export default SharedRecordsTab
