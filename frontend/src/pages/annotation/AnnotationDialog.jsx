"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { MessageSquare, AlertCircle, Check, HelpCircle, AlertTriangle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const AnnotationDialog = ({ isOpen, onClose, patientFileId, onAnnotationAdded, initialPosition = null }) => {
  const [text, setText] = useState("")
  const [type, setType] = useState("comment")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 })

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
    }
  }, [initialPosition])

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Veuillez saisir un texte pour l'annotation")
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = Cookies.get("token")
      const response = await axios.post(
        "http://localhost:8089/api/annotations",
        {
          patientFileId,
          text,
          position,
          type,
          color: getColorForType(type),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (onAnnotationAdded) {
        onAnnotationAdded(response.data)
      }

      onClose()
    } catch (err) {
      console.error("Erreur lors de la création de l'annotation:", err)
      setError(err.response?.data?.message || "Erreur lors de la création de l'annotation")
    } finally {
      setLoading(false)
    }
  }

  const getColorForType = (annotationType) => {
    switch (annotationType) {
      case "comment":
        return "#FFD700" // Gold
      case "highlight":
        return "#90EE90" // Light green
      case "warning":
        return "#FF6347" // Tomato
      case "question":
        return "#87CEFA" // Light sky blue
      default:
        return "#FFD700" // Default gold
    }
  }

  const getIconForType = (annotationType) => {
    switch (annotationType) {
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "highlight":
        return <Check className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "question":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une annotation</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="annotation-text">Texte de l'annotation</Label>
            <Textarea
              id="annotation-text"
              placeholder="Saisissez votre annotation ici..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label>Type d'annotation</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="comment" id="comment" />
                <Label htmlFor="comment" className="flex items-center cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-2 text-yellow-500" />
                  Commentaire
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="highlight" id="highlight" />
                <Label htmlFor="highlight" className="flex items-center cursor-pointer">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Point important
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="warning" id="warning" />
                <Label htmlFor="warning" className="flex items-center cursor-pointer">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  Avertissement
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <RadioGroupItem value="question" id="question" />
                <Label htmlFor="question" className="flex items-center cursor-pointer">
                  <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Question
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Ajouter l'annotation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AnnotationDialog
