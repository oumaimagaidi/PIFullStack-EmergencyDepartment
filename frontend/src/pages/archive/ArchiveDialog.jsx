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

const ArchiveDialog = ({ isOpen, onClose, patientFileId, onFileArchived }) => {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleArchive = async () => {
    try {
      setLoading(true)
      setError("")

      const token = Cookies.get("token")
      const response = await axios.put(
        `http://localhost:8089/api/archive/patient-files/${patientFileId}/archive`,
        { reason: reason.trim() || "Document archivé" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (onFileArchived) {
        onFileArchived(response.data.patientFile)
      }

      onClose()
    } catch (err) {
      console.error("Erreur lors de l'archivage du document:", err)
      setError(err.response?.data?.message || "Erreur lors de l'archivage du document")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Archiver le document médical</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="archive-reason">Raison de l'archivage (optionnel)</Label>
            <Textarea
              id="archive-reason"
              placeholder="Indiquez la raison pour laquelle vous archivez ce document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-800" />
            <AlertDescription>
              Les documents archivés seront déplacés dans une section séparée mais resteront accessibles si nécessaire.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleArchive}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading ? "Archivage..." : "Archiver le document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ArchiveDialog
