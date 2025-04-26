"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Share2, AlertCircle, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ShareMedicalRecordButton = ({ medicalRecordId, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingDoctors, setFetchingDoctors] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  const fetchDoctors = async () => {
    try {
      setFetchingDoctors(true)
      setError("")
      const token = Cookies.get("token")
      const response = await axios.get("http://localhost:8089/api/users/doctor/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDoctors(response.data)
    } catch (err) {
      console.error("Erreur lors de la récupération des médecins:", err)
      setError("Impossible de récupérer la liste des médecins")
    } finally {
      setFetchingDoctors(false)
    }
  }

  const handleShare = async () => {
    if (!selectedDoctor) {
      setError("Veuillez sélectionner un médecin")
      return
    }

    try {
      setLoading(true)
      setError("")
      const token = Cookies.get("token")
      await axios.post(
        `http://localhost:8089/api/users/medical-records/${medicalRecordId}/share`,
        {
          recipientId: selectedDoctor,
          note: note.trim() || "Partage de dossier médical",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err) {
      console.error("Erreur lors du partage du dossier:", err)
      setError(err.response?.data?.message || "Erreur lors du partage du dossier médical")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedDoctor("")
    setNote("")
    setError("")
    setSuccess(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300" 
      >
        <Share2 className="h-4 w-4 mr-2" />
        Partager
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager le dossier médical</DialogTitle>
            <DialogDescription>Sélectionnez un médecin avec qui partager ce dossier médical</DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="rounded-full bg-green-100 p-3 mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center font-medium text-green-600">Dossier partagé avec succès!</p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="doctor" className="text-sm font-medium">
                    Médecin
                  </label>
                  <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
                    <SelectTrigger id="doctor" disabled={fetchingDoctors}>
                      <SelectValue placeholder={fetchingDoctors ? "Chargement..." : "Sélectionner un médecin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          {doctor.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="note" className="text-sm font-medium">
                    Note (optionnel)
                  </label>
                  <Textarea
                    id="note"
                    placeholder="Ajouter une note pour le médecin destinataire"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button onClick={handleShare} disabled={loading || !selectedDoctor} className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-colors duration-300" >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Partage en cours...
                    </>
                  ) : (
                    "Partager"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShareMedicalRecordButton
