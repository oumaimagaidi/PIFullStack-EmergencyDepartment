"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { MessageSquare, AlertCircle, Check, HelpCircle, AlertTriangle, Trash2, Edit, X } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

const AnnotationList = ({ patientFileId, onAnnotationDeleted, onAnnotationUpdated }) => {
  const [annotations, setAnnotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")

  useEffect(() => {
    fetchAnnotations()
  }, [patientFileId])

  const fetchAnnotations = async () => {
    try {
      setLoading(true)
      setError("")

      const token = Cookies.get("token")
      const response = await axios.get(`http://localhost:8089/api/annotations/file/${patientFileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setAnnotations(response.data)
    } catch (err) {
      console.error("Erreur lors de la récupération des annotations:", err)
      setError(err.response?.data?.message || "Erreur lors de la récupération des annotations")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = Cookies.get("token")
      await axios.delete(`http://localhost:8089/api/annotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setAnnotations(annotations.filter((annotation) => annotation._id !== id))

      if (onAnnotationDeleted) {
        onAnnotationDeleted(id)
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'annotation:", err)
      setError(err.response?.data?.message || "Erreur lors de la suppression de l'annotation")
    }
  }

  const startEditing = (annotation) => {
    setEditingId(annotation._id)
    setEditText(annotation.text)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveEdit = async (id) => {
    try {
      const token = Cookies.get("token")
      const response = await axios.put(
        `http://localhost:8089/api/annotations/${id}`,
        { text: editText },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setAnnotations(annotations.map((annotation) => (annotation._id === id ? response.data : annotation)))

      if (onAnnotationUpdated) {
        onAnnotationUpdated(response.data)
      }

      setEditingId(null)
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'annotation:", err)
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'annotation")
    }
  }

  const toggleResolved = async (annotation) => {
    try {
      const token = Cookies.get("token")
      const response = await axios.put(
        `http://localhost:8089/api/annotations/${annotation._id}`,
        { isResolved: !annotation.isResolved },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setAnnotations(annotations.map((a) => (a._id === annotation._id ? response.data : a)))

      if (onAnnotationUpdated) {
        onAnnotationUpdated(response.data)
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'annotation:", err)
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'annotation")
    }
  }

  const getIconForType = (type) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4 text-yellow-500" />
      case "highlight":
        return <Check className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "question":
        return <HelpCircle className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "comment":
        return "Commentaire"
      case "highlight":
        return "Point important"
      case "warning":
        return "Avertissement"
      case "question":
        return "Question"
      default:
        return "Commentaire"
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-[200px]" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-3">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-5 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
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

  if (annotations.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-slate-50">
        <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Aucune annotation pour ce document</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-slate-600" />
        Annotations ({annotations.length})
      </h3>

      <div className="space-y-3">
        {annotations.map((annotation) => (
          <Card
            key={annotation._id}
            className={`border-l-4 ${
              annotation.isResolved ? "border-l-green-500 bg-green-50" : `border-l-${getColorClass(annotation.type)}`
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getIconForType(annotation.type)}
                  <CardTitle className="text-sm ml-2 font-medium">
                    {annotation.authorId?.username || "Utilisateur"}{" "}
                    <span className="text-slate-500 font-normal">
                      • {new Date(annotation.createdAt).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {annotation.isResolved && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <Check className="h-3 w-3 mr-1" />
                      Résolu
                    </Badge>
                  )}
                  <Badge variant="outline" className={getBadgeClass(annotation.type)}>
                    {getTypeLabel(annotation.type)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === annotation._id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(annotation._id)}>
                      <Check className="h-4 w-4 mr-1" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm">{annotation.text}</p>
                  <div className="flex justify-end mt-2 space-x-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleResolved(annotation)}>
                      {annotation.isResolved ? (
                        <>
                          <X className="h-3.5 w-3.5 mr-1" />
                          Rouvrir
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Résoudre
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => startEditing(annotation)}>
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(annotation._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const getColorClass = (type) => {
  switch (type) {
    case "comment":
      return "yellow-500"
    case "highlight":
      return "green-500"
    case "warning":
      return "red-500"
    case "question":
      return "blue-500"
    default:
      return "yellow-500"
  }
}

const getBadgeClass = (type) => {
  switch (type) {
    case "comment":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "highlight":
      return "bg-green-100 text-green-800 border-green-200"
    case "warning":
      return "bg-red-100 text-red-800 border-red-200"
    case "question":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }
}

export default AnnotationList
