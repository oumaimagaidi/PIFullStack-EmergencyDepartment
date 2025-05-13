"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  UserPlus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Stethoscope,
  Users,
  RefreshCw,
  BadgeCheck,
  FileText,
} from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const doctorsPerPage = 6
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [newDoctor, setNewDoctor] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    licenseNumber: "",
    badgeNumber: "",
    profileImage: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const specializations = ["Cardiology", "Surgery", "Pediatrics", "Orthopedics", "Neurology", "Dermatology"]

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get("http://localhost:8089/api/users/doctors", {
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      const fetchedDoctors = response.data || []
      setDoctors(fetchedDoctors)
      setTotalPages(Math.ceil(fetchedDoctors.length / doctorsPerPage))
    } catch (error) {
      console.error("Error fetching doctors:", error)
      setError(error.response?.data?.message || "Failed to fetch doctors")
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDoctors()
    setTimeout(() => setRefreshing(false), 800)
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const validateFields = (data, isUpdate = false) => {
    const errors = {}
    const { username, email, password, phoneNumber, specialization, licenseNumber, badgeNumber } = data

    if (!username) errors.username = "Username is required"
    if (!email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email"
    if (!phoneNumber) errors.phoneNumber = "Phone number is required"
    else if (!/^\d{9,}$/.test(phoneNumber)) errors.phoneNumber = "Invalid phone number (at least 9 digits)"
    if (!specialization) errors.specialization = "Specialization is required"
    if (!licenseNumber) errors.licenseNumber = "License number is required"
    else if (!/^\d+$/.test(licenseNumber)) errors.licenseNumber = "License number must be numeric"
    if (!badgeNumber) errors.badgeNumber = "Badge number is required"
    else if (!/^\d+$/.test(badgeNumber)) errors.badgeNumber = "Badge number must be numeric"
    if (!isUpdate && (!password || password.length < 6)) errors.password = "Password must be at least 6 characters"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)

    if (!query.trim()) {
      fetchDoctors()
      return
    }

    const filtered = doctors.filter(
      (doctor) =>
        doctor.username?.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(query.toLowerCase()),
    )

    setDoctors(filtered)
    setTotalPages(Math.ceil(filtered.length / doctorsPerPage))
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      await axios.delete(`http://localhost:8089/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      alert("Doctor deleted successfully")
      fetchDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
      alert(error.response?.data?.message || "Error deleting doctor")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!validateFields(newDoctor)) return

    setLoading(true)
    const formData = new FormData()
    formData.append("username", newDoctor.username)
    formData.append("email", newDoctor.email)
    formData.append("password", newDoctor.password)
    formData.append("phoneNumber", newDoctor.phoneNumber)
    formData.append("specialization", newDoctor.specialization)
    formData.append("licenseNumber", newDoctor.licenseNumber)
    formData.append("badgeNumber", newDoctor.badgeNumber)
    formData.append("role", "Doctor")
    formData.append("isValidated", true)

    if (newDoctor.profileImage) {
      formData.append("profileImage", newDoctor.profileImage)
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.post("http://localhost:8089/api/auth/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setNewDoctor({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        specialization: "",
        licenseNumber: "",
        badgeNumber: "",
        profileImage: null,
      })
      setPreviewImage(null)
      setFormErrors({})
      setIsSheetOpen(false)
      alert(response.data?.message || "Doctor added successfully")
      fetchDoctors()
    } catch (error) {
      console.error("Error adding doctor:", error)
      alert(error.response?.data?.message || "Error adding doctor")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingDoctor || !validateFields(editingDoctor, true)) return

    setLoading(true)
    const formData = new FormData()
    formData.append("username", editingDoctor.username)
    formData.append("email", editingDoctor.email)
    formData.append("phoneNumber", editingDoctor.phoneNumber)
    formData.append("specialization", editingDoctor.specialization)
    formData.append("licenseNumber", editingDoctor.licenseNumber)
    formData.append("badgeNumber", editingDoctor.badgeNumber)

    if (editingDoctor.profileImage instanceof File) {
      formData.append("profileImage", editingDoctor.profileImage)
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.put(`http://localhost:8089/api/users/${editingDoctor._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setEditingDoctor(null)
      setPreviewImage(null)
      setFormErrors({})
      setIsSheetOpen(false)
      alert(response.data?.message || "Doctor updated successfully")
      fetchDoctors()
    } catch (error) {
      console.error("Error updating doctor:", error)
      alert(error.response?.data?.message || "Error updating doctor")
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

      if (editingDoctor) {
        setEditingDoctor({ ...editingDoctor, profileImage: file })
      } else {
        setNewDoctor({ ...newDoctor, profileImage: file })
      }
    }
  }

  const handleEditClick = (doctor) => {
    setEditingDoctor({ ...doctor })
    setPreviewImage(doctor.profileImage ? `http://localhost:8089${doctor.profileImage}` : null)
    setFormErrors({})
    setIsSheetOpen(true)
  }

  const handleSheetClose = () => {
    setIsSheetOpen(false)
    setEditingDoctor(null)
    setNewDoctor({
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      specialization: "",
      licenseNumber: "",
      badgeNumber: "",
      profileImage: null,
    })
    setPreviewImage(null)
    setFormErrors({})
  }

  // Pagination
  const paginatedDoctors = doctors.slice((currentPage - 1) * doctorsPerPage, currentPage * doctorsPerPage)


  

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
      <div className="flex justify-center gap-2 mt-8" role="navigation" aria-label="Pagination">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          Previous
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`${
              currentPage === page ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            } transition-all duration-300 rounded-lg px-4 py-2`}
          >
            {page}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-white p-8">
      {/* Enhanced Header with Stats */}
      <div className="mb-12">
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center mb-8 mx-auto max-w-4xl"
  >
    <h1 className="text-5xl font-extrabold tracking-tight mb-2" style={{ color: '#42A5FF' }}>
      Medical Staff Directory
    </h1>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
      Manage your healthcare professionals with our comprehensive doctor management system
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
                  <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{doctors.length}</h3>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{new Date().toLocaleDateString()}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <RefreshCw
                    className={`h-6 w-6 text-green-600 ${refreshing ? "animate-spin" : ""}`}
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
            placeholder="Search doctors by name or specialization..."
            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            aria-label="Search doctors"
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 transition-all duration-300 shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        
        </div>
      </div>

      {loading && doctors.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw className="w-12 h-12 text-indigo-600" />
          </motion.div>
          <span className="ml-4 text-indigo-600 text-xl">Loading doctors...</span>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-red-50 p-8 rounded-xl border border-red-200"
        >
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button
            onClick={fetchDoctors}
            className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 rounded-lg px-6 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      ) : paginatedDoctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center bg-gray-50 p-12 rounded-xl border border-gray-200"
        >
          <p className="text-gray-500 text-xl mb-4" role="alert">
            No doctors found matching your search criteria.
          </p>
          {searchQuery && (
            <Button
              onClick={() => {
                setSearchQuery("")
                fetchDoctors()
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 rounded-lg px-6 py-2"
            >
              Clear Search
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
            {paginatedDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-400">
                  <CardContent className="p-6 text-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                    <img
  src={
    doctor.profileImage
      ? `http://localhost:8089${doctor.profileImage.startsWith("/") ? doctor.profileImage : "/" + doctor.profileImage}`
      : "https://via.placeholder.com/150?text=Doctor"
  }
  alt={doctor.username}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "https://cdn-icons-png.flaticon.com/512/387/387561.png"; // Icône de docteur
  }}
  className="w-40 h-40 mx-auto object-cover rounded-full border-4 border-gray-100 group-hover:border-indigo-300 transition-all duration-500 group-hover:scale-110"
/>


                      {doctor.specialization && (
                        <motion.span
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute top-2 left-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full shadow-md border border-indigo-200 group-hover:bg-indigo-100 transition-all duration-300"
                        >
                          <Stethoscope className="w-3 h-3 inline mr-1" /> {doctor.specialization}
                        </motion.span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mt-6 truncate">
                      {doctor.username || "Name not available"}
                    </h2>
                    <div className="mt-6 space-y-4 text-gray-600 text-sm">
                      {doctor.badgeNumber && (
                        <p className="flex items-center justify-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-indigo-500" /> Badge: {doctor.badgeNumber}
                        </p>
                      )}
                      {doctor.licenseNumber && (
                        <p className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" /> License: {doctor.licenseNumber}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 group relative">
                        <Mail className="h-4 w-4 text-indigo-400" />
                        <span className="group-hover:text-indigo-600 transition-colors duration-300">
                          {doctor.email || "Email not available"}
                        </span>
                        <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Send email
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 group relative">
                        <Phone className="h-4 w-4 text-green-400" />
                        <span className="group-hover:text-green-600 transition-colors duration-300">
                          {doctor.phoneNumber || "Number not available"}
                        </span>
                        <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Call
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-8 gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative group bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                        onClick={() => handleEditClick(doctor)}
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                        <span className="absolute bottom-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Edit this doctor
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative group bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-lg transition-all duration-300"
                        onClick={() => handleDelete(doctor._id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                        <span className="absolute bottom-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                          Delete this doctor
                        </span>
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
    </div>
  )
}

export default Doctors
