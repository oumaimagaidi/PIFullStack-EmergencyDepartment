"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Added for specialization select in form
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import {
  UserPlus,
  Search,
  // Filter, // Not used in current UI
  Pencil,
  Trash2,
  Mail,
  Phone,
  Stethoscope,
  Users,
  RefreshCw,
  BadgeCheck,
  FileText,
  Loader2, // For loading states
  ShieldAlert, // For error messages
  ImagePlus, // For image upload
  X, // For closing sheet/clearing image
} from "lucide-react"
import axios from "axios"
import { motion } from "framer-motion"
import { toast } from "sonner"; // For notifications

// Consistent Palette
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  pageGradientStart: "#F0F4F8", // Clean gradient start
  pageGradientEnd: "#E0E8F0",   // Clean gradient end
  cardBackground: "#FFFFFF",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  textLight: "text-[#ECEFCA]",
  borderSubtle: "border-gray-200/90", // Softer than #94B4C1 for general cards
  borderFocus: "focus:ring-[#547792] focus:border-[#547792]",
  buttonPrimaryBg: "bg-[#547792]",
  buttonPrimaryText: "text-white",
  buttonPrimaryHoverBg: "hover:bg-[#213448]",
  buttonOutlineBorder: "border-[#94B4C1]",
  buttonOutlineText: "text-[#547792]",
  buttonOutlineHoverBorder: "hover:border-[#213448]",
  buttonOutlineHoverBg: "hover:bg-[#ECEFCA]/40",
  actionIconDefault: "text-[#547792]",
  actionIconEdit: "text-yellow-600",
  actionIconDelete: "text-red-600",
  sheetBackground: "bg-white", // Ensure sheet is on top
};

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
    username: "", email: "", password: "", phoneNumber: "",
    specialization: "", licenseNumber: "", badgeNumber: "", profileImage: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);


  // More comprehensive list, can be fetched from API if dynamic
  const specializations = [
    "Cardiology", "Surgery", "Pediatrics", "Orthopedics", "Neurology", "Dermatology",
    "Oncology", "Radiology", "Anesthesiology", "Psychiatry", "General Medicine", "ENT"
  ];

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
    const errors = {};
    const { username, email, password, phoneNumber, specialization, licenseNumber, badgeNumber } = data;

    if (!username?.trim()) errors.username = "Username is required";
    if (!email?.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (!phoneNumber?.trim()) errors.phoneNumber = "Phone number is required";
    else if (!/^\+?\d{9,15}$/.test(phoneNumber)) errors.phoneNumber = "Invalid phone number (9-15 digits, optional +)";
    if (!specialization) errors.specialization = "Specialization is required";
    if (!licenseNumber?.trim()) errors.licenseNumber = "License number is required";
    // else if (!/^[A-Za-z0-9]+$/.test(licenseNumber)) errors.licenseNumber = "License number must be alphanumeric"; // Allow alphanumeric
    if (!badgeNumber?.trim()) errors.badgeNumber = "Badge number is required";
    // else if (!/^[A-Za-z0-9]+$/.test(badgeNumber)) errors.badgeNumber = "Badge number must be alphanumeric"; // Allow alphanumeric

    if (!isUpdate && (!password || password.length < 6)) {
        errors.password = "Password must be at least 6 characters";
    } else if (isUpdate && password && password.length > 0 && password.length < 6) {
        // Optional password update, but if provided, validate
        errors.password = "New password must be at least 6 characters";
    }


    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Apply filtering based on searchQuery
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Update total pages based on filtered results
  useEffect(() => {
    setTotalPages(Math.ceil(filteredDoctors.length / doctorsPerPage));
    setCurrentPage(1); // Reset to first page when filters change doctors list
  }, [filteredDoctors.length, doctorsPerPage]);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) return;

    setIsSubmitting(true); // Use for general form submission loader
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:8089/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Doctor deleted successfully!");
      fetchDoctors(); // Refresh list
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast.error(err.response?.data?.message || "Error deleting doctor.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dataToValidate = editingDoctor || newDoctor;
    if (!validateFields(dataToValidate, !!editingDoctor)) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("username", dataToValidate.username);
    formData.append("email", dataToValidate.email);
    formData.append("phoneNumber", dataToValidate.phoneNumber);
    formData.append("specialization", dataToValidate.specialization);
    formData.append("licenseNumber", dataToValidate.licenseNumber);
    formData.append("badgeNumber", dataToValidate.badgeNumber);
    
    if (!editingDoctor) { // For adding new doctor
        formData.append("password", dataToValidate.password);
        formData.append("role", "Doctor");
        formData.append("isValidated", true); // Or handle validation flow
    } else if (editingDoctor && dataToValidate.password && dataToValidate.password.length >=6) {
        // If it's an update and a new password is provided and valid
        formData.append("password", dataToValidate.password);
    }


    if (dataToValidate.profileImage instanceof File) {
        formData.append("profileImage", dataToValidate.profileImage);
    }

    const token = localStorage.getItem("authToken");
    const apiEndpoint = editingDoctor
        ? `http://localhost:8089/api/users/${editingDoctor._id}`
        : "http://localhost:8089/api/auth/register";
    const method = editingDoctor ? "put" : "post";

    try {
        const response = await axios[method](apiEndpoint, formData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(response.data?.message || `Doctor ${editingDoctor ? 'updated' : 'added'} successfully!`);
        handleSheetClose(); // Close sheet and reset form
        fetchDoctors(); // Refresh list
    } catch (err) {
        console.error(`Error ${editingDoctor ? 'updating' : 'adding'} doctor:`, err.response?.data || err.message);
        toast.error(err.response?.data?.message || `Error ${editingDoctor ? 'updating' : 'adding'} doctor.`);
    } finally {
        setIsSubmitting(false);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      if (editingDoctor) {
        setEditingDoctor({ ...editingDoctor, profileImage: file });
      } else {
        setNewDoctor({ ...newDoctor, profileImage: file });
      }
    }
  };

  const handleEditClick = (doctor) => {
    setEditingDoctor({ ...doctor, password: "" }); // Clear password for update form initially
    setPreviewImage(doctor.profileImage ? `http://localhost:8089${doctor.profileImage.startsWith("/") ? doctor.profileImage : "/" + doctor.profileImage}` : null);
    setFormErrors({});
    setIsSheetOpen(true);
  };
  
  const handleAddNewClick = () => {
    setEditingDoctor(null); // Ensure not in edit mode
    setNewDoctor({ // Reset new doctor form
        username: "", email: "", password: "", phoneNumber: "",
        specialization: "", licenseNumber: "", badgeNumber: "", profileImage: null,
    });
    setPreviewImage(null);
    setFormErrors({});
    setIsSheetOpen(true);
  };


  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingDoctor(null);
    setNewDoctor({ username: "", email: "", password: "", phoneNumber: "", specialization: "", licenseNumber: "", badgeNumber: "", profileImage: null, });
    setPreviewImage(null);
    setFormErrors({});
  };

  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * doctorsPerPage, currentPage * doctorsPerPage);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex justify-center items-center gap-2 mt-10" role="navigation" aria-label="Pagination">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          variant="outline"
          className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} disabled:opacity-50`}
        >
          Previous
        </Button>
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            variant={currentPage === page ? "default" : "outline"}
            className={
              currentPage === page
                ? `${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg}`
                : `${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder}`
            }
          >
            {page}
          </Button>
        ))}
        <Button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
          variant="outline"
          className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} disabled:opacity-50`}
        >
          Next
        </Button>
      </div>
    );
  };

  // Form input component for reuse in sheet
  const FormInput = ({ name, label, placeholder, value, onChange, error, type = "text", disabled = false, children }) => (
    <div>
        <label htmlFor={name} className={`block text-sm font-medium mb-1 ${PALETTE.textPrimary}`}>{label}</label>
        {children ? children : (
            <Input
                id={name} name={name} type={type} placeholder={placeholder}
                value={value} onChange={onChange} disabled={disabled || isSubmitting}
                className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md shadow-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );


  return (
    <div className={`min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] p-6 md:p-8`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 md:mb-12"
      >
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${PALETTE.textPrimary}`}>
          Medical Staff Directory
        </h1>
        <p className={`${PALETTE.textSecondary} text-base md:text-lg max-w-2xl mx-auto mt-2`}>
          Manage healthcare professionals with our comprehensive system.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 md:p-6 bg-[${PALETTE.cardBackground}] rounded-xl shadow-lg border ${PALETTE.borderSubtle}`}
      >
        <Card className={`bg-transparent shadow-none border-none`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${PALETTE.textSecondary}`}>Total Doctors</p>
                <h3 className={`text-3xl font-bold ${PALETTE.textPrimary} mt-1`}>{doctors.length}</h3>
              </div>
              <div className={`p-3 rounded-full bg-[${PALETTE.secondaryMuted}]/10`}>
                <Users className={`h-6 w-6 ${PALETTE.secondaryMuted}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-transparent shadow-none border-none`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${PALETTE.textSecondary}`}>System Status</p>
                <h3 className={`text-lg font-bold ${PALETTE.textPrimary} mt-1 text-green-600`}>Operational</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshData}
                disabled={refreshing}
                className={`p-3 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-600`}
                aria-label="Refresh doctor list"
              >
                <RefreshCw className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-4 bg-[${PALETTE.cardBackground}] rounded-xl shadow-md border ${PALETTE.borderSubtle}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${PALETTE.textSecondary}`} />
          <Input
            placeholder="Search by name, specialization, email..."
            className={`w-full pl-10 py-2.5 ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-lg shadow-sm`}
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={loading}
            aria-label="Search doctors"
          />
        </div>
        <Button
            onClick={handleAddNewClick}
            className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} py-2.5 rounded-lg shadow-sm flex items-center gap-2`}
        >
            <UserPlus className="h-5 w-5" /> Add New Doctor
        </Button>
      </div>
      
      {loading && doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className={`w-12 h-12 animate-spin ${PALETTE.secondaryMuted}`} />
          <span className={`ml-4 ${PALETTE.secondaryMuted} text-xl mt-4`}>Loading doctors...</span>
        </div>
      ) : error && doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`text-center bg-red-50 p-8 rounded-xl border border-red-300 text-red-700`}
        >
          <ShieldAlert className="w-12 h-12 mx-auto mb-4"/>
          <p className="text-lg mb-4">{error}</p>
          <Button
            onClick={() => fetchDoctors()}
            className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} rounded-lg`}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </motion.div>
      ) : paginatedDoctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`text-center bg-[${PALETTE.cardBackground}] p-12 rounded-xl border ${PALETTE.borderSubtle} shadow`}
        >
          <Users className={`w-16 h-16 mx-auto mb-6 ${PALETTE.textSecondary}/70`} />
          <p className={`${PALETTE.textPrimary} text-xl mb-4`} role="alert">
            No doctors found.
          </p>
          {searchQuery && (
            <Button
              onClick={() => { setSearchQuery(""); /* fetchDoctors(); implicitly handled by useEffect on searchQuery*/ }}
              variant="outline"
              className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg} rounded-lg`}
            >
              Clear Search
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full" // Ensure cards in a row take full height if content differs
              >
                <Card className={`relative ${PALETTE.sheetBackground} shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border ${PALETTE.borderSubtle} flex flex-col h-full`}>
                  <CardContent className="p-6 text-center flex flex-col flex-grow">
                    <div className="relative mb-5">
                      <img
                        src={doctor.profileImage ? `http://localhost:8089${doctor.profileImage.startsWith("/") ? doctor.profileImage : "/" + doctor.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.username)}&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=160`}
                        alt={doctor.username}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=Doctor&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=160`; }}
                        className={`w-32 h-32 mx-auto object-cover rounded-full border-4 border-[${PALETTE.lightAccent}] shadow-md`}
                      />
                      {doctor.specialization && (
                        <span className={`absolute top-0 -right-1 bg-[${PALETTE.lightAccent}] ${PALETTE.textPrimary} text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm`}>
                          <Stethoscope className="w-3 h-3 inline mr-1" /> {doctor.specialization}
                        </span>
                      )}
                    </div>
                    <h2 className={`text-xl font-bold ${PALETTE.textPrimary} truncate`}>
                      {doctor.username || "N/A"}
                    </h2>
                    <div className={`mt-3 space-y-2 text-sm ${PALETTE.textSecondary} flex-grow`}>
                      {doctor.badgeNumber && (
                        <p className="flex items-center justify-center gap-1.5">
                          <BadgeCheck className={`w-4 h-4 ${PALETTE.secondaryMuted}`} /> Badge: {doctor.badgeNumber}
                        </p>
                      )}
                      {doctor.licenseNumber && (
                        <p className="flex items-center justify-center gap-1.5">
                          <FileText className={`w-4 h-4 ${PALETTE.secondaryMuted}`} /> License: {doctor.licenseNumber}
                        </p>
                      )}
                      <p className="flex items-center justify-center gap-1.5 truncate">
                        <Mail className={`h-4 w-4 ${PALETTE.secondaryMuted}`} />
                        {doctor.email || "N/A"}
                      </p>
                      <p className="flex items-center justify-center gap-1.5">
                        <Phone className={`h-4 w-4 ${PALETTE.secondaryMuted}`} />
                        {doctor.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="flex justify-center mt-6 gap-3 border-t border-gray-200 pt-4">
                      <Button
                        variant="outline" size="sm"
                        className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg} hover:text-[#213448]`}
                        onClick={() => handleEditClick(doctor)}
                        disabled={isSubmitting}
                      > <Pencil className="h-4 w-4 mr-1.5" /> Edit </Button>
                      <Button
                        variant="outline" size="sm"
                        className={`border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500`}
                        onClick={() => handleDelete(doctor._id)}
                        disabled={isSubmitting}
                      > <Trash2 className="h-4 w-4 mr-1.5" /> Delete </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <Pagination />
        </>
      )}

    {/* Sheet for Add/Edit Doctor */}
    <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className={`w-full sm:max-w-lg p-0 ${PALETTE.sheetBackground} flex flex-col`} side="right">
            <SheetHeader className={`p-6 border-b ${PALETTE.borderSubtle}`}>
                <SheetTitle className={`${PALETTE.textPrimary} text-xl font-semibold`}>
                    {editingDoctor ? "Edit Doctor Details" : "Add New Doctor"}
                </SheetTitle>
                <SheetDescription className={`${PALETTE.textSecondary} text-sm`}>
                    {editingDoctor ? "Update the doctor's information." : "Fill in the form to add a new doctor."}
                </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-4 custom-form-scrollbar">
                <div className="text-center mb-4">
                    <label htmlFor="profileImageUpload" className="cursor-pointer group">
                        <div className={`w-32 h-32 mx-auto rounded-full border-2 ${formErrors.profileImage ? 'border-red-500' : PALETTE.borderSubtle} flex items-center justify-center overflow-hidden relative bg-gray-100 hover:bg-gray-200 transition`}>
                            {previewImage ? (
                                <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImagePlus className={`w-12 h-12 ${PALETTE.textSecondary}/70 group-hover:${PALETTE.textSecondary}`} />
                            )}
                        </div>
                        <span className={`mt-2 text-xs ${PALETTE.textSecondary} group-hover:${PALETTE.textPrimary}`}>
                            {previewImage ? "Change photo" : "Upload photo (max 2MB)"}
                        </span>
                    </label>
                    <input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
                    {previewImage && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => {setPreviewImage(null); editingDoctor ? setEditingDoctor({...editingDoctor, profileImage: null}) : setNewDoctor({...newDoctor, profileImage: null})}} className={`mt-1 text-xs ${PALETTE.textSecondary} hover:text-red-600`}>
                            <X className="w-3 h-3 mr-1"/>Remove
                        </Button>
                    )}
                    {formErrors.profileImage && <p className="mt-1 text-xs text-red-600">{formErrors.profileImage}</p>}
                </div>

                <FormInput name="username" label="Username *" placeholder="e.g., Dr. John Doe"
                    value={editingDoctor ? editingDoctor.username : newDoctor.username}
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, username: e.target.value }) : setNewDoctor({ ...newDoctor, username: e.target.value })}
                    error={formErrors.username} />
                <FormInput name="email" label="Email Address *" placeholder="doctor@example.com" type="email"
                    value={editingDoctor ? editingDoctor.email : newDoctor.email}
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, email: e.target.value }) : setNewDoctor({ ...newDoctor, email: e.target.value })}
                    error={formErrors.email} />
                
                <FormInput name="password" label={editingDoctor ? "New Password (optional)" : "Password *"} placeholder="Min. 6 characters" type="password"
                    value={editingDoctor ? editingDoctor.password : newDoctor.password} // For edit, password is for new pass
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, password: e.target.value }) : setNewDoctor({ ...newDoctor, password: e.target.value })}
                    error={formErrors.password} />

                <FormInput name="phoneNumber" label="Phone Number *" placeholder="+1234567890"
                    value={editingDoctor ? editingDoctor.phoneNumber : newDoctor.phoneNumber}
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, phoneNumber: e.target.value }) : setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })}
                    error={formErrors.phoneNumber} />
                
                <FormInput name="specialization" label="Specialization *" error={formErrors.specialization}>
                    <Select
                        value={editingDoctor ? editingDoctor.specialization : newDoctor.specialization}
                        onValueChange={(value) => editingDoctor ? setEditingDoctor({ ...editingDoctor, specialization: value }) : setNewDoctor({ ...newDoctor, specialization: value })}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md shadow-sm ${formErrors.specialization ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}>
                            <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent className={`bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`}>
                            {specializations.map(spec => <SelectItem key={spec} value={spec} className={PALETTE.textPrimary}>{spec}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </FormInput>

                <FormInput name="licenseNumber" label="License Number *" placeholder="e.g., L12345"
                    value={editingDoctor ? editingDoctor.licenseNumber : newDoctor.licenseNumber}
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, licenseNumber: e.target.value }) : setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                    error={formErrors.licenseNumber} />
                <FormInput name="badgeNumber" label="Badge Number *" placeholder="e.g., B9876"
                    value={editingDoctor ? editingDoctor.badgeNumber : newDoctor.badgeNumber}
                    onChange={(e) => editingDoctor ? setEditingDoctor({ ...editingDoctor, badgeNumber: e.target.value }) : setNewDoctor({ ...newDoctor, badgeNumber: e.target.value })}
                    error={formErrors.badgeNumber} />
            </form>
            <SheetFooter className={`p-6 border-t ${PALETTE.borderSubtle} flex flex-col sm:flex-row sm:justify-end gap-3`}>
                <SheetClose asChild>
                    <Button type="button" variant="outline" className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg}`}>Cancel</Button>
                </SheetClose>
                <Button type="submit" onClick={handleFormSubmit} disabled={isSubmitting} className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg}`}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingDoctor ? "Save Changes" : "Add Doctor"}
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
    <style jsx global>{`
        .custom-form-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-form-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-form-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        .custom-form-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
    `}</style>
    </div>
  );
};

export default Doctors;