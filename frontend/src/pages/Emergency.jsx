"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AlertCircle, Ambulance, Phone, X, Search, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [emergencyCases, setEmergencyCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const statusColors = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800"
  }

  useEffect(() => {
    const fetchEmergencyCases = async () => {
      try {
        const response = await axios.get("http://localhost:8089/api/emergency-patients", {
          withCredentials: true
        })
        setEmergencyCases(response.data)
      } catch (err) {
        setError("Erreur de chargement des urgences")
      } finally {
        setLoading(false)
      }
    }
    fetchEmergencyCases()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression de cette urgence ?")) {
      try {
        await axios.delete(`http://localhost:8089/api/emergency-patients/${id}`, {
          withCredentials: true
        })
        setEmergencyCases(prev => prev.filter(caseItem => caseItem._id !== id))
      } catch (err) {
        console.error("Erreur de suppression:", err)
      }
    }
  }

  const filteredCases = emergencyCases.filter(caseItem =>
    `${caseItem.firstName} ${caseItem.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-white p-8">
      <header className="flex items-center justify-between mb-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: '#42A5FF' }}>Gestion des Urgences</h1>
       
      </header>

      <div className="flex gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des urgences..."
            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
       
      </div>

      {loading ? (
        <div className="flex justify-center">
          <span className="text-red-600 text-2xl animate-pulse">⏳ Chargement...</span>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white hover:bg-red-700 rounded-lg px-6 py-2"
          >
            Réessayer
          </Button>
        </div>
      ) : filteredCases.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Aucune urgence trouvée</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem._id}
              className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl border border-gray-200 hover:border-red-400"
            >
              <CardContent className="p-6 text-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <div className="w-40 h-40 mx-auto bg-red-100 rounded-full border-4 border-gray-100 group-hover:border-red-300 flex items-center justify-center">
                    <AlertCircle className="w-20 h-20 text-red-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-6 truncate">
                  {caseItem.firstName} {caseItem.lastName}
                </h2>
                
                <div className="mt-6 space-y-4 text-gray-600 text-sm">
                 
                  
                  <div className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${
                    statusColors[caseItem.emergencyLevel] || "bg-gray-100 text-gray-800"
                  }`}>
                    {caseItem.emergencyLevel?.toUpperCase() || "NON CLASSÉ"}
                  </div>
                </div>

                <div className="flex justify-center mt-8 gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                    onClick={() => {
                      setSelectedCase(caseItem)
                      setIsDetailsOpen(true)
                    }}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    onClick={() => handleDelete(caseItem._id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isDetailsOpen && selectedCase && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    Détails de l'urgence
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full ${
                      statusColors[selectedCase.emergencyLevel] || "bg-gray-100"
                    }`}>
                      {selectedCase.emergencyLevel?.toUpperCase()}
                    </div>
                   
                  </div>

                  <div className="space-y-2 text-left">
                    <p><strong>🕒 Date de déclaration:</strong> {new Date(selectedCase.createdAt).toLocaleString()}</p>
                    <p><strong>👤 Patient:</strong> {selectedCase.firstName} {selectedCase.lastName}</p>
                    <p><strong>🏥 Symptômes:</strong> {selectedCase.symptoms || "Non spécifiés"}</p>
                    <p><strong>👨⚕️ Médecin assigné:</strong> {selectedCase.assignedDoctor || "Aucun"}</p>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 w-full">
                      Fermer
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Emergency