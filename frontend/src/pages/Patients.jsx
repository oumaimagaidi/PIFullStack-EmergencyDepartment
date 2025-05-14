// src/pages/Patients.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card" // CardHeader, CardTitle retirés car non utilisés directement ici
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
  Filter, // Conservé au cas où vous l'ajouteriez plus tard
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Activity,
  FileText,
  ClipboardList,
  ChevronLeft, // Ajouté pour Pagination
  ChevronRight, // Ajouté pour Pagination
  Settings2, // Pour l'icône d'erreur améliorée
  Briefcase // Pour le rôle dans StaffDirectory
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

// --- Pagination Component (No text changes needed here as it's mostly icons and numbers) ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);
    if (currentPage - halfPagesToShow <= 0) endPage = Math.min(totalPages, maxPagesToShow);
    if (currentPage + halfPagesToShow >= totalPages) startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    if (totalPages < maxPagesToShow) { startPage = 1; endPage = totalPages; }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
        <div className="flex justify-center items-center space-x-1 mt-8">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"><ChevronLeft className="h-4 w-4" />Previous</Button>
            {startPage > 1 && (<><Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">1</Button>{startPage > 2 && <span className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">...</span>}</>)}
            {pageNumbers.map(number => (<Button key={number} variant={currentPage === number ? "default" : "ghost"} size="sm" onClick={() => onPageChange(number)} className={`${currentPage === number ? "bg-sky-400 hover:bg-sky-500 text-white cursor-default shadow-md" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"} font-medium rounded-md transition-all duration-200`}>{number}</Button>))}
            {endPage < totalPages && (<><Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">{totalPages}</Button>{endPage < totalPages - 1 && <span className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">...</span>}</>)}
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">Next<ChevronRight className="h-4 w-4" /></Button>
        </div>
    );
};


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
      setError("Could not retrieve patients.") // English
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

    if (!name) errors.name = "Name is required"
    if (!email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email"
    if (!phoneNumber) errors.phoneNumber = "Phone number is required"
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!bloodType) errors.bloodType = "Blood type is required"
    if (!isUpdate && (!password || password.length < 6))
      errors.password = "Password must be at least 6 characters"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
    // Filtering logic is now handled by useMemo for paginatedPatients
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!validateFields(newPatient)) return
    setLoading(true)
    // ... (FormData appending logic unchanged)
    const formData = new FormData();
    Object.keys(newPatient).forEach(key => {
        if (newPatient[key] !== null) formData.append(key, newPatient[key]);
    });
    formData.append("role", "Patient"); // Ensure role is set for backend

    try {
      const response = await axios.post("http://localhost:8089/api/auth/register", formData, { // Assuming register handles patient creation
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      setNewPatient({ name: "", email: "", password: "", phoneNumber: "", dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null })
      setPreviewImage(null); setFormErrors({}); setIsSheetOpen(false);
      // await fetchPatients(); // Re-fetch all patients to get the new one with its _id
      setPatients(prev => [...prev, response.data.user]); // Optimistic update, ensure response.data.user is the full patient object
      setTotalPages(Math.ceil((patients.length + 1) / patientsPerPage));
      toast.success("Patient added successfully!"); // English toast
    } catch (error) {
      console.error("Error adding patient:", error)
      toast.error(error.response?.data?.message || "Error adding patient") // English
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingPatient || !validateFields(editingPatient, true)) return
    setLoading(true)
    // ... (FormData appending logic unchanged)
    const formData = new FormData();
    Object.keys(editingPatient).forEach(key => {
        if (key !== '_id' && key !== 'profileImage' && editingPatient[key] !== null && editingPatient[key] !== undefined) {
             formData.append(key, editingPatient[key]);
        }
    });
    if (editingPatient.profileImage instanceof File) {
        formData.append("profileImage", editingPatient.profileImage);
    }


    try {
      const response = await axios.put(`http://localhost:8089/api/users/${editingPatient._id}`, formData, { // Assuming generic user update route
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      setEditingPatient(null); setPreviewImage(null); setFormErrors({}); setIsSheetOpen(false);
      setPatients(prev => prev.map((p) => (p._id === response.data._id ? response.data : p))); // Ensure response.data is the full patient object
      toast.success("Patient updated successfully!"); // English
    } catch (error) {
      console.error("Error updating patient:", error)
      toast.error(error.response?.data?.message || "Error updating patient") // English
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return // English
    setLoading(true)
    try {
      await axios.delete(`http://localhost:8089/api/users/patients/${id}`, { // Assuming specific patient delete route
        withCredentials: true,
      })
      setPatients(prev => prev.filter((p) => p._id !== id));
      setTotalPages(Math.ceil((patients.length -1) / patientsPerPage));
      toast.success("Patient deleted successfully!"); // English
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast.error(error.response?.data?.message || "Error deleting patient") // English
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => { /* ... (unchanged) ... */ 
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
        if (editingPatient) {
            setEditingPatient({ ...editingPatient, profileImage: file });
        } else {
            setNewPatient({ ...newPatient, profileImage: file });
        }
    }
  }

  const handleEditClick = (patient) => { /* ... (unchanged) ... */ 
    setEditingPatient({ ...patient });
    setPreviewImage(patient.profileImage ? `http://localhost:8089${patient.profileImage.startsWith('/') ? patient.profileImage : `/${patient.profileImage}`}` : null);
    setFormErrors({});
    setIsSheetOpen(true);
  }
  const handleSheetClose = () => { /* ... (unchanged) ... */ 
    setIsSheetOpen(false);
    setEditingPatient(null);
    setNewPatient({ name: "", email: "", password: "", phoneNumber: "", dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null });
    setPreviewImage(null);
    setFormErrors({});
  }

  const filteredPatients = useMemo(() => 
    patients.filter((patient) => 
      (patient.name || patient.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || // Added username for flexibility
      (patient.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [patients, searchQuery]
  );

  const paginatedPatients = useMemo(() => 
    filteredPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage),
    [filteredPatients, currentPage, patientsPerPage]
  );

  useEffect(() => {
    const newTotalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filteredPatients.length > 0) { // If filter results in 0 pages but there are items
        setCurrentPage(1);
    } else if (newTotalPages > 0 && currentPage === 0) {
        setCurrentPage(1);
    }
  }, [filteredPatients, currentPage, patientsPerPage]);


  const PatientForm = ({ isEditing }) => (
    <form onSubmit={isEditing ? handleUpdate : handleAdd} className="space-y-4 mt-6">
      <div className="relative">
        <Input
          placeholder="Full Name" // English
          value={isEditing ? editingPatient.name : newPatient.name}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, name: e.target.value }) : setNewPatient({ ...newPatient, name: e.target.value })}
          required aria-invalid={!!formErrors.name} aria-describedby={formErrors.name ? "name-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        />
        {formErrors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
      </div>
      <div className="relative">
        <Input
          placeholder="Email" // English
          type="email"
          value={isEditing ? editingPatient.email : newPatient.email}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, email: e.target.value }) : setNewPatient({ ...newPatient, email: e.target.value })}
          required aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? "email-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        />
        {formErrors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
      </div>
      {!isEditing && (
        <div className="relative">
          <Input
            placeholder="Password" // English
            type="password"
            value={newPatient.password}
            onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
            required aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? "password-error" : undefined}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
          />
          {formErrors.password && <p id="password-error" className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
        </div>
      )}
      <div className="relative">
        <Input
          placeholder="Phone Number" // English
          value={isEditing ? editingPatient.phoneNumber : newPatient.phoneNumber}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, phoneNumber: e.target.value }) : setNewPatient({ ...newPatient, phoneNumber: e.target.value })}
          required aria-invalid={!!formErrors.phoneNumber} aria-describedby={formErrors.phoneNumber ? "phoneNumber-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        />
        {formErrors.phoneNumber && <p id="phoneNumber-error" className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
      </div>
      <div className="relative">
        <Input
          placeholder="Date of Birth" // English
          type="date"
          value={isEditing ? editingPatient.dateOfBirth : newPatient.dateOfBirth}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value }) : setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
          required aria-invalid={!!formErrors.dateOfBirth} aria-describedby={formErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        />
        {formErrors.dateOfBirth && <p id="dateOfBirth-error" className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
      </div>
      <div className="relative">
        <Input
          placeholder="Age" // English
          type="number"
          value={isEditing ? editingPatient.age : newPatient.age}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, age: e.target.value }) : setNewPatient({ ...newPatient, age: e.target.value })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        />
      </div>
      <div className="relative">
        <select
          value={isEditing ? editingPatient.bloodType : newPatient.bloodType}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, bloodType: e.target.value }) : setNewPatient({ ...newPatient, bloodType: e.target.value })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
          required aria-invalid={!!formErrors.bloodType} aria-describedby={formErrors.bloodType ? "bloodType-error" : undefined}
        >
          <option value="">Select Blood Type</option> {/* English */}
          {bloodTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        {formErrors.bloodType && <p id="bloodType-error" className="text-red-500 text-sm mt-1">{formErrors.bloodType}</p>}
      </div>
      <div className="relative">
        <select
          value={isEditing ? editingPatient.condition : newPatient.condition}
          onChange={(e) => isEditing ? setEditingPatient({ ...editingPatient, condition: e.target.value }) : setNewPatient({ ...newPatient, condition: e.target.value })}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
        >
          <option value="">Select Medical Condition</option> {/* English */}
          {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
        </select>
      </div>
      <div className="relative">
        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label> {/* English */}
        <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border border-gray-200 rounded-lg file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        {previewImage && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="mt-4 flex justify-center">
            <img src={previewImage || "/placeholder.svg"} alt="Preview" className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 hover:border-indigo-400"/>
          </motion.div>
        )}
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white disabled:opacity-50" disabled={loading}>
        {loading ? <span className="mr-2 animate-spin">⏳</span> : null}
        {isEditing ? "Update Patient" : "Add Patient"} {/* English */}
      </Button>
      <Button type="button" variant="outline" className="w-full mt-3" onClick={handleSheetClose}>
        Cancel {/* English */}
      </Button>
    </form>
  )

  const getConditionColor = (condition) => { /* ... (unchanged) ... */ 
    switch (condition?.toLowerCase()) {
      case "critical": return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-700/30 border-red-300 dark:border-red-600";
      case "stable": return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-700/30 border-green-300 dark:border-green-600";
      case "recovering": return "text-emerald-600 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-700/30 border-emerald-300 dark:border-emerald-600";
      case "under observation": return "text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-700/30 border-amber-300 dark:border-amber-600";
      case "chronic": return "text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-700/30 border-purple-300 dark:border-purple-600";
      case "acute": return "text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-700/30 border-orange-300 dark:border-orange-600";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-50 dark:from-slate-950 dark:via-sky-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 md:mb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6 md:mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500">
            Patient Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Comprehensive system to track and manage patient information efficiently.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 justify-center mx-auto max-w-4xl">
          <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 rounded-xl">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Patients</p>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">{patients.length}</h3>
                </div>
                <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 rounded-xl">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Update</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">{new Date().toLocaleDateString('en-US')}</h3>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-full">
                  <RefreshCw className={`h-6 w-6 text-emerald-600 dark:text-emerald-400 ${refreshing ? "animate-spin" : "cursor-pointer"}`} onClick={refreshData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </header>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search patients by name or email..." // English
            className="w-full pl-10 p-3 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-500 bg-white dark:bg-slate-800 shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            aria-label="Search patients"
          />
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button 
                    onClick={() => { setEditingPatient(null); setNewPatient({ name: "", email: "", password: "", phoneNumber: "", dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null }); setFormErrors({}); setPreviewImage(null); setIsSheetOpen(true);}}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2 px-5 py-2.5 rounded-lg"
                >
                    <UserPlus className="h-4.5 w-4.5" />
                    Add New Patient {/* English */}
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-white dark:bg-slate-900 border-l dark:border-slate-700 w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="p-6 border-b dark:border-slate-700">
                    <SheetTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        {editingPatient ? "Edit Patient" : "Add New Patient"} {/* English */}
                    </SheetTitle>
                </SheetHeader>
                <div className="p-6">
                    <PatientForm isEditing={!!editingPatient} />
                </div>
            </SheetContent>
        </Sheet>
      </div>

      {loading && patients.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
            <RefreshCw className="w-10 h-10 text-sky-600 dark:text-sky-400" />
          </motion.div>
          <span className="text-sky-600 dark:text-sky-400 text-lg font-medium">Loading patients...</span> {/* English */}
        </div>
      ) : error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-200 dark:border-red-700">
          <Settings2 className="h-12 w-12 mx-auto text-red-500 dark:text-red-400 mb-3" />
          <p className="text-red-600 dark:text-red-400 text-xl font-medium mb-2">Error Loading Patients</p> {/* English */}
          <p className="text-red-500 dark:text-red-500 text-sm mb-4">{error}</p>
          <Button onClick={fetchPatients} className="bg-red-600 text-white hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry {/* English */}
          </Button>
        </motion.div>
      ) : paginatedPatients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-slate-50 dark:bg-slate-800/30 p-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
           <Users className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-xl font-medium mb-2" role="alert">
            No patients found matching your search criteria. {/* English */}
          </p>
          {searchQuery && (
            <Button onClick={() => { setSearchQuery(""); fetchPatients(); }} className="bg-sky-600 text-white hover:bg-sky-700">
              Clear Search {/* English */}
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {paginatedPatients.map((patient, index) => (
              <motion.div key={patient._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <Card className="bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-2 ${getConditionColor(patient.condition).split(' ')[1].replace('bg-', 'border-b-4 border-')}`}></div>
                  <CardContent className="p-5 sm:p-6 flex-grow text-center">
                    <div className="relative group mb-4">
                      <div className="absolute -inset-2 bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-200 dark:from-sky-800 dark:via-blue-800 dark:to-indigo-800 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                      <img
                        src={patient.profileImage ? `http://localhost:8089${patient.profileImage.startsWith("/") ? patient.profileImage : "/" + patient.profileImage}` : "https://avatar.iran.liara.run/public/boy?username=" + (patient.name || patient.username || "Patient")}
                        alt={patient.name || patient.username}
                        className="w-28 h-28 sm:w-32 sm:h-32 mx-auto object-cover rounded-full border-4 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public/boy?username=Default"; }}
                      />
                      {patient.bloodType && (
                        <motion.span initial={{ scale:0, opacity: 0 }} animate={{ scale:1, opacity: 1 }} transition={{ delay: 0.2, type:'spring', stiffness:200 }} className={`absolute top-0 left-0 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border ${getConditionColor("bloodtype")}`}> {/* Custom style for bloodtype */}
                          <Heart className="w-3 h-3 inline mr-1" /> {patient.bloodType}
                        </motion.span>
                      )}
                       {patient.condition && (
                        <motion.span initial={{ scale:0, opacity: 0 }} animate={{ scale:1, opacity: 1 }} transition={{ delay: 0.3, type:'spring', stiffness:200 }} className={`absolute top-0 right-0 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border ${getConditionColor(patient.condition)}`}>
                          <Activity className="w-3 h-3 inline mr-1" /> {patient.condition}
                        </motion.span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3 truncate" title={patient.name || patient.username}>
                      {patient.name || patient.username || "Name Unavailable"}
                    </h2>
                     <div className="mt-3 space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                        {patient.age && (
                            <p className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Age: {patient.age} years
                            </p>
                        )}
                        <p className="flex items-center justify-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition-colors">
                            <Mail className="h-3.5 w-3.5" />
                            {patient.email || "Email Unavailable"}
                        </p>
                        <p className="flex items-center justify-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition-colors">
                            <Phone className="h-3.5 w-3.5" />
                            {patient.phoneNumber || "Phone Unavailable"}
                        </p>
                    </div>
                  </CardContent>
                   <CardFooter className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-700 mt-auto">
                    <div className="flex justify-center w-full gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleEditClick(patient)} disabled={loading}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-700/30 dark:border-red-600" onClick={() => handleDelete(patient._id)} disabled={loading}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => { setSelectedPatient(patient); setIsDetailsOpen(true); }} disabled={loading}><ClipboardList className="h-3.5 w-3.5 mr-1" /> Details</Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </>
      )}

      <AnimatePresence>
        {isDetailsOpen && selectedPatient && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-700">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                <DialogHeader className="p-6 border-b dark:border-slate-700">
                  <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Patient Details</DialogTitle> {/* English */}
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Information about {selectedPatient.name || selectedPatient.username} {/* English */}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 p-6 max-h-[60vh] overflow-y-auto">
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedPatient.profileImage ? `http://localhost:8089${selectedPatient.profileImage.startsWith("/") ? selectedPatient.profileImage : "/" + selectedPatient.profileImage}` : "https://avatar.iran.liara.run/public/boy?username=" + (selectedPatient.name || selectedPatient.username || "Patient")}
                      alt={selectedPatient.name || selectedPatient.username}
                      className="w-28 h-28 rounded-full object-cover border-4 border-sky-200 dark:border-sky-700 shadow-lg"
                      onError={(e) => { e.target.src = "https://avatar.iran.liara.run/public/boy?username=Default"; }}
                    />
                  </div>
                  {/* ... Informations du patient traduites ... */}
                  <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><User className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Name:</strong> {selectedPatient.name || selectedPatient.username}</p>
                  <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><Mail className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Email:</strong> {selectedPatient.email || "N/A"}</p>
                  <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><Phone className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Phone:</strong> {selectedPatient.phoneNumber || "N/A"}</p>
                  <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><Calendar className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Date of Birth:</strong> {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-US') : "N/A"}</p>
                  <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><Heart className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Blood Type:</strong> {selectedPatient.bloodType || "N/A"}</p>
                  {selectedPatient.condition && <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><Activity className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Condition:</strong> {selectedPatient.condition}</p>}
                  {selectedPatient.age && <p className="text-slate-700 dark:text-slate-300"><strong className="font-medium flex items-center gap-2 text-slate-500 dark:text-slate-400"><FileText className="inline w-4 h-4 text-sky-600 dark:text-sky-400" /> Age:</strong> {selectedPatient.age} years</p>}
                </div>
                <DialogFooter className="p-6 border-t dark:border-slate-700">
                  <DialogClose asChild>
                    <Button className="bg-gradient-to-r from-sky-600 to-blue-700 text-white hover:from-sky-700 hover:to-blue-800 w-full">Close</Button> {/* English */}
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