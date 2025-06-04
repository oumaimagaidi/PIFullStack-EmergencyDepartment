// src/pages/Records.jsx
"use client"
import ShareMedicalRecordButton from "./ShareMedicalRecordButton" // Assuming this is already themed or a simple button
import SharedRecordsTab from "./SharedRecordsTab" // Assuming this is already themed or will be separately
import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { 
  AlertCircle, 
  FileText, 
  User, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Search, 
  Users, 
  Loader2, 
  ShieldAlert,
  Brain // Added Brain icon for prediction
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

// --- Consistent Palette ---
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  pageGradientStart: "#F0F4F8",
  pageGradientEnd: "#E0E8F0",
  cardBackground: "#FFFFFF",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  textLight: "text-[#ECEFCA]", // Used for text on dark badges
  borderSubtle: "border-gray-200/90",
  borderFocus: "focus:ring-[#547792] focus:border-[#547792]",
  buttonPrimaryBg: "bg-[#547792]",
  buttonPrimaryText: "text-[#213448]", // Text for primary button (often dark text on lighter bg)
  buttonPrimaryHoverBg: "hover:bg-[#547792]",
  buttonOutlineBorder: "border-[#94B4C1]",
  buttonOutlineText: "text-[#547792]",
  buttonOutlineHoverBorder: "hover:border-[#213448]",
  buttonOutlineHoverBg: "hover:bg-[#ECEFCA]/40",
  // Dark mode stubs (apply with dark: prefix if needed)
  dark: {
    pageGradientStart: "dark:from-slate-900",
    pageGradientEnd: "dark:to-slate-800",
    cardBackground: "dark:bg-slate-800",
    textPrimary: "dark:text-slate-100",
    textSecondary: "dark:text-slate-400",
    borderSubtle: "dark:border-slate-700",
    buttonPrimaryBg: "dark:bg-sky-600", // Example dark mode primary button
    buttonPrimaryText: "dark:text-slate-100",
  }
};

// Badge Styles - more control than default variants sometimes
const BADGE_STYLES = {
  urgent: `bg-red-500 ${PALETTE.textLight} border-red-600`,
  medium: `bg-amber-500 ${PALETTE.textPrimary} border-amber-600`, // Ensure contrast
  low: `bg-sky-500 ${PALETTE.textLight} border-sky-600`,
  default: `bg-gray-200 ${PALETTE.textPrimary} border-gray-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600`,
};

// --- Prediction Badge Styles ---
const PREDICTION_BADGE_STYLES = {
  admit: `bg-blue-500 ${PALETTE.textLight} border-blue-600`,
  discharge: `bg-emerald-500 ${PALETTE.textLight} border-emerald-600`,
  default: `bg-slate-400 ${PALETTE.textLight} border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:border-slate-500`,
};

const Records = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [doctorId, setDoctorId] = useState(null)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) {
      setError("Doctor not logged in. Please log in.")
      setLoading(false)
      return
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setDoctorId(payload.id)
    } catch (err) {
      setError("Error decoding token.")
      console.error("Token decoding error:", err)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorId) return
      try {
        const token = Cookies.get("token")
        const res = await axios.get(`http://localhost:8089/api/emergency-patients/by-doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        // The prediction field should be included by default if it's in the EmergencyPatient model
        const sortedPatients = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPatients(sortedPatients);
        setFilteredPatients(sortedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err)
        setError("Error loading patient records.")
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [doctorId])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(lowerSearchTerm) ||
          patient.emergencyLevel?.toLowerCase().includes(lowerSearchTerm) ||
          patient.currentSymptoms?.toLowerCase().includes(lowerSearchTerm) ||
          patient.status?.toLowerCase().includes(lowerSearchTerm) ||
          patient.prediction?.toLowerCase().includes(lowerSearchTerm) // Added prediction to search
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const handleViewMedicalRecord = (medicalRecordId) => {
    if (medicalRecordId) {
      navigate(`/medical-records/${medicalRecordId}`)
    }
  }
  
  const getEmergencyLevelBadgeClasses = (level) => {
    switch (level?.toLowerCase()) {
      case "high": case "élevé": case "urgent": case "critical": return BADGE_STYLES.urgent; // Grouped critical with urgent
      case "medium": case "moyen": return BADGE_STYLES.medium;
      case "low": case "faible": return BADGE_STYLES.low;
      default: return BADGE_STYLES.default;
    }
  };

  const getEmergencyLevelBorderColor = (level) => {
    switch (level?.toLowerCase()) {
        case "high": case "élevé": case "urgent": case "critical": return "border-red-500";
        case "medium": case "moyen": return "border-amber-500";
        case "low": case "faible": return "border-sky-500";
        default: return `border-[${PALETTE.subtleMidTone}] ${PALETTE.dark.borderSubtle}`;
    }
  };

  // --- Helper for Prediction Badge Classes ---
  const getPredictionBadgeClasses = (prediction) => {
    switch (prediction?.toLowerCase()) {
      case "admit": return PREDICTION_BADGE_STYLES.admit;
      case "discharge": return PREDICTION_BADGE_STYLES.discharge;
      default: return PREDICTION_BADGE_STYLES.default; // For null or other unexpected values
    }
  };


  if (loading) {
    return (
      <div className={`p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] ${PALETTE.dark.pageGradientStart} ${PALETTE.dark.pageGradientEnd}`}>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className={`h-10 w-[280px] bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
          <Skeleton className={`h-10 w-[200px] bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
        </div>
        <Skeleton className={`h-10 w-[400px] mb-6 bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className={`overflow-hidden ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} rounded-xl shadow`}>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-700">
                <Skeleton className={`h-6 w-3/4 bg-gray-300 ${PALETTE.dark.borderSubtle}`} />
              </CardHeader>
              <CardContent className="py-4 space-y-2">
                <Skeleton className={`h-4 w-5/6 bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
                <Skeleton className={`h-4 w-full bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
                <Skeleton className={`h-4 w-4/5 bg-gray-200 ${PALETTE.dark.borderSubtle}`} />
              </CardContent>
              <CardFooter className={`pt-3 border-t border-gray-100 dark:border-slate-700`}>
                <Skeleton className={`h-9 w-full bg-gray-300 ${PALETTE.dark.borderSubtle} rounded-md`} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 max-w-4xl mx-auto min-h-screen flex items-center justify-center bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] ${PALETTE.dark.pageGradientStart} ${PALETTE.dark.pageGradientEnd}`}>
        <Alert variant="destructive" className={`bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 shadow-lg rounded-xl`}>
          <ShieldAlert className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] ${PALETTE.dark.pageGradientStart} ${PALETTE.dark.pageGradientEnd}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-extrabold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>Medical Records</h1>
          <p className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} mt-1 text-sm md:text-base`}>Manage records of assigned patients</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`} />
          <Input
            type="search"
            placeholder="Search patient, level, symptoms..."
            className={`pl-10 w-full py-2.5 ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-lg shadow-sm bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg`}>
          <TabsTrigger value="all" className={`data-[state=active]:${PALETTE.buttonPrimaryBg} data-[state=active]:${PALETTE.buttonPrimaryText} data-[state=active]:shadow-md dark:data-[state=active]:${PALETTE.dark.buttonPrimaryBg} dark:data-[state=active]:${PALETTE.dark.buttonPrimaryText} text-slate-600 dark:text-slate-300 rounded-md`}>All Patients</TabsTrigger>
          <TabsTrigger value="urgent" className={`data-[state=active]:${PALETTE.buttonPrimaryBg} data-[state=active]:${PALETTE.buttonPrimaryText} data-[state=active]:shadow-md dark:data-[state=active]:${PALETTE.dark.buttonPrimaryBg} dark:data-[state=active]:${PALETTE.dark.buttonPrimaryText} text-slate-600 dark:text-slate-300 rounded-md`}>Urgent</TabsTrigger>
          <TabsTrigger value="with-records" className={`data-[state=active]:${PALETTE.buttonPrimaryBg} data-[state=active]:${PALETTE.buttonPrimaryText} data-[state=active]:shadow-md dark:data-[state=active]:${PALETTE.dark.buttonPrimaryBg} dark:data-[state=active]:${PALETTE.dark.buttonPrimaryText} text-slate-600 dark:text-slate-300 rounded-md`}>With Record</TabsTrigger>
          <TabsTrigger value="without-records" className={`data-[state=active]:${PALETTE.buttonPrimaryBg} data-[state=active]:${PALETTE.buttonPrimaryText} data-[state=active]:shadow-md dark:data-[state=active]:${PALETTE.dark.buttonPrimaryBg} dark:data-[state=active]:${PALETTE.dark.buttonPrimaryText} text-slate-600 dark:text-slate-300 rounded-md`}>No Record</TabsTrigger>
          <TabsTrigger value="shared-with-me" className={`data-[state=active]:${PALETTE.buttonPrimaryBg} data-[state=active]:${PALETTE.buttonPrimaryText} data-[state=active]:shadow-md dark:data-[state=active]:${PALETTE.dark.buttonPrimaryBg} dark:data-[state=active]:${PALETTE.dark.buttonPrimaryText} text-slate-600 dark:text-slate-300 rounded-md`}>Shared With Me</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">{renderPatientsList(filteredPatients)}</TabsContent>
        <TabsContent value="urgent" className="mt-6">
          {renderPatientsList(
            filteredPatients.filter(
              (p) => ["high", "urgent", "élevé", "critical"].includes(p.emergencyLevel?.toLowerCase())
            ),
          )}
        </TabsContent>
        <TabsContent value="with-records" className="mt-6">
          {renderPatientsList(filteredPatients.filter((p) => p.medicalRecord))}
        </TabsContent>
        <TabsContent value="without-records" className="mt-6">
          {renderPatientsList(filteredPatients.filter((p) => !p.medicalRecord))}
        </TabsContent>
        <TabsContent value="shared-with-me" className="mt-6">
          <SharedRecordsTab /> {/* Ensure this component is also themed */}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderPatientsList(patientsList) {
    if (patientsList.length === 0) {
      return (
        <div className={`text-center py-12 ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} rounded-xl shadow border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-[${PALETTE.lightAccent}] dark:bg-slate-700 mb-4`}>
            <Users className={`h-8 w-8 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`} />
          </div>
          <h3 className={`text-lg font-medium ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>No patients found</h3>
          <p className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} mt-1 text-sm`}>
            {searchTerm ? "No patients match your current search or filter." : "No patients assigned or available in this category."}
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patientsList.map((patient) => (
          <Card
            key={patient._id}
            className={`overflow-hidden border-l-4 hover:shadow-lg transition-shadow duration-300 rounded-xl ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} ${getEmergencyLevelBorderColor(patient.emergencyLevel)}`}
          >
            <CardHeader className={`pb-3 border-b ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
              <CardTitle className={`flex items-center text-lg md:text-xl font-semibold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>
                <User className={`h-5 w-5 mr-2 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
                {patient.firstName} {patient.lastName}
                <Badge className={`ml-auto text-xs px-2 py-0.5 ${getEmergencyLevelBadgeClasses(patient.emergencyLevel)}`}>
                  {patient.emergencyLevel || "N/A"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 space-y-2.5 text-sm">
              <div className="flex items-start">
                <Activity className={`h-4 w-4 mr-2 mt-0.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary} shrink-0`} />
                <div>
                  <span className={`font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>Symptoms:</span>
                  <p className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} leading-relaxed`}>{patient.currentSymptoms || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className={`h-4 w-4 mr-2 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary} shrink-0`} />
                <span className={`font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>Status:</span>
                <span className={`ml-1.5 ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>{patient.status || "Not defined"}</span>
              </div>
              {/* --- Prediction Display --- */}
              {patient.prediction && (
                <div className="flex items-center">
                  <Brain className={`h-4 w-4 mr-2 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary} shrink-0`} />
                  <span className={`font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>Prediction:</span>
                  <Badge className={`ml-1.5 text-xs px-1.5 py-0.5 ${getPredictionBadgeClasses(patient.prediction)}`}>
                    {patient.prediction}
                  </Badge>
                </div>
              )}
              {/* --- End Prediction Display --- */}
              {!patient.medicalRecord && (
                <div className="flex items-center text-amber-600 dark:text-amber-400 pt-1">
                  <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
                  <span className="text-xs font-medium">Medical record not created</span>
                </div>
              )}
            </CardContent>
            <CardFooter className={`pt-3 flex gap-2 border-t ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
              <Button
                onClick={() => handleViewMedicalRecord(patient.medicalRecord?._id || patient.medicalRecord)}
                disabled={!patient.medicalRecord}
                className={`w-full ${patient.medicalRecord ? `${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} dark:${PALETTE.dark.buttonPrimaryBg} dark:${PALETTE.dark.buttonPrimaryText}` : `${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} cursor-not-allowed opacity-70`} rounded-md shadow-sm`}
              >
                <FileText className="h-4 w-4 mr-2" />
                {patient.medicalRecord ? "View Record" : "Record Unavailable"}
              </Button>
              {/* Example of where ShareMedicalRecordButton could go */}
              {/* {patient.medicalRecord && doctorId && (
                <ShareMedicalRecordButton medicalRecordId={patient.medicalRecord._id} doctorId={doctorId} />
              )} */}
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }
}

export default Records;