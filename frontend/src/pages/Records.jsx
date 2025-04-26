"use client"
import ShareMedicalRecordButton from "./ShareMedicalRecordButton"
import SharedRecordsTab from "./SharedRecordsTab"
import { useEffect, useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { AlertCircle, FileText, User, Activity, Clock, AlertTriangle, Search } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

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
      setError("Médecin non connecté. Veuillez vous connecter.")
      setLoading(false)
      return
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      setDoctorId(payload.id)
      console.log("ID du médecin connecté :", payload.id)
    } catch (err) {
      setError("Erreur lors du décodage du token.")
      console.error("Erreur de décodage du token :", err)
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

        console.log("Patients récupérés :", res.data)
        setPatients(res.data)
        setFilteredPatients(res.data)
      } catch (err) {
        console.error("Erreur lors de la récupération des patients :", err)
        setError("Erreur lors du chargement des dossiers des patients.")
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
      const filtered = patients.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.emergencyLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.currentSymptoms?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const handleViewMedicalRecord = (medicalRecordId) => {
    if (medicalRecordId) {
      navigate(`/medical-records/${medicalRecordId}`)
    }
  }

  const getEmergencyLevelBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
      case "élevé":
      case "urgent":
        return (
          <Badge variant="destructive" className="ml-2">
            Urgent
          </Badge>
        )
      case "medium":
      case "moyen":
        return (
          <Badge variant="warning" className="ml-2 bg-amber-500">
            Moyen
          </Badge>
        )
      case "low":
      case "faible":
        return (
          <Badge variant="outline" className="ml-2">
            Faible
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="ml-2">
            Non défini
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-8 w-[250px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
                <Skeleton className="h-10 w-[180px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dossiers Médicaux</h1>
          <p className="text-slate-500 mt-1">Gestion des patients assignés</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Rechercher un patient..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Tous les patients</TabsTrigger>
          <TabsTrigger value="urgent">Urgents</TabsTrigger>
          <TabsTrigger value="with-records">Avec dossier</TabsTrigger>
          <TabsTrigger value="without-records">Sans dossier</TabsTrigger>
          <TabsTrigger value="shared-with-me">Partagés avec moi</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderPatientsList(filteredPatients)}</TabsContent>

        <TabsContent value="urgent">
          {renderPatientsList(
            filteredPatients.filter(
              (p) =>
                p.emergencyLevel?.toLowerCase() === "high" ||
                p.emergencyLevel?.toLowerCase() === "urgent" ||
                p.emergencyLevel?.toLowerCase() === "élevé",
            ),
          )}
        </TabsContent>

        <TabsContent value="with-records">
          {renderPatientsList(filteredPatients.filter((p) => p.medicalRecord))}
        </TabsContent>

        <TabsContent value="without-records">
          {renderPatientsList(filteredPatients.filter((p) => !p.medicalRecord))}
        </TabsContent>

        <TabsContent value="shared-with-me">
          <SharedRecordsTab />
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderPatientsList(patientsList) {
    if (patientsList.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <User className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Aucun patient trouvé</h3>
          <p className="text-slate-500 mt-1">Aucun patient ne correspond à ces critères.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patientsList.map((patient) => (
          <Card
            key={patient._id}
            className="overflow-hidden border-l-4 hover:shadow-md transition-shadow"
            style={{
              borderLeftColor:
                patient.emergencyLevel?.toLowerCase() === "high" ||
                patient.emergencyLevel?.toLowerCase() === "urgent" ||
                patient.emergencyLevel?.toLowerCase() === "élevé"
                  ? "rgb(239, 68, 68)"
                  : patient.emergencyLevel?.toLowerCase() === "medium" ||
                      patient.emergencyLevel?.toLowerCase() === "moyen"
                    ? "rgb(245, 158, 11)"
                    : "rgb(99, 102, 241)",
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <User className="h-5 w-5 mr-2 text-slate-500" />
                {patient.firstName} {patient.lastName}
                {getEmergencyLevelBadge(patient.emergencyLevel)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Activity className="h-4 w-4 mr-2 mt-0.5 text-slate-500" />
                  <div>
                    <span className="font-medium">Symptômes:</span>
                    <p className="text-slate-600">{patient.currentSymptoms || "Non spécifiés"}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="font-medium">Status:</span>
                  <span className="ml-1 text-slate-600">{patient.status || "Non défini"}</span>
                </div>
                {!patient.medicalRecord && (
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-xs">Dossier médical non créé</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
              <Button
                onClick={() => handleViewMedicalRecord(patient.medicalRecord?._id || patient.medicalRecord)}
                disabled={!patient.medicalRecord}
                className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300"                variant={patient.medicalRecord ? "default" : "outline"}
              >
                <FileText className="h-4 w-4 mr-2" />
                {patient.medicalRecord ? "Consulter le dossier" : "Dossier non disponible"}
              </Button>
            
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }
}

export default Records
