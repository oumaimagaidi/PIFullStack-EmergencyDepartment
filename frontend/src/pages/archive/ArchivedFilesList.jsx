"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { Archive, AlertCircle, FileText, User, RotateCcw, Eye, Search, Calendar } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import RestoreDialog from "./RestoreDialog"

const ArchivedFilesList = ({ medicalRecordId }) => {
  const [archivedFiles, setArchivedFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState("all")
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchArchivedFiles()
  }, [medicalRecordId])

  const fetchArchivedFiles = async () => {
    try {
      setLoading(true)
      setError("")

      const token = Cookies.get("token")
      const response = await axios.get(
        `http://localhost:8089/api/archive/medical-records/${medicalRecordId}/archived`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setArchivedFiles(response.data)
    } catch (err) {
      console.error("Erreur lors de la récupération des documents archivés:", err)
      setError(err.response?.data?.message || "Erreur lors de la récupération des documents archivés")
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = (fileId) => {
    setSelectedFileId(fileId)
    setShowRestoreDialog(true)
  }

  const handleFileRestored = (restoredFile) => {
    setArchivedFiles(archivedFiles.filter((file) => file._id !== restoredFile._id))
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "Prescription":
        return <FileText className="h-5 w-5 text-emerald-500" />
      case "Diagnostic":
        return <FileText className="h-5 w-5 text-violet-500" />
      case "Treatment":
        return <FileText className="h-5 w-5 text-amber-500" />
      case "VitalSigns":
        return <FileText className="h-5 w-5 text-rose-500" />
      case "Triage":
        return <FileText className="h-5 w-5 text-orange-500" />
      case "Discharge":
        return <FileText className="h-5 w-5 text-sky-500" />
      case "PatientInformation":
        return <FileText className="h-5 w-5 text-slate-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-500" />
    }
  }

  const filteredFiles = archivedFiles.filter((file) => {
    const matchesSearch =
      file.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.notes && file.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.archiveReason && file.archiveReason.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = fileTypeFilter === "all" || file.type === fileTypeFilter

    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
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

  if (archivedFiles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <Archive className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Aucun document archivé</h3>
        <p className="text-slate-500 mt-1 max-w-md mx-auto">
          Ce dossier médical ne contient pas de documents archivés.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-semibold text-slate-800 flex items-center">
          <Archive className="mr-2 h-5 w-5 text-slate-600" />
          Documents Archivés ({archivedFiles.length})
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Type de document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="Prescription">Prescription</SelectItem>
              <SelectItem value="Diagnostic">Diagnostic</SelectItem>
              <SelectItem value="Treatment">Traitement</SelectItem>
              <SelectItem value="VitalSigns">Signes vitaux</SelectItem>
              <SelectItem value="Triage">Triage</SelectItem>
              <SelectItem value="Discharge">Sortie</SelectItem>
              <SelectItem value="PatientInformation">Info patient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <Alert className="bg-slate-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Aucun document ne correspond à votre recherche.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <Card
              key={file._id}
              className="overflow-hidden border-l-4 border-l-slate-400 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  {getFileIcon(file.type)}
                  <span className="ml-2">{file.type}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium">Archivé le:</span>
                    <span className="ml-1 text-slate-600">{new Date(file.archivedAt).toLocaleDateString()}</span>
                  </div>

                  {file.archivedBy && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="font-medium">Archivé par:</span>
                      <span className="ml-1 text-slate-600">{file.archivedBy.username || "Utilisateur"}</span>
                    </div>
                  )}

                  {file.archiveReason && (
                    <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                      <span className="font-medium text-xs text-slate-700">Raison:</span>
                      <p className="text-xs text-slate-600 mt-1">{file.archiveReason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleRestore(file._id)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => navigate(`/patient-files/${file._id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Consulter
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {showRestoreDialog && (
        <RestoreDialog
          isOpen={showRestoreDialog}
          onClose={() => setShowRestoreDialog(false)}
          patientFileId={selectedFileId}
          onFileRestored={handleFileRestored}
        />
      )}
    </div>
  )
}

export default ArchivedFilesList
