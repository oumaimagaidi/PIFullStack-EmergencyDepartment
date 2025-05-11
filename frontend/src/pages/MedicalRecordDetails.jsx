"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import axios from "axios"
import { Upload } from "lucide-react"
import { useParams } from "react-router-dom"
import Cookies from "js-cookie"
import {
  Activity,
  AlertCircle,
  Calendar,
  Clipboard,
  FileText,
  FilePlus,
  Heart,
  Pill,
  Stethoscope,
  Thermometer,
  Trash2,
  User,
  Edit,
  AlertTriangle,
  BarChart,
  Droplet,
  BugIcon as Allergens,
  Archive,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Import the AddPatientFileModal component
import AddPatientFileModal from "./AddPatientFileModal"
import ShareMedicalRecordButton from "./ShareMedicalRecordButton"

// Add these imports at the top of the file
import AnnotationDialog from "./annotation/AnnotationDialog"
import AnnotationList from "./annotation/AnnotationList"
import AnnotationMarker from "./annotation/AnnotationMarker"
import ArchiveDialog from "./archive/ArchiveDialog"
import ArchivedFilesList from "./archive/ArchivedFilesList"

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

  // Add these state variables inside the component
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [selectedAnnotation, setSelectedAnnotation] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [annotationPosition, setAnnotationPosition] = useState(null)
  const [fileToAnnotate, setFileToAnnotate] = useState(null)
  const [fileToArchive, setFileToArchive] = useState(null)
  const [showArchivedFiles, setShowArchivedFiles] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrError, setOcrError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token")
        const [recordRes, filesRes] = await Promise.all([
          axios.get(`http://localhost:8089/api/medical-records/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8089/api/medical-records/${id}/files`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        // Add error handling for responses
        if (recordRes.status !== 200 || filesRes.status !== 200) {
          throw new Error("Failed to fetch data")
        }

        setMedicalRecord(recordRes.data)
        setPatientFiles(filesRes.data)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.response?.data?.message || "Error loading data")

        // If 404, redirect or show not found message
        if (err.response?.status === 404) {
          setError("Medical record not found")
        }
      } finally {
        setLoading(false)
      }
    }

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
      setError("Error adding file")
      console.error("Error:", err)
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
      setError("Error updating file")
      console.error("Error:", err)
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
      setError("Error deleting file")
      console.error("Error:", err)
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

  // Add this function inside the component
  const handleAddAnnotation = (file, event) => {
    // Calculate position as percentage of the container
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setAnnotationPosition({ x, y })
    setFileToAnnotate(file._id)
    setShowAnnotationDialog(true)
  }

  const handleAnnotationAdded = (newAnnotation) => {
    setAnnotations([...annotations, newAnnotation])
  }

  const handleAnnotationDeleted = (annotationId) => {
    setAnnotations(annotations.filter((a) => a._id !== annotationId))
  }

  const handleAnnotationUpdated = (updatedAnnotation) => {
    setAnnotations(annotations.map((a) => (a._id === updatedAnnotation._id ? updatedAnnotation : a)))
  }

  const handleArchiveFile = (file) => {
    setFileToArchive(file._id)
    setShowArchiveDialog(true)
  }

  const handleFileArchived = (archivedFile) => {
    setPatientFiles(patientFiles.filter((f) => f._id !== archivedFile._id))
    if (selectedFile && selectedFile._id === archivedFile._id) {
      setSelectedFile(null)
    }
  }

  const handleOCRUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("medicalImage", file) // Correct field name
    formData.append("medicalRecordId", id)

    try {
      setOcrLoading(true)
      setOcrError(null)

      const token = Cookies.get("token")
      const response = await axios.post(
        "http://localhost:8089/api/ocr/process-image", // Correct endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      // Verify extracted data
      if (!response.data.data?.extractedData?.patientName || !response.data.data?.extractedData?.diagnosis) {
        throw new Error("Essential information could not be extracted from the image")
      }

      setOcrResult(response.data.data)
    } catch (err) {
      setOcrError(err.response?.data?.error || err.message || "Error during OCR processing")
      console.error("OCR Error:", err)
    } finally {
      setOcrLoading(false)
      e.target.value = ""
    }
  }

  const renderFileDetails = (file) => {
    switch (file.type) {
      case "Prescription":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-emerald-500" />
                <h3 className="font-medium text-lg">Medical Prescription</h3>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-slate-700">Prescribed Medications</h4>
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
                  <p className="text-sm text-slate-500 italic">No medications prescribed</p>
                )}
              </div>
              {file.notes && (
                <div className="mt-4 text-sm">
                  <h4 className="font-medium text-slate-700">Notes</h4>
                  <p className="text-slate-600 mt-1">{file.notes}</p>
                </div>
              )}
            </div>
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "Diagnostic":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-violet-500" />
                <h3 className="font-medium text-lg">Diagnosis</h3>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700">Primary Diagnosis</h4>
                <Card className="bg-violet-50 border-violet-100">
                  <CardContent className="p-3">
                    <p>{file.details.diagnosis}</p>
                  </CardContent>
                </Card>
              </div>
              {file.details.diagnosticTests?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-slate-700">Diagnostic Tests</h4>
                  <div className="grid gap-2">
                    {file.details.diagnosticTests.map((test, idx) => (
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "Treatment":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium text-lg">Treatment Plan</h3>
              </div>
              {file.details.procedures?.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-slate-700">Medical Procedures</h4>
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
                <p className="text-sm text-slate-500 italic">No procedures recorded</p>
              )}
              {file.notes && (
                <div className="mt-4 text-sm">
                  <h4 className="font-medium text-slate-700">Notes</h4>
                  <p className="text-slate-600 mt-1">{file.notes}</p>
                </div>
              )}
            </div>
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "VitalSigns":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <h3 className="font-medium text-lg">Vital Signs</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-rose-50 border-rose-100">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <Thermometer className="h-5 w-5 text-rose-500 mb-1" />
                    <div className="text-sm text-slate-500">Temperature</div>
                    <div className="text-xl font-semibold">{file.details.vitalSigns?.temperature}°C</div>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <Activity className="h-5 w-5 text-rose-500 mb-1" />
                    <div className="text-sm text-slate-500">Blood Pressure</div>
                    <div className="text-xl font-semibold">
                      {file.details.vitalSigns?.bloodPressure?.systolic}/
                      {file.details.vitalSigns?.bloodPressure?.diastolic}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500 mb-1" />
                    <div className="text-sm text-slate-500">Heart Rate</div>
                    <div className="text-xl font-semibold">{file.details.vitalSigns?.heartRate} bpm</div>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-100">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <BarChart className="h-5 w-5 text-rose-500 mb-1" />
                    <div className="text-sm text-slate-500">O₂ Saturation</div>
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "Triage":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-lg">Triage</h3>
              </div>
              <div className="grid gap-3">
                <Card className="bg-orange-50 border-orange-100">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm text-slate-700">Priority Level</div>
                      <Badge
                        className={
                          file.details.priorityLevel?.toLowerCase().includes("high") ||
                          file.details.priorityLevel?.toLowerCase().includes("urgent")
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : file.details.priorityLevel?.toLowerCase().includes("medium")
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
                    <div className="font-medium text-sm text-slate-700">Chief Complaint</div>
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "Discharge":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-sky-500" />
                <h3 className="font-medium text-lg">Patient Discharge</h3>
              </div>
              <Card className="bg-sky-50 border-sky-100">
                <CardContent className="p-3">
                  <div className="font-medium text-sm text-slate-700">Discharge Instructions</div>
                  <p className="mt-1">{file.details.dischargeInstructions}</p>
                </CardContent>
              </Card>
              {file.details.followUpDate && (
                <Card className="bg-sky-50 border-sky-100">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-slate-700">Follow-up Appointment</div>
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      case "PatientInformation":
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                <h3 className="font-medium text-lg">Patient Information</h3>
              </div>
              <div className="grid gap-3">
                <Card className="bg-slate-50 border-slate-100">
                  <CardContent className="p-3">
                    <div className="font-medium text-sm text-slate-700">Identity</div>
                    <p className="mt-1">
                      {file.details.patientInfo?.firstName} {file.details.patientInfo?.lastName}
                    </p>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-slate-700">Current Symptoms</div>
                      <p className="mt-1">{file.details.patientInfo?.currentSymptoms || "Not specified"}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-3">
                      <div className="font-medium text-sm text-slate-700">Pain Level</div>
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
          </div>
        )

      default:
        return (
          <div className="relative cursor-crosshair" onClick={(e) => handleAddAnnotation(file, e)}>
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
            {annotations
              .filter((a) => a.patientFileId === file._id)
              .map((annotation) => (
                <AnnotationMarker
                  key={annotation._id}
                  annotation={annotation}
                  onClick={() => setSelectedAnnotation(annotation)}
                />
              ))}
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
            Try Again
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
            <AlertDescription>Medical record not found</AlertDescription>
          </Alert>
          <Button onClick={() => window.history.back()} variant="outline">
            Back
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
                  <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "#42A5FF" }}>
                    Medical Record
                  </h1>
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.history.back()} variant="outline" size="sm" className="sm:self-start">
                  Back to List
                </Button>
                <ShareMedicalRecordButton medicalRecordId={id} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Card className="mb-6 bg-slate-50 border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <User className="mr-2 h-5 w-5 text-slate-500" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="font-medium text-slate-700">Name:</span>
                    <span className="ml-2">
                      {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Droplet className="h-4 w-4 mr-2 text-red-400" />
                    <span className="font-medium text-slate-700">Blood Type:</span>
                    <span className="ml-2">{medicalRecord.bloodType || "Not specified"}</span>
                  </div>
                  <div className="flex items-start">
                    <Allergens className="h-4 w-4 mr-2 mt-0.5 text-amber-400" />
                    <span className="font-medium text-slate-700">Allergies:</span>
                    <span className="ml-2">
                      {medicalRecord.knownAllergies?.length
                        ? medicalRecord.knownAllergies.join(", ")
                        : "No known allergies"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <Clipboard className="mr-2 h-5 w-5 text-slate-600" />
                Medical Documents
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300 flex items-center h-11"
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add file document
                </Button>
                <div>
                  <input type="file" id="ocr-upload" accept="image/*" onChange={handleOCRUpload} className="hidden" />
                  <label
                    htmlFor="ocr-upload"
                    className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300 cursor-pointer flex items-center h-11"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    OCR upload
                  </label>
                </div>
              </div>
            </div>

            {patientFiles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No documents</h3>
                <p className="text-slate-500 mt-1 max-w-md mx-auto">
                  This medical record does not contain any documents yet. Click "Add Document" to start creating the
                  record.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-lg border h-fit">
                  <div className="p-4 border-b">
                    <h4 className="font-medium text-slate-800">Document List</h4>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-4 pt-2">
                      <TabsList className="w-full gap-1">
                        <TabsTrigger value="all" className="text-xs px-2 py-1">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="Prescription" className="text-xs px-2 py-1">
                          Prescriptions
                        </TabsTrigger>
                        <TabsTrigger value="Diagnostic" className="text-xs px-2 py-1">
                          Diagnostics
                        </TabsTrigger>

                        <TabsTrigger value="archived" className="text-xs px-2 py-1">
                          Archived
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
                            Created on {new Date(selectedFile.createdAt).toLocaleDateString()}
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
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            onClick={() => confirmDeleteFile(selectedFile._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleArchiveFile(selectedFile)
                            }}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
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
                        <h3 className="text-lg font-medium text-slate-800">No document selected</h3>
                        <p className="text-slate-500 mt-1 max-w-md">
                          Select a document from the list to view its details.
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
      <Tabs defaultValue="annotations" className="w-full">
        <TabsList>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
          <TabsTrigger value="archived">Archived Files</TabsTrigger>
        </TabsList>

        <TabsContent value="annotations">
          <AnnotationList
            patientFileId={selectedFile?._id}
            onAnnotationDeleted={handleAnnotationDeleted}
            onAnnotationUpdated={handleAnnotationUpdated}
          />
        </TabsContent>

        <TabsContent value="archived">
          <ArchivedFilesList medicalRecordId={id} />
        </TabsContent>
      </Tabs>
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
      {ocrLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <p className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing image...
            </p>
          </div>
        </div>
      )}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showAnnotationDialog && (
        <AnnotationDialog
          isOpen={showAnnotationDialog}
          onClose={() => setShowAnnotationDialog(false)}
          patientFileId={fileToAnnotate}
          initialPosition={annotationPosition}
          onAnnotationAdded={handleAnnotationAdded}
        />
      )}
      {showArchiveDialog && (
        <ArchiveDialog
          isOpen={showArchiveDialog}
          onClose={() => setShowArchiveDialog(false)}
          patientFileId={fileToArchive}
          onFileArchived={handleFileArchived}
        />
      )}

      <Dialog open={!!ocrResult} onOpenChange={() => setOcrResult(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>OCR Results</DialogTitle>
            <DialogDescription>Verify the extracted information before creating the medical document</DialogDescription>
          </DialogHeader>

          {ocrResult && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={ocrResult.extractedData.patientName}
                    readOnly
                    className="font-medium"
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={ocrResult.extractedData.diagnosis}
                    readOnly
                    className="font-medium text-red-600"
                  />
                </div>

                {ocrResult.extractedData.tests?.length > 0 && (
                  <div>
                    <Label>Test Results</Label>
                    <div className="mt-2 space-y-2">
                      {ocrResult.extractedData.tests.map((test, index) => (
                        <div key={index} className="p-3 border rounded-md bg-gray-50">
                          <div className="font-medium">{test.testName}</div>
                          <div className="text-sm mt-1">{test.result}</div>
                          {test.date && (
                            <div className="text-xs text-gray-500 mt-1">{new Date(test.date).toLocaleDateString()}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOcrResult(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleAddFile({
                      type: "Diagnostic",
                      notes: "Document generated automatically by OCR",
                      details: {
                        diagnosis: ocrResult.extractedData.diagnosis,
                        diagnosticTests: ocrResult.extractedData.tests.map((test) => ({
                          testName: test.testName,
                          result: test.result,
                          date: test.date || new Date(),
                        })),
                        patientInfo: {
                          firstName: ocrResult.extractedData.patientName.split(" ")[0],
                          lastName: ocrResult.extractedData.patientName.split(" ").slice(1).join(" "),
                        },
                      },
                    })
                    setOcrResult(null)
                  }}
                  className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300"
                >
                  Confirm and create
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MedicalRecordDetails
