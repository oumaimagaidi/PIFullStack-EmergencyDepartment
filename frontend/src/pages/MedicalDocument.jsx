"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ParticlesComponent from "@/components/ParticlesComponent"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  Calendar,
  Droplet,
  Thermometer,
  Gauge,
  ClipboardList,
  Dna,
  Syringe,
  LigatureIcon as Bandage,
  Microscope,
} from "lucide-react"

// Color palette
const colors = {
  primary: "#213448", // Blue
  secondary: "#547792", 
  alert: "#ECEFCA", // 
  primaryLight: "#dbeafe",
  secondaryLight: "#ECEFCA",
  alertLight: "#ECEFCA",
  bgAccent: "#ECEFCA", // Light cyan for background
  white : "#ffffff"
}

// Animated Medical Icons Component
const AnimatedMedicalIcons = () => {
  const medicalIcons = [Stethoscope, Heart, Pill, Syringe, Bandage, Microscope, Dna, Thermometer]
  const iconCount = 15 // Reduced for better performance and clarity

  const darkColors = {
    primary: "#1e3a8a",
    secondary: "#0c4a6e",
    accent: "#7f1d1d",
  }

  const getRandomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  })

  const getRandomAnimation = () => ({
    rotate: [90, 180], // Full rotation
    scale: [0.8, 1.2], // Size variation
    opacity: [0.15, 0.3], // Lower opacity for better transparency
    transition: {
      duration: 4 + Math.random() * 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  })

  return (
    <div className="fixed inset-0 z-5 pointer-events-none">
      {Array.from({ length: iconCount }).map((_, index) => {
        const Icon = medicalIcons[Math.floor(Math.random() * medicalIcons.length)]
        return (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              ...getRandomPosition(),
              scale: 0.8,
              opacity: 0.15,
            }}
            animate={getRandomAnimation()}
            whileHover={{
              scale: 1.5,
              opacity: 0.5,
              transition: { duration: 0.3 },
            }}
          >
            <Icon
              className="h-12 w-12"
              style={{
                color: Object.values(darkColors)[Math.floor(Math.random() * Object.values(darkColors).length)],
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// Tab transition variants
const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

// Card hover animation
const cardHoverVariants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
    },
  },
}

const MedicalDocument = () => {
  const [accessCode, setAccessCode] = useState("")
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isValid, setIsValid] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const navigate = useNavigate()

  const handleDownloadPDF = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await axios.get(
        `http://localhost:8089/api/medical-records/by-access-code/${medicalRecord.accessCode}/download-pdf`,
        { responseType: "blob", timeout: 30000 },
      )
      const contentType = response.headers["content-type"]
      if (contentType && contentType.includes("application/json")) {
        const errorText = await response.data.text()
        const errorJson = JSON.parse(errorText)
        throw new Error(errorJson.message || "Error generating PDF")
      }
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `medical_record_${medicalRecord.accessCode}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      let errorMessage = "PDF generation failed. Please contact support."
      if (error.response) {
        if (error.response.data instanceof Blob) {
          const text = await error.response.data.text()
          const json = JSON.parse(text)
          errorMessage = json.message || `Server error (${error.response.status})`
        } else {
          errorMessage = error.response.data.message || `Server error (${error.response.status})`
        }
      } else if (error.request) {
        errorMessage = "No response from server"
      } else if (error.message) {
        errorMessage = error.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setError("Please enter a valid access code")
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
        setError("No medical record found with this access code")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error accessing record")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not specified"

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "Prescription":
        return <Pill className="h-5 w-5" style={{ color: colors.primary }} />
      case "Diagnostic":
        return <Stethoscope className="h-5 w-5" style={{ color: colors.secondary }} />
      case "Treatment":
        return <Activity className="h-5 w-5" style={{ color: "#f97316" }} />
      case "VitalSigns":
        return <Heart className="h-5 w-5" style={{ color: colors.alert }} />
      case "Triage":
        return <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
      case "Discharge":
        return <Clipboard className="h-5 w-5" style={{ color: colors.primary }} />
      case "PatientInformation":
        return <User className="h-5 w-5" style={{ color: "#8b5cf6" }} />
      default:
        return <FileText className="h-5 w-5" style={{ color: "#6B7280" }} />
    }
  }

  const getPriorityColor = (level) => {
    switch (level) {
      case "Resuscitation":
        return "#dc2626"
      case "Emergency":
        return "#ef4444"
      case "Urgent":
        return "#f97316"
      case "Semi-urgent":
        return "#f59e0b"
      case "Non-urgent":
        return "#22c55e"
      default:
        return "#6B7280"
    }
  }

  const getPriorityLightColor = (level) => {
    switch (level) {
      case "Resuscitation":
      case "Emergency":
        return "#fee2e2"
      case "Urgent":
        return "#fff7ed"
      case "Semi-urgent":
        return "#fef9c3"
      case "Non-urgent":
        return "#dcfce7"
      default:
        return "#F3F4F6"
    }
  }

  const translatePriorityLevel = (level) => level || "Unknown"

  const getPainLevelColor = (level) => {
    if (level <= 3) return "#22c55e"
    if (level <= 6) return "#f59e0b"
    return "#ef4444"
  }

  const getEmergencyLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "#22c55e"
      case "medium":
        return "#f97316"
      case "high":
        return "#ef4444"
      default:
        return "#6B7280"
    }
  }

  const renderFileDetails = (file) => {
    switch (file.type) {
      case "Prescription":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5" style={{ color: colors.primary }} />
              <h3 className="font-semibold text-lg">Medical Prescription</h3>
            </div>
            {file.details?.medications?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Prescribed Medications</h4>
                <div className="grid gap-3">
                  {file.details.medications.map((med, idx) => (
                    <motion.div key={idx} whileHover="hover" variants={cardHoverVariants}>
                      <Card className="border-l-4 transition-shadow" style={{ borderLeftColor: colors.primary }}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{med.name}</div>
                            <Badge
                              style={{
                                backgroundColor: colors.primaryLight,
                                color: colors.primary,
                              }}
                            >
                              {med.dosage}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {med.frequency}, {med.duration}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No medications prescribed</p>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "Diagnostic":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" style={{ color: colors.secondary }} />
              <h3 className="font-semibold text-lg">Diagnosis</h3>
            </div>
            {file.details?.diagnosis && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Primary Diagnosis</h4>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="border-l-4 transition-shadow" style={{ borderLeftColor: colors.secondary }}>
                    <CardContent className="p-4">{file.details.diagnosis}</CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            {file.details?.diagnosticTests?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Diagnostic Tests</h4>
                <div className="grid gap-2">
                  {file.details.diagnosticTests.map((test, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center p-3 border rounded-md transition-shadow">
                        <div>
                          <span className="font-medium">{test.testName}</span>
                          <div className="text-sm text-gray-500">{formatDate(test.date)}</div>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: test.result.toLowerCase().includes("normal")
                              ? colors.secondaryLight
                              : colors.alertLight,
                            color: test.result.toLowerCase().includes("normal") ? colors.secondary : colors.white,
                          }}
                        >
                          {test.result}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "Treatment":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: "#f97316" }} />
              <h3 className="font-semibold text-lg">Treatment</h3>
            </div>
            {file.details?.procedures?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Procedures</h4>
                <div className="grid gap-3">
                  {file.details.procedures.map((procedure, idx) => (
                    <motion.div key={idx} whileHover="hover" variants={cardHoverVariants}>
                      <Card className="border-l-4 transition-shadow" style={{ borderLeftColor: "#f97316" }}>
                        <CardContent className="p-4">
                          <div className="font-medium">{procedure.name}</div>
                          <div className="text-sm text-gray-500">{formatDate(procedure.date)}</div>
                          {procedure.notes && (
                            <div className="mt-2 text-sm text-gray-600 p-2 bg-gray-50 rounded-md">
                              {procedure.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No procedures recorded</p>
            )}
            {file.details?.diagnosticTests?.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-gray-700">Associated Tests</h4>
                <div className="grid gap-2">
                  {file.details.diagnosticTests.map((test, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <span className="font-medium">{test.testName}</span>
                          <div className="text-sm text-gray-500">{formatDate(test.date)}</div>
                        </div>
                        <Badge>{test.result}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "VitalSigns":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: colors.alert }} />
              <h3 className="font-semibold text-lg">Vital Signs</h3>
            </div>
            {file.details?.vitalSigns && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {file.details.vitalSigns.temperature && (
                  <motion.div whileHover="hover" variants={cardHoverVariants}>
                    <Card className="transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.alertLight }}>
                          <Thermometer className="h-5 w-5" style={{ color: colors.alert }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Temperature</div>
                          <div className="font-medium">{file.details.vitalSigns.temperature} °C</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {file.details.vitalSigns.bloodPressure && (
                  <motion.div whileHover="hover" variants={cardHoverVariants}>
                    <Card className="transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.primaryLight }}>
                          <Activity className="h-5 w-5" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Blood Pressure</div>
                          <div className="font-medium">
                            {file.details.vitalSigns.bloodPressure.systolic}/
                            {file.details.vitalSigns.bloodPressure.diastolic} mmHg
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {file.details.vitalSigns.heartRate && (
                  <motion.div whileHover="hover" variants={cardHoverVariants}>
                    <Card className="transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.alertLight }}>
                          <Heart className="h-5 w-5" style={{ color: colors.alert }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Heart Rate</div>
                          <div className="font-medium">{file.details.vitalSigns.heartRate} bpm</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {file.details.vitalSigns.respiratoryRate && (
                  <motion.div whileHover="hover" variants={cardHoverVariants}>
                    <Card className="transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.secondaryLight }}>
                          <Droplet className="h-5 w-5" style={{ color: colors.secondary }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Respiratory Rate</div>
                          <div className="font-medium">{file.details.vitalSigns.respiratoryRate} resp/min</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
                {file.details.vitalSigns.oxygenSaturation && (
                  <motion.div whileHover="hover" variants={cardHoverVariants}>
                    <Card className="transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: colors.primaryLight }}>
                          <Gauge className="h-5 w-5" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Oxygen Saturation</div>
                          <div className="font-medium">{file.details.vitalSigns.oxygenSaturation}%</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "Triage":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
              <h3 className="font-semibold text-lg">Triage</h3>
            </div>
            {file.details?.priorityLevel && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Priority Level</h4>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card
                    className="border-l-4 transition-shadow"
                    style={{
                      borderLeftColor: getPriorityColor(file.details.priorityLevel),
                    }}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="font-medium">{translatePriorityLevel(file.details.priorityLevel)}</div>
                      <Badge
                        style={{
                          backgroundColor: getPriorityLightColor(file.details.priorityLevel),
                          color: getPriorityColor(file.details.priorityLevel),
                        }}
                      >
                        {file.details.priorityLevel}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            {file.details?.chiefComplaint && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Chief Complaint</h4>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="transition-shadow">
                    <CardContent className="p-4">{file.details.chiefComplaint}</CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "Discharge":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Clipboard className="h-5 w-5" style={{ color: colors.primary }} />
              <h3 className="font-semibold text-lg">Discharge</h3>
            </div>
            {file.details?.dischargeInstructions && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Discharge Instructions</h4>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="transition-shadow">
                    <CardContent className="p-4">{file.details.dischargeInstructions}</CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            {file.details?.followUpDate && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Follow-up Appointment</h4>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="transition-shadow">
                    <CardContent className="p-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" style={{ color: colors.primary }} />
                      <p>{formatDate(file.details.followUpDate)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            {file.details?.medications?.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-gray-700">Medications to Continue</h4>
                <div className="grid gap-2">
                  {file.details.medications.map((med, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <span className="font-medium">{med.name}</span>
                          <div className="text-sm text-gray-500">
                            {med.dosage}, {med.frequency}, {med.duration}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {file.notes && (
              <div className="mt-4 text-sm">
                <h4 className="font-medium text-gray-700">Notes</h4>
                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">{file.notes}</p>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded: {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      case "PatientInformation":
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: "#8b5cf6" }} />
              <h3 className="font-semibold text-lg">Patient Information</h3>
            </div>
            {file.details?.patientInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {file.details.patientInfo.firstName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">First Name</span>
                          <span className="font-medium">{file.details.patientInfo.firstName}</span>
                        </div>
                      )}
                      {file.details.patientInfo.lastName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Last Name</span>
                          <span className="font-medium">{file.details.patientInfo.lastName}</span>
                        </div>
                      )}
                      {file.details.patientInfo.dateOfBirth && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Date of Birth</span>
                          <span className="font-medium">{file.details.patientInfo.dateOfBirth}</span>
                        </div>
                      )}
                      {file.details.patientInfo.gender && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Gender</span>
                          <span className="font-medium">{file.details.patientInfo.gender}</span>
                        </div>
                      )}
                      {file.details.patientInfo.address && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Address</span>
                          <span className="font-medium">{file.details.patientInfo.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover="hover" variants={cardHoverVariants}>
                  <Card className="transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {file.details.patientInfo.phoneNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="font-medium">{file.details.patientInfo.phoneNumber}</span>
                        </div>
                      )}
                      {file.details.patientInfo.email && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="font-medium">{file.details.patientInfo.email}</span>
                        </div>
                      )}
                      {file.details.patientInfo.emergencyContact && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Emergency Contact</span>
                          <span className="font-medium">{file.details.patientInfo.emergencyContact}</span>
                        </div>
                      )}
                      {file.details.patientInfo.insuranceInfo && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Insurance</span>
                          <span className="font-medium">{file.details.patientInfo.insuranceInfo}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover="hover" variants={cardHoverVariants} className="md:col-span-2">
                  <Card className="transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {file.details.patientInfo.allergies && (
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">Allergies</span>
                          <p className="font-medium p-2 bg-gray-50 rounded-md">{file.details.patientInfo.allergies}</p>
                        </div>
                      )}
                      {file.details.patientInfo.currentMedications && (
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">Current Medications</span>
                          <p className="font-medium p-2 bg-gray-50 rounded-md">
                            {file.details.patientInfo.currentMedications}
                          </p>
                        </div>
                      )}
                      {file.details.patientInfo.medicalHistory && (
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">Medical History</span>
                          <p className="font-medium p-2 bg-gray-50 rounded-md">
                            {file.details.patientInfo.medicalHistory}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div whileHover="hover" variants={cardHoverVariants} className="md:col-span-2">
                  <Card className="transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Current Symptoms</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {file.details.patientInfo.currentSymptoms && (
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">Description</span>
                          <p className="font-medium p-2 bg-gray-50 rounded-md">
                            {file.details.patientInfo.currentSymptoms}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {file.details.patientInfo.painLevel && (
                          <div>
                            <span className="text-sm text-gray-500 mb-1 block">Pain Level</span>
                            <div className="flex items-center">
                              <div className="h-2 flex-1 rounded-full overflow-hidden bg-gray-200">
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(Number.parseInt(file.details.patientInfo.painLevel) / 10) * 100}%`,
                                  }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  style={{
                                    backgroundColor: getPainLevelColor(
                                      Number.parseInt(file.details.patientInfo.painLevel),
                                    ),
                                  }}
                                />
                              </div>
                              <span
                                className="ml-2 font-bold"
                                style={{
                                  color: getPainLevelColor(Number.parseInt(file.details.patientInfo.painLevel)),
                                }}
                              >
                                {file.details.patientInfo.painLevel}/10
                              </span>
                            </div>
                          </div>
                        )}
                        {file.details.patientInfo.emergencyLevel && (
                          <div>
                            <span className="text-sm text-gray-500 mb-1 block">Emergency Level</span>
                            <Badge
                              style={{
                                backgroundColor: getEmergencyLevelColor(file.details.patientInfo.emergencyLevel),
                                color: "white",
                              }}
                            >
                              {file.details.patientInfo.emergencyLevel.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Date recorded:
              {formatDate(file.dateRecorded)}
            </div>
          </motion.div>
        )
      default:
        return (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-lg">Medical Document</h3>
            </div>
            {file.notes && (
              <motion.div whileHover="hover" variants={cardHoverVariants}>
                <Card className="transition-shadow">
                  <CardContent className="p-4">{file.notes}</CardContent>
                </Card>
              </motion.div>
            )}
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Created on {formatDate(file.createdAt)}
            </div>
          </motion.div>
        )
    }
  }

  const renderMedicalRecord = () => {
    if (!medicalRecord) return null

    return (
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-900 p-6 rounded-lg text-white shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <motion.div
              className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <FileText className="h-6 w-6" />
            </motion.div>
            <div className="ml-4">
              <h3 className="text-xl font-bold">Electronic Medical Record</h3>
              <p className="text-sm text-white/80">
                Patient: {medicalRecord.patientId?.firstName} {medicalRecord.patientId?.lastName}
              </p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <Badge className="bg-white/20 text-white border-white/40">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Code: {medicalRecord.accessCode}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs defaultValue="general" className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid grid-cols-4 mb-4 bg-gray-100 rounded-lg p-1">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  Patient
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <TabsTrigger
                  value="medical"
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Medical
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <TabsTrigger
                  value="emergency"
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency
                </TabsTrigger>
              </motion.div>
            </TabsList>

            {/* AnimatePresence for smooth tab transitions */}
            <AnimatePresence mode="wait">
              {/* Patient Information */}
              <TabsContent value="general" className="space-y-4">
                <motion.div key="general-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Card
                    className="border-t-4 hover:shadow-lg transition-shadow"
                    style={{ borderTopColor: colors.primary }}
                  >
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center text-lg" style={{ color: colors.primary }}>
                        <User className="h-5 w-5 mr-2" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Full Name</span>
                            <span className="font-semibold text-lg">
                              {medicalRecord.patientId?.firstName}{" "}
                              {medicalRecord.patientId?.lastName || "Not specified"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Date of Birth</span>
                            <span className="font-semibold">
                              {medicalRecord.patientId?.dateOfBirth
                                ? formatDate(medicalRecord.patientId.dateOfBirth)
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Gender</span>
                            <span className="font-semibold">{medicalRecord.patientId?.gender || "Not specified"}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Phone</span>
                            <span className="font-semibold">
                              {medicalRecord.patientId?.phoneNumber || "Not specified"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Email</span>
                            <span className="font-semibold">{medicalRecord.patientId?.email || "Not specified"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Address</span>
                            <span className="font-semibold">{medicalRecord.patientId?.address || "Not specified"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Medical Information */}
              <TabsContent value="medical" className="space-y-4">
                <motion.div key="medical-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Card
                    className="border-t-4 hover:shadow-lg transition-shadow"
                    style={{ borderTopColor: colors.secondary }}
                  >
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center text-lg" style={{ color: colors.secondary }}>
                        <Heart className="h-5 w-5 mr-2" />
                        Medical Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                            transition={{ duration: 0.3 }}
                            className="p-4 rounded-lg flex items-center shadow-sm"
                            style={{ backgroundColor: colors.primaryLight }}
                          >
                            <div
                              className="h-12 w-12 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor: colors.primary }}
                            >
                              <Droplet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Blood Type</h4>
                              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                                {medicalRecord.bloodType || "Not specified"}
                              </p>
                            </div>
                          </motion.div>
                          {medicalRecord.knownAllergies?.length > 0 && (
                            <motion.div
                              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.3 }}
                              className="p-4 rounded-lg shadow-sm"
                            >
                              <h4
                                className="text-sm font-medium flex items-center mb-3"
                                style={{ color: colors.alert }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Known Allergies
                              </h4>
                              <div className="space-y-2">
                                {medicalRecord.knownAllergies.map((allergy, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-l-4 px-3 py-2 rounded-r text-sm flex items-center"
                                    style={{
                                      backgroundColor: colors.alertLight,
                                      borderLeftColor: colors.alert,
                                    }}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" style={{ color: colors.alert }} />
                                    {allergy}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {medicalRecord.chronicConditions?.length > 0 && (
                            <motion.div
                              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.3 }}
                              className="p-4 rounded-lg shadow-sm"
                            >
                              <h4
                                className="text-sm font-medium flex items-center mb-3"
                                style={{ color: colors.secondary }}
                              >
                                <Activity className="h-4 w-4 mr-1" />
                                Chronic Conditions
                              </h4>
                              <div className="space-y-2">
                                {medicalRecord.chronicConditions.map((condition, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-l-4 px-3 py-2 rounded-r text-sm flex items-center"
                                    style={{
                                      backgroundColor: colors.secondaryLight,
                                      borderLeftColor: colors.secondary,
                                    }}
                                  >
                                    <Activity className="h-4 w-4 mr-2" style={{ color: colors.secondary }} />
                                    {condition}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          {medicalRecord.currentMedications?.length > 0 && (
                            <motion.div
                              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.3 }}
                              className="p-4 rounded-lg shadow-sm"
                            >
                              <h4
                                className="text-sm font-medium flex items-center mb-3"
                                style={{ color: colors.primary }}
                              >
                                <Pill className="h-4 w-4 mr-1" />
                                Current Medications
                              </h4>
                              <div className="space-y-2">
                                {medicalRecord.currentMedications.map((medication, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-l-4 px-3 py-2 rounded-r text-sm"
                                    style={{
                                      backgroundColor: colors.primaryLight,
                                      borderLeftColor: colors.primary,
                                    }}
                                  >
                                    <div className="font-medium">{medication.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {medication.dosage}, {medication.frequency}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents" className="space-y-4">
                <motion.div key="documents-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Card
                    className="border-t-4 hover:shadow-lg transition-shadow"
                    style={{ borderTopColor: colors.primary }}
                  >
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center text-lg" style={{ color: colors.primary }}>
                          <ClipboardList className="h-5 w-5 mr-2" />
                          Medical Documents
                        </CardTitle>
                        <Badge className="bg-gray-200 text-gray-700">
                          {medicalRecord.patientFiles?.length || 0} document(s)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {medicalRecord.patientFiles?.length > 0 ? (
                        <div className="space-y-6">
                          {medicalRecord.patientFiles.map((file, index) => (
                            <motion.div
                              key={file._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                            >
                              <Card className="transition-shadow">
                                <CardHeader className="border-b" style={{ backgroundColor: colors.primaryLight }}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      {getFileIcon(file.type)}
                                      <div className="ml-3">
                                        <CardTitle
                                          className="text-lg"
                                          style={{
                                            color:
                                              file.type === "Prescription"
                                                ? colors.primary
                                                : file.type === "Diagnostic"
                                                  ? colors.secondary
                                                  : file.type === "VitalSigns"
                                                    ? colors.alert
                                                    : "#333",
                                          }}
                                        >
                                          {file.type}
                                        </CardTitle>
                                        <CardDescription className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          {formatDate(file.dateRecorded)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge variant="outline">{file.creator?.username || "System"}</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-4">{renderFileDetails(file)}</CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <motion.div
                          className="text-center py-12 bg-gray-50 rounded-lg border border-dashed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          >
                            <Clipboard className="h-8 w-8" style={{ color: colors.primary }} />
                          </motion.div>
                          <h3 className="text-lg font-medium" style={{ color: colors.primary }}>
                            No documents
                          </h3>
                          <p className="text-gray-500 mt-1 max-w-md mx-auto">
                            This medical record does not contain any documents yet.
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Emergency */}
              <TabsContent value="emergency" className="space-y-4">
                <motion.div key="emergency-tab" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                  <Card
                    className="border-t-4 hover:shadow-lg transition-shadow"
                    style={{ borderTopColor: colors.alert }}
                  >
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center text-lg" style={{ color: colors.alert }}>
                        <Phone className="h-5 w-5 mr-2" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {medicalRecord.emergencyContact ? (
                        <motion.div
                          className="rounded-lg p-6 shadow-sm"
                          style={{
                            backgroundColor: colors.alertLight,
                            borderLeft: `4px solid ${colors.alert}`,
                          }}
                          whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Name</span>
                                <span className="font-semibold text-lg">
                                  {medicalRecord.emergencyContact.name || "Not specified"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Relationship</span>
                                <span className="font-semibold">
                                  {medicalRecord.emergencyContact.relationship || "Not specified"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Phone</span>
                                <span className="font-semibold flex items-center">
                                  <Phone className="h-4 w-4 mr-2" style={{ color: colors.alert }} />
                                  {medicalRecord.emergencyContact.phone || "Not specified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          className="text-center py-10 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          >
                            <User className="h-8 w-8" style={{ color: colors.alert }} />
                          </motion.div>
                          <h3 className="text-lg font-medium" style={{ color: colors.alert }}>
                            No emergency contact
                          </h3>
                          <p className="text-gray-500 mt-1">
                            No emergency contact has been registered for this patient
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CardFooter className="flex justify-between pt-4 border-t">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => setIsValid(false)}
                className="font-medium border-blue-900 text-blue-900 hover:bg-blue-50"
              >
                Check another record
              </Button>
            </motion.div>
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleDownloadPDF}
                  className="font-medium text-white bg-blue-900 hover:bg-blue-800"
                  disabled={loading}
                >
                  <FileText className="mr-2 h-4 w-4 text-white" />
                  Download PDF
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate("/home")}
                  className="font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  Back to Home
                </Button>
              </motion.div>
            </div>
          </CardFooter>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative z-20 min-h-screen flex flex-col bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF] font-sans">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="medical-particles"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#E8F4F8",
          }}
        />
      </div>
      <AnimatedMedicalIcons />

      {/* Main Content */}
      <main className="flex-2 max-w-5xl mx-auto py-20 px-4 relative z-10 mt-10">
        {!isValid ? (
          <motion.div
            className="grid md:grid-cols-5 gap-0 rounded-xl overflow-hidden shadow-2xl bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="md:col-span-2 hidden md:flex flex-col justify-center items-center p-8 bg-[#213448] text-white">
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/20 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <FileText className="h-10 w-10" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4">Electronic Medical Record</h2>
                <p className="mb-8 text-white/80">Secure access to your medical information</p>
                <div className="space-y-4 text-left">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center bg-white/10 p-3 rounded-lg transition-all duration-300 hover:bg-white/20"
                  >
                    <div className="animate-bounce">
                      <Shield className="h-5 w-5 mr-3" />
                    </div>
                    <span className="text-sm">Secure and confidential access</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center bg-white/10 p-3 rounded-lg transition-all duration-300 hover:bg-white/20"
                  >
                    <div className="animate-pulse">
                      <CheckCircle className="h-5 w-5 mr-3" />
                    </div>
                    <span className="text-sm">Up-to-date medical information</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center bg-white/10 p-3 rounded-lg transition-all duration-300 hover:bg-white/20"
                  >
                    <div className="animate-float">
                      <User className="h-5 w-5 mr-3" />
                    </div>
                    <span className="text-sm">Emergency contacts available</span>
                  </motion.div>
                </div>
              </div>
            </div>
            <Card className="mt-8 md:col-span-3 border-0 transition-all duration-300 hover:shadow-lg" >
              <CardHeader className="py-8 pt-12 pb-8">
                <CardTitle className="text-2xl font-bold text-center md:text-left" style={{ color: colors.primary }}>
                  Medical Record Access
                </CardTitle>
                <CardDescription className="text-center md:text-left">
                  Enter your unique access code to view your electronic medical record
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="accessCode" className="text-sm ml-2 font-medium text-gray-700">
                      Access Code
                    </label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          id="accessCode"
                          type="text"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          placeholder="Enter your code (e.g. MR-ABC123)"
                          className="pl-12 ml-5"
                          style={{ borderColor: colors.primary }}
                        />
                      </motion.div>
                      <Clipboard
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                        style={{ color: colors.primary }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      The access code was provided by your doctor or hospital staff
                    </p>
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert style={{ backgroundColor: colors.alertLight }}>
                        <AlertCircle className="h-4 w-4" style={{ color: colors.alert }} />
                        <AlertTitle style={{ color: colors.alert }}>Error</AlertTitle>
                        <AlertDescription style={{ color: colors.alert }}>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      type="submit"
                      className="w-full font-medium text-white bg-[#213448] hover:bg-blue-800"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <span className="animate-pulse mr-2">⏳</span> Loading...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Access Record <CheckCircle className="ml-2 h-5 w-5 text-white" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl">{renderMedicalRecord()}</Card>
          </motion.div>
        )}
      </main>
      <div className="h-[60px]"></div>
    </div>
  )
}

export default MedicalDocument
