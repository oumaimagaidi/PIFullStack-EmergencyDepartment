"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  UserPlus,
  Calendar,
  Phone,
  User,
  Mail,
  Heart,
  Filter,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const patientsPerPage = 6
  const [editingPatient, setEditingPatient] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [previewImage, setPreviewImage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
    bloodType: "",
    condition: "",
    age: "",
    profileImage: null,
  })

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const conditions = ["Stable", "Critical", "Recovering", "Under Observation", "Chronic", "Acute"]

  const fetchPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:8089/api/users/patients", { withCredentials: true })
      const fetchedPatients = response.data || []
      setPatients(fetchedPatients)
      setTotalPages(Math.ceil(fetchedPatients.length / patientsPerPage))
    } catch (err) {
      setError("Impossible de récupérer les patients.")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchPatients()
    setTimeout(() => setRefreshing(false), 800)
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const validateFields = (data, isUpdate = false) => {
    const errors = {}
    const { name, email, password, phoneNumber, dateOfBirth, bloodType } = data

    if (!name) errors.name = "Le nom est requis"
    if (!email) errors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email invalide"
    if (!phoneNumber) errors.phoneNumber = "Le numéro de téléphone est requis"
    if (!dateOfBirth) errors.dateOfBirth = "La date de naissance est requise"
    if (!bloodType) errors.bloodType = "Le groupe sanguin est requis"
    if (!isUpdate && (!password || password.length < 6))
      errors.password = "Le mot de passe doit contenir au moins 6 caractères"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)

    if (!query.trim()) {
      // Reset to all patients
      setTotalPages(Math.ceil(patients.length / patientsPerPage))
      return
    }

    const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase()))
    setTotalPages(Math.ceil(filtered.length / patientsPerPage))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!validateFields(newPatient)) return

    setLoading(true)
    const formData = new FormData()
    formData.append("name", newPatient.name)
    formData.append("email", newPatient.email)
    formData.append("password", newPatient.password)
    formData.append("phoneNumber", newPatient.phoneNumber)
    formData.append("dateOfBirth", newPatient.dateOfBirth)
    formData.append("bloodType", newPatient.bloodType)
    formData.append("condition", newPatient.condition)
    formData.append("age", newPatient.age)

    if (newPatient.profileImage) {
      formData.append("profileImage", newPatient.profileImage)
    }

    try {
      const response = await axios.post("http://localhost:8089/api/users/patients", formData, {
        withCredentials: true,
      })

      // Reset form
      setNewPatient({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dateOfBirth: "",
        bloodType: "",
        condition: "",
        age: "",
        profileImage: null,
      })
      setPreviewImage(null)
      setFormErrors({})
      setIsSheetOpen(false)

      // Refresh patients list
      const updatedPatients = [...patients, response.data]
      setPatients(updatedPatients)
      setTotalPages(Math.ceil(updatedPatients.length / patientsPerPage))
    } catch (error) {
      console.error("Error adding patient:", error)
      alert(error.response?.data?.message || "Erreur lors de l'ajout du patient")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingPatient || !validateFields(editingPatient, true)) return

    setLoading(true)
    const formData = new FormData()
    formData.append("name", editingPatient.name)
    formData.append("email", editingPatient.email)
    formData.append("phoneNumber", editingPatient.phoneNumber)
    formData.append("dateOfBirth", editingPatient.dateOfBirth)
    formData.append("bloodType", editingPatient.bloodType)
    formData.append("condition", editingPatient.condition)
    formData.append("age", editingPatient.age)

    if (editingPatient.profileImage instanceof File) {
      formData.append("profileImage", editingPatient.profileImage)
    }

    try {
      const response = await axios.put(`http://localhost:8089/api/users/patients/${editingPatient._id}`, formData, {
        withCredentials: true,
      })

      setEditingPatient(null)
      setPreviewImage(null)
      setFormErrors({})
      setIsSheetOpen(false)

      // Update patient in the list
      const updatedPatients = patients.map((p) => (p._id === editingPatient._id ? response.data : p))
      setPatients(updatedPatients)
    } catch (error) {
      console.error("Error updating patient:", error)
      alert(error.response?.data?.message || "Erreur lors de la mise à jour du patient")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return

    setLoading(true)
    try {
      await axios.delete(`http://localhost:8089/api/users/patients/${id}`, {
        withCredentials: true,
      })

      // Remove patient from list
      const updatedPatients = patients.filter((p) => p._id !== id)
      setPatients(updatedPatients)
      setTotalPages(Math.ceil(updatedPatients.length / patientsPerPage))
    } catch (error) {
      console.error("Error deleting patient:", error)
      alert(error.response?.data?.message || "Erreur lors de la suppression du patient")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)

      if (editingPatient) {
        setEditingPatient({ ...editingPatient, profileImage: file })
      } else {
        setNewPatient({ ...newPatient, profileImage: file })
      }
    }
  }

  const handleEditClick = (patient) => {
    setEditingPatient({ ...patient })
    setPreviewImage(patient.profileImage ? `http://localhost:8089${patient.profileImage}` : null)
    setFormErrors({})
    setIsSheetOpen(true)
  }

  const handleSheetClose = () => {
    setIsSheetOpen(false)
    setEditingPatient(null)
    setNewPatient({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: "",
      bloodType: "",
      condition: "",
      age: "",
      profileImage: null,
    })
    setPreviewImage(null)
    setFormErrors({})
  }

  // Get paginated patients
  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage)

  const PatientForm = ({ isEditing }) => (
    <form onSubmit={isEditing ? handleUpdate : handleAdd} className="space-y-4 mt-6">
      <div className="relative">
        <Input
          placeholder="Nom Complet"
          value={isEditing ? editingPatient.name : newPatient.name}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, name: e.target.value })
              : setNewPatient({ ...newPatient, name: e.target.value })
          }
          required
          aria-invalid={!!formErrors.name}
          aria-describedby={formErrors.name ? "name-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.name && (
          <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.name}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="Email"
          type="email"
          value={isEditing ? editingPatient.email : newPatient.email}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, email: e.target.value })
              : setNewPatient({ ...newPatient, email: e.target.value })
          }
          required
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? "email-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.email && (
          <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.email}
          </p>
        )}
      </div>
      {!isEditing && (
        <div className="relative">
          <Input
            placeholder="Mot de passe"
            type="password"
            value={newPatient.password}
            onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
            required
            aria-invalid={!!formErrors.password}
            aria-describedby={formErrors.password ? "password-error" : undefined}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
          />
          {formErrors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
              {formErrors.password}
            </p>
          )}
        </div>
      )}
      <div className="relative">
        <Input
          placeholder="Numéro de téléphone"
          value={isEditing ? editingPatient.phoneNumber : newPatient.phoneNumber}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, phoneNumber: e.target.value })
              : setNewPatient({ ...newPatient, phoneNumber: e.target.value })
          }
          required
          aria-invalid={!!formErrors.phoneNumber}
          aria-describedby={formErrors.phoneNumber ? "phoneNumber-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.phoneNumber && (
          <p id="phoneNumber-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.phoneNumber}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="Date de naissance"
          type="date"
          value={isEditing ? editingPatient.dateOfBirth : newPatient.dateOfBirth}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value })
              : setNewPatient({ ...newPatient, dateOfBirth: e.target.value })
          }
          required
          aria-invalid={!!formErrors.dateOfBirth}
          aria-describedby={formErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.dateOfBirth && (
          <p id="dateOfBirth-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.dateOfBirth}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="Âge"
          type="number"
          value={isEditing ? editingPatient.age : newPatient.age}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, age: e.target.value })
              : setNewPatient({ ...newPatient, age: e.target.value })
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
      </div>
      <div className="relative">
        <select
          value={isEditing ? editingPatient.bloodType : newPatient.bloodType}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, bloodType: e.target.value })
              : setNewPatient({ ...newPatient, bloodType: e.target.value })
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
          required
          aria-invalid={!!formErrors.bloodType}
          aria-describedby={formErrors.bloodType ? "bloodType-error" : undefined}
        >
          <option value="">Sélectionner le groupe sanguin</option>
          {bloodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {formErrors.bloodType && (
          <p id="bloodType-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.bloodType}
          </p>
        )}
      </div>
      <div className="relative">
        <select
          value={isEditing ? editingPatient.condition : newPatient.condition}
          onChange={(e) =>
            isEditing
              ? setEditingPatient({ ...editingPatient, condition: e.target.value })
              : setNewPatient({ ...newPatient, condition: e.target.value })
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        >
          <option value="">Sélectionner la condition médicale</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {previewImage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex justify-center"
          >
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
            />
          </motion.div>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-md rounded-lg py-3"
        disabled={loading}
      >
        {loading ? <span className="mr-2 animate-spin">⏳</span> : null}
        {isEditing ? "Mettre à jour le patient" : "Ajouter le patient"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full mt-3 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-lg py-3"
        onClick={handleSheetClose}
      >
        Annuler
      </Button>
    </form>
  )

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
      <div className="flex justify-center gap-2 mt-8" role="navigation" aria-label="Pagination">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          Précédent
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`${
              currentPage === page ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } transition-all duration-300 rounded-lg px-4 py-2`}
          >
            {page}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          Suivant
        </Button>
      </div>
    )
  }

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "stable":
        return "text-green-600 bg-green-50 border-green-200"
      case "recovering":
        return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "under observation":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "chronic":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "acute":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white p-8">
      {/* Enhanced Header with Stats */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
<h1 className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: '#42A5FF' }}>            Gestion des Patients
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Système de gestion complet pour suivre et gérer les informations des patients
          </p>
        </motion.div>
        <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 justify-center mx-auto max-w-6xl"
  >
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 max-w-md w-full">
      <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{patients.length}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

         

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dernière Mise à Jour</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{new Date().toLocaleDateString()}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <RefreshCw
                    className={`h-6 w-6 text-green-600 ${refreshing ? "animate-spin" : "cursor-pointer"}`}
                    onClick={refreshData}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des patients par nom..."
            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            aria-label="Rechercher des patients"
          />
        </div>
       
      </div>

      {loading && patients.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw className="w-12 h-12 text-blue-600" />
          </motion.div>
          <span className="ml-4 text-blue-600 text-xl">Chargement des patients...</span>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-red-50 p-8 rounded-xl border border-red-200"
        >
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 rounded-lg px-6 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </motion.div>
      ) : paginatedPatients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-gray-50 p-12 rounded-xl border border-gray-200"
        >
          <p className="text-gray-500 text-xl mb-4" role="alert">
            Aucun patient trouvé correspondant à votre recherche.
          </p>
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery("")
                fetchPatients()
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 rounded-lg px-6 py-2"
            >
              Effacer la recherche
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedPatients.map((patient, index) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-400">
                  <CardContent className="p-6 text-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                      <img
                        src={
                          patient.profileImage
                            ? `http://localhost:8089${patient.profileImage.startsWith("/") ? patient.profileImage : "/" + patient.profileImage}`
                            : "https://via.placeholder.com/150?text=Patient"
                        }
                        alt={patient.name}
                        className="w-40 h-40 mx-auto object-cover rounded-full border-4 border-gray-100 group-hover:border-blue-300 transition-all duration-500 group-hover:scale-110"
                      />
                      {patient.bloodType && (
                        <motion.span
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute top-2 left-2 bg-red-50 text-red-700 text-sm font-medium px-3 py-1 rounded-full shadow-md border border-red-200 group-hover:bg-red-100 transition-all duration-300"
                        >
                          <Heart className="w-3 h-3 inline mr-1" /> {patient.bloodType}
                        </motion.span>
                      )}
                      {patient.condition && (
                        <motion.span
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`absolute top-2 right-2 text-sm font-medium px-3 py-1 rounded-full shadow-md border transition-all duration-300 ${getConditionColor(
                            patient.condition,
                          )}`}
                        >
                          <Activity className="w-3 h-3 inline mr-1" /> {patient.condition}
                        </motion.span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-6 truncate">
                      {patient.name || "Nom non disponible"}
                    </h2>
                    <div className="mt-6 space-y-4 text-gray-600 text-sm">
                      {patient.age && (
                        <p className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" /> Âge: {patient.age} ans
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 group relative">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="group-hover:text-blue-600 transition-colors duration-300">
                          {patient.email || "Email non disponible"}
                        </span>
                        <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Envoyer un email
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 group relative">
                        <Phone className="h-4 w-4 text-green-400" />
                        <span className="group-hover:text-green-600 transition-colors duration-300">
                          {patient.phoneNumber || "Numéro non disponible"}
                        </span>
                        <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Appeler
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-8 gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative group bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                        onClick={() => handleEditClick(patient)}
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> 
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative group bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-lg transition-all duration-300"
                        onClick={() => handleDelete(patient._id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> 
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative group bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 hover:shadow-lg transition-all duration-300"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsDetailsOpen(true)
                        }}
                        disabled={loading}
                      >
                        <ClipboardList className="h-4 w-4 mr-1" /> 
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && <Pagination />}
        </>
      )}

      {/* Patient Details Dialog */}
      <AnimatePresence>
        {isDetailsOpen && selectedPatient && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-800">Détails du Patient</DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Informations sur {selectedPatient.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <div className="flex justify-center">
                    <img
                      src={
                        selectedPatient.profileImage
                          ? `http://localhost:8089${selectedPatient.profileImage}`
                          : "https://via.placeholder.com/100?text=Patient"
                      }
                      alt={selectedPatient.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/100?text=Patient")}
                    />
                  </div>
                  <p className="text-gray-700">
                    <strong className="flex items-center gap-2">
                      <User className="inline w-4 h-4 text-blue-600" /> Nom:
                    </strong>{" "}
                    {selectedPatient.name}
                  </p>
                  <p className="text-gray-700">
                    <strong className="flex items-center gap-2">
                      <Mail className="inline w-4 h-4 text-blue-600" /> Email:
                    </strong>{" "}
                    {selectedPatient.email || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong className="flex items-center gap-2">
                      <Phone className="inline w-4 h-4 text-blue-600" /> Téléphone:
                    </strong>{" "}
                    {selectedPatient.phoneNumber || "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong className="flex items-center gap-2">
                      <Calendar className="inline w-4 h-4 text-blue-600" /> Date de Naissance:
                    </strong>{" "}
                    {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-gray-700">
                    <strong className="flex items-center gap-2">
                      <Heart className="inline w-4 h-4 text-blue-600" /> Groupe Sanguin:
                    </strong>{" "}
                    {selectedPatient.bloodType || "N/A"}
                  </p>
                  {selectedPatient.condition && (
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Activity className="inline w-4 h-4 text-blue-600" /> Condition:
                      </strong>{" "}
                      {selectedPatient.condition}
                    </p>
                  )}
                  {selectedPatient.age && (
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <FileText className="inline w-4 h-4 text-blue-600" /> Âge:
                      </strong>{" "}
                      {selectedPatient.age} ans
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 w-full">
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

export default Patients
