"use client"
import { useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const RestoreDialog = ({ isOpen, onClose, patientFileId, onFileRestored }) => {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRestore = async () => {
    try {
      setLoading(true)
      setError("")

      const token = Cookies.get("token")
      const response = await axios.put(
        `http://localhost:8089/api/archive/patient-files/${patientFileId}/restore`,
        { reason: reason.trim() || "Document restauré" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (onFileRestored) {
        onFileRestored(response.data.patientFile)
      }

      onClose()
    } catch (err) {
      console.error("Erreur lors de la restauration du document:", err)
      setError(err.response?.data?.message || "Erreur lors de la restauration du document")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restaurer le document médical</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="restore-reason">Raison de la restauration (optionnel)</Label>
            <Textarea
              id="restore-reason"
              placeholder="Indiquez la raison pour laquelle vous restaurez ce document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-800" />
            <AlertDescription>
              Le document sera restauré et à nouveau disponible dans la liste principale des documents.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="default" onClick={handleRestore} disabled={loading}>
            {loading ? "Restauration..." : "Restaurer le document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RestoreDialog
