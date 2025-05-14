// src/pages/Patients.jsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // For form
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
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
  ChevronLeft,
  ChevronRight,
  Settings2,
  Briefcase, // Not used in this specific file, but kept from original
  Loader2, // For loading states
  ImagePlus, // For image upload in form
  X, // For closing sheet/clearing image
  ShieldAlert, // For error messages
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
import { toast } from "sonner"; // Assuming toast is used for notifications

// --- Consistent Palette (can be moved to a shared file) ---
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  pageGradientStart: "#F0F4F8", // Clean gradient start
  pageGradientEnd: "#E0E8F0",   // Clean gradient end
  cardBackground: "#FFFFFF",
  sheetBackground: "bg-white",
  dialogBackground: "bg-white",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  textLight: "text-[#ECEFCA]",
  borderSubtle: "border-gray-200/90",
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
  // Dark mode specific (if you implement dark mode toggle later)
  dark: {
    pageGradientStart: "dark:from-slate-900",
    pageGradientEnd: "dark:to-slate-800",
    cardBackground: "dark:bg-slate-800",
    sheetBackground: "dark:bg-slate-900",
    dialogBackground: "dark:bg-slate-900",
    textPrimary: "dark:text-slate-100",
    textSecondary: "dark:text-slate-400",
    borderSubtle: "dark:border-slate-700",
    buttonPrimaryBg: "dark:bg-[#547792]", // Can adjust for dark if needed
    buttonPrimaryText: "dark:text-white",
    buttonPrimaryHoverBg: "dark:hover:bg-[#213448]",
    buttonOutlineBorder: "dark:border-slate-600",
    buttonOutlineText: "dark:text-slate-300",
    buttonOutlineHoverBorder: "dark:hover:border-slate-500",
    buttonOutlineHoverBg: "dark:hover:bg-slate-700",
  }
};

// --- Pagination Component (Themed) ---
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
        <div className="flex justify-center items-center space-x-1 mt-10">
            <Button
                variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineHoverBorder} disabled:opacity-50 rounded-md`}
            >
                <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            {startPage > 1 && (<>
                <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className={`${PALETTE.textSecondary} hover:bg-gray-100 ${PALETTE.dark.textSecondary} dark:hover:bg-slate-700 rounded-md`}>1</Button>
                {startPage > 2 && <span className={`px-2 py-1 text-sm ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>...</span>}
            </>)}
            {pageNumbers.map(number => (
                <Button
                    key={number}
                    variant={currentPage === number ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(number)}
                    className={`${currentPage === number
                        ? `${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} ${PALETTE.dark.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryText} ${PALETTE.dark.buttonPrimaryHoverBg} shadow-md`
                        : `${PALETTE.textSecondary} hover:bg-gray-100 ${PALETTE.dark.textSecondary} dark:hover:bg-slate-700`} font-medium rounded-md transition-all duration-200`}
                >
                    {number}
                </Button>
            ))}
            {endPage < totalPages && (<>
                {endPage < totalPages - 1 && <span className={`px-2 py-1 text-sm ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>...</span>}
                <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className={`${PALETTE.textSecondary} hover:bg-gray-100 ${PALETTE.dark.textSecondary} dark:hover:bg-slate-700 rounded-md`}>{totalPages}</Button>
            </>)}
            <Button
                variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineHoverBorder} disabled:opacity-50 rounded-md`}
            >
                Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
};

// Reusable Form Input for the Sheet
const FormInput = ({ name, label, placeholder, value, onChange, error, type = "text", children, required = false, disabled = false }) => (
  <div className="space-y-1">
      <label htmlFor={name} className={`block text-sm font-medium ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>
          {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ? children : (
          <Input
              id={name} name={name} type={type} placeholder={placeholder}
              value={value || ""} onChange={onChange} disabled={disabled}
              className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-md shadow-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);


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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "", email: "", password: "", phoneNumber: "",
    dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null,
  })

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const conditions = ["Stable", "Critical", "Recovering", "Under Observation", "Chronic", "Acute"]

  const fetchPatients = async (isRefresh = false) => { /* ... (unchanged) ... */
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8089/api/users/patients", { withCredentials: true })
      const fetchedPatients = (response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPatients(fetchedPatients);
      // setTotalPages calculation moved to useMemo/useEffect
      if (isRefresh) toast.success("Patient list refreshed!");
    } catch (err) {
      console.error("Error fetching patients:", err);
      const errorMessage = err.response?.data?.message || "Could not retrieve patients.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }

  const refreshData = async () => { /* ... (unchanged) ... */
    setRefreshing(true)
    await fetchPatients(true)
    setTimeout(() => setRefreshing(false), 800)
  }

  useEffect(() => { /* ... (unchanged) ... */
    fetchPatients()
  }, [])

  const validateFields = (data, isUpdate = false) => { /* ... (unchanged) ... */
    const errors = {}
    const { name, email, password, phoneNumber, dateOfBirth, bloodType } = data

    if (!name?.trim()) errors.name = "Name is required"
    if (!email?.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format"
    if (!phoneNumber?.trim()) errors.phoneNumber = "Phone number is required"
    else if (!/^\+?\d{9,15}$/.test(phoneNumber)) errors.phoneNumber = "Invalid phone (9-15 digits, optional +)";
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required"
    if (!bloodType) errors.bloodType = "Blood type is required"
    
    if (!isUpdate && (!password || password.length < 6)) {
        errors.password = "Password must be at least 6 characters"
    } else if (isUpdate && password && password.length > 0 && password.length < 6) {
        errors.password = "New password must be at least 6 characters"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSearchChange = (e) => { // Renamed from handleSearch to avoid conflict
    setSearchQuery(e.target.value);
    // setCurrentPage(1) will be handled by useEffect on filteredPatients
  };

  const handleFormSubmit = async (e) => { // Combined Add/Update
    e.preventDefault();
    const dataToValidate = editingPatient || newPatient;
    const isUpdate = !!editingPatient;
    if (!validateFields(dataToValidate, isUpdate)) return;

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(dataToValidate).forEach(key => {
        if (key !== '_id' && key !== 'profileImage' && key !== 'password' && dataToValidate[key] !== null && dataToValidate[key] !== undefined) {
            formData.append(key, dataToValidate[key]);
        }
    });

    if (!isUpdate) { // For adding new patient
        formData.append("password", dataToValidate.password);
        formData.append("role", "Patient");
    } else if (isUpdate && dataToValidate.password && dataToValidate.password.length >= 6) {
        // If it's an update and a new password is provided and valid
        formData.append("password", dataToValidate.password);
    }


    if (dataToValidate.profileImage instanceof File) {
        formData.append("profileImage", dataToValidate.profileImage);
    }
    
    const apiEndpoint = isUpdate
        ? `http://localhost:8089/api/users/patients/${editingPatient._id}` // Assuming specific patient update route
        : "http://localhost:8089/api/auth/register";
    const method = isUpdate ? "put" : "post";

    try {
        const response = await axios[method](apiEndpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });
        toast.success(`Patient ${isUpdate ? 'updated' : 'added'} successfully!`);
        handleSheetClose();
        fetchPatients(); // Refresh the entire list
    } catch (error) {
        console.error(`Error ${isUpdate ? 'updating' : 'adding'} patient:`, error.response?.data || error.message);
        toast.error(error.response?.data?.message || `Error ${isUpdate ? 'updating' : 'adding'} patient`);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => { /* ... (unchanged) ... */
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) return
    setIsSubmitting(true); // Indicate general submission process
    try {
      await axios.delete(`http://localhost:8089/api/users/patients/${id}`, { withCredentials: true })
      toast.success("Patient deleted successfully!");
      fetchPatients(); // Refresh list
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast.error(error.response?.data?.message || "Error deleting patient")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (e) => { /* ... (unchanged logic, only theming may differ if form elements change) ... */ 
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("Image size should be less than 2MB.");
            return;
        }
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
    setEditingPatient({ ...patient, password: "" }); // Clear password for update form initially
    setPreviewImage(patient.profileImage ? `http://localhost:8089${patient.profileImage.startsWith('/') ? patient.profileImage : `/${patient.profileImage}`}` : null);
    setFormErrors({});
    setIsSheetOpen(true);
  }
  const handleAddNewClick = () => { // Added for Add New button
    setEditingPatient(null);
    setNewPatient({ name: "", email: "", password: "", phoneNumber: "", dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null });
    setFormErrors({});
    setPreviewImage(null);
    setIsSheetOpen(true);
  };
  const handleSheetClose = () => { /* ... (unchanged) ... */ 
    setIsSheetOpen(false);
    setEditingPatient(null);
    setNewPatient({ name: "", email: "", password: "", phoneNumber: "", dateOfBirth: "", bloodType: "", condition: "", age: "", profileImage: null });
    setPreviewImage(null);
    setFormErrors({});
  }

  const filteredPatients = useMemo(() =>  /* ... (unchanged) ... */
    patients.filter((patient) => 
      (patient.name || patient.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.bloodType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.condition || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [patients, searchQuery]
  );

  const paginatedPatients = useMemo(() => /* ... (unchanged) ... */
    filteredPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage),
    [filteredPatients, currentPage, patientsPerPage]
  );

  useEffect(() => { /* ... (unchanged) ... */
    const newTotalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    setTotalPages(newTotalPages);
    if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && filteredPatients.length > 0 && searchQuery) { // If filter results in 0 pages but there are items & search is active
        setCurrentPage(1); // Should show no results instead of resetting page
    } else if (newTotalPages > 0 && currentPage === 0) { // If somehow current page is 0
        setCurrentPage(1);
    }
  }, [filteredPatients.length, currentPage, patientsPerPage, searchQuery]);


  const PatientForm = ({ isEditing }) => {
    const currentData = isEditing ? editingPatient : newPatient;
    const setCurrentData = isEditing ? setEditingPatient : setNewPatient;

    return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="text-center mb-4">
            <label htmlFor="profileImageUploadPatient" className="cursor-pointer group block">
                <div className={`w-28 h-28 mx-auto rounded-full border-2 ${formErrors.profileImage ? 'border-red-500' : PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} flex items-center justify-center overflow-hidden relative bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition`}>
                    {previewImage ? (
                        <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlus className={`w-10 h-10 ${PALETTE.textSecondary}/70 ${PALETTE.dark.textSecondary} group-hover:${PALETTE.textSecondary} dark:group-hover:text-slate-300`} />
                    )}
                </div>
                <span className={`mt-2 text-xs ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} group-hover:${PALETTE.textPrimary} dark:group-hover:text-slate-200`}>
                    {previewImage ? "Change photo" : "Upload photo (max 2MB)"}
                </span>
            </label>
            <input type="file" id="profileImageUploadPatient" accept="image/*" onChange={handleImageChange} className="hidden" />
            {previewImage && (
                <Button type="button" variant="ghost" size="sm" onClick={() => {setPreviewImage(null); setCurrentData({...currentData, profileImage: null})}} className={`mt-1 text-xs ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} hover:text-red-600 dark:hover:text-red-400`}>
                    <X className="w-3 h-3 mr-1"/>Remove
                </Button>
            )}
            {formErrors.profileImage && <p className="mt-1 text-xs text-red-600">{formErrors.profileImage}</p>}
        </div>

      <FormInput name="name" label="Full Name" placeholder="e.g., Jane Doe" required
          value={currentData.name} onChange={(e) => setCurrentData({ ...currentData, name: e.target.value })}
          error={formErrors.name} disabled={isSubmitting} />
      <FormInput name="email" label="Email Address" placeholder="patient@example.com" type="email" required
          value={currentData.email} onChange={(e) => setCurrentData({ ...currentData, email: e.target.value })}
          error={formErrors.email} disabled={isSubmitting} />
      
      {!isEditing ? (
          <FormInput name="password" label="Password" placeholder="Min. 6 characters" type="password" required
              value={currentData.password} onChange={(e) => setCurrentData({ ...currentData, password: e.target.value })}
              error={formErrors.password} disabled={isSubmitting} />
      ) : (
          <FormInput name="password" label="New Password (optional)" placeholder="Leave blank to keep current" type="password"
              value={currentData.password || ""} onChange={(e) => setCurrentData({ ...currentData, password: e.target.value })}
              error={formErrors.password} disabled={isSubmitting} />
      )}

      <FormInput name="phoneNumber" label="Phone Number" placeholder="+1234567890" required
          value={currentData.phoneNumber} onChange={(e) => setCurrentData({ ...currentData, phoneNumber: e.target.value })}
          error={formErrors.phoneNumber} disabled={isSubmitting} />
      <FormInput name="dateOfBirth" label="Date of Birth" type="date" required
          value={currentData.dateOfBirth} onChange={(e) => setCurrentData({ ...currentData, dateOfBirth: e.target.value })}
          error={formErrors.dateOfBirth} disabled={isSubmitting} />
      <FormInput name="age" label="Age" type="number" placeholder="e.g., 30"
          value={currentData.age} onChange={(e) => setCurrentData({ ...currentData, age: e.target.value })}
          error={formErrors.age} disabled={isSubmitting} />

      <FormInput name="bloodType" label="Blood Type" required error={formErrors.bloodType} disabled={isSubmitting}>
          <Select value={currentData.bloodType} onValueChange={(value) => setCurrentData({ ...currentData, bloodType: value })}>
              <SelectTrigger className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-md shadow-sm ${formErrors.bloodType ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent className={`${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  {bloodTypes.map((type) => <SelectItem key={type} value={type} className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>{type}</SelectItem>)}
              </SelectContent>
          </Select>
      </FormInput>
      <FormInput name="condition" label="Medical Condition (optional)" error={formErrors.condition} disabled={isSubmitting}>
          <Select value={currentData.condition} onValueChange={(value) => setCurrentData({ ...currentData, condition: value })}>
              <SelectTrigger className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-md shadow-sm ${formErrors.condition ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select medical condition" />
              </SelectTrigger>
              <SelectContent className={`${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  {conditions.map((c) => <SelectItem key={c} value={c} className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>{c}</SelectItem>)}
              </SelectContent>
          </Select>
      </FormInput>

      {/* Submit and Cancel buttons are in SheetFooter */}
    </form>
  )};

  const getConditionColor = (condition) => { /* ... (unchanged) ... */
    // This function returns Tailwind classes, so it's fine as is.
    // Ensure the text colors provide good contrast with the background colors.
    // Example: if bg is light, text should be dark.
    switch (condition?.toLowerCase()) {
      case "critical": return `bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300 border-red-300 dark:border-red-600`;
      case "stable": return `bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border-green-300 dark:border-green-600`;
      case "recovering": return `bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600`;
      case "under observation": return `bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300 border-amber-300 dark:border-amber-600`;
      case "chronic": return `bg-purple-100 text-purple-700 dark:bg-purple-700/30 dark:text-purple-300 border-purple-300 dark:border-purple-600`;
      case "acute": return `bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300 border-orange-300 dark:border-orange-600`;
      case "bloodtype": return `bg-[${PALETTE.lightAccent}] ${PALETTE.textPrimary} border-[${PALETTE.subtleMidTone}]`; // Custom for blood type
      default: return `bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600`;
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] ${PALETTE.dark.pageGradientStart} ${PALETTE.dark.pageGradientEnd} p-4 sm:p-6 lg:p-8`}>
      <header className="mb-8 md:mb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6 md:mb-10">
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>
            Patient Management
          </h1>
          <p className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} text-lg max-w-2xl mx-auto`}>
            Comprehensive system to track and manage patient information efficiently.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} 
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 md:p-6 ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} rounded-xl shadow-lg border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
          <Card className={`bg-transparent shadow-none border-none`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>Total Patients</p>
                  <h3 className={`text-3xl font-bold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} mt-1`}>{patients.length}</h3>
                </div>
                <div className={`p-3 rounded-full bg-[${PALETTE.secondaryMuted}]/10 dark:bg-[${PALETTE.secondaryMuted}]/20`}>
                  <Users className={`h-6 w-6 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`bg-transparent shadow-none border-none`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>System Status</p>
                  <h3 className={`text-lg font-bold text-green-600 dark:text-green-400 mt-1`}>Operational</h3>
                </div>
                 <Button
                    variant="ghost" size="icon" onClick={refreshData} disabled={refreshing}
                    className={`p-3 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 dark:hover:bg-green-500/30`}
                    aria-label="Refresh patient list"
                  >
                    <RefreshCw className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </header>

      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-4 ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} rounded-xl shadow-md border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`} />
          <Input
            placeholder="Search patients by name, email, blood type..."
            className={`w-full pl-10 py-2.5 ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-lg shadow-sm bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={loading}
            aria-label="Search patients"
          />
        </div>
        <Button 
            onClick={handleAddNewClick}
            className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} ${PALETTE.dark.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryText} ${PALETTE.dark.buttonPrimaryHoverBg} py-2.5 rounded-lg shadow-md flex items-center gap-2`}
        >
            <UserPlus className="h-5 w-5" /> Add New Patient
        </Button>
      </div>

      {loading && patients.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-3">
          <Loader2 className={`w-10 h-10 animate-spin ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
          <span className={`${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary} text-lg font-medium`}>Loading patients...</span>
        </div>
      ) : error && patients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-300 dark:border-red-700`}>
          <ShieldAlert className="h-12 w-12 mx-auto text-red-500 dark:text-red-400 mb-3" />
          <p className={`text-red-600 dark:text-red-400 text-xl font-medium mb-2`}>Error Loading Patients</p>
          <p className={`text-red-500 dark:text-red-500 text-sm mb-4`}>{error}</p>
          <Button onClick={() => fetchPatients()} className="bg-red-600 text-white hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </motion.div>
      ) : paginatedPatients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className={`text-center ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} p-12 rounded-xl border border-dashed ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} shadow`}>
           <Users className={`h-16 w-16 mx-auto ${PALETTE.textSecondary}/70 ${PALETTE.dark.textSecondary}/70 mb-4`} />
          <p className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} text-xl font-medium mb-2`} role="alert">
            {searchQuery ? "No patients found matching your search." : "No patients available."}
          </p>
          {searchQuery && (
            <Button onClick={() => { setSearchQuery(""); /* fetchPatients(); implicitly handled */ }} 
            variant="outline"
            className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineHoverBorder} ${PALETTE.dark.buttonOutlineHoverBg} rounded-lg`}>
              Clear Search
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {paginatedPatients.map((patient, index) => (
              <motion.div key={patient._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="h-full">
                <Card className={`${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} shadow-lg hover:shadow-xl rounded-xl border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`h-2 ${getConditionColor(patient.condition).split(' ')[0].replace('bg-', 'bg-') /* Keep full bg class for top border */}`}></div>
                  <CardContent className="p-5 sm:p-6 flex-grow text-center">
                    <div className="relative group mb-4">
                      <img
                        src={patient.profileImage ? `http://localhost:8089${patient.profileImage.startsWith("/") ? patient.profileImage : "/" + patient.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || patient.username || "P")}&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=128`}
                        alt={patient.name || patient.username}
                        className={`w-28 h-28 sm:w-32 sm:h-32 mx-auto object-cover rounded-full border-4 border-[${PALETTE.lightAccent}] dark:border-[${PALETTE.subtleMidTone}] shadow-md group-hover:scale-105 transition-transform duration-300`}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=Patient&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=128`; }}
                      />
                      {patient.bloodType && (
                        <motion.span initial={{ scale:0, opacity: 0 }} animate={{ scale:1, opacity: 1 }} transition={{ delay: 0.2, type:'spring', stiffness:200 }} className={`absolute top-1 left-1 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border ${getConditionColor("bloodtype")}`}>
                          <Heart className="w-3 h-3 inline mr-0.5" /> {patient.bloodType}
                        </motion.span>
                      )}
                       {patient.condition && (
                        <motion.span initial={{ scale:0, opacity: 0 }} animate={{ scale:1, opacity: 1 }} transition={{ delay: 0.3, type:'spring', stiffness:200 }} className={`absolute top-1 right-1 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border ${getConditionColor(patient.condition)}`}>
                          <Activity className="w-3 h-3 inline mr-0.5" /> {patient.condition}
                        </motion.span>
                      )}
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} mt-3 truncate`} title={patient.name || patient.username}>
                      {patient.name || patient.username || "N/A"}
                    </h2>
                     <div className={`mt-3 space-y-1.5 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} text-sm`}>
                        {patient.age && (
                            <p className="flex items-center justify-center gap-1.5">
                            <Calendar className={`w-3.5 h-3.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} /> Age: {patient.age}
                            </p>
                        )}
                        <p className="flex items-center justify-center gap-1.5 truncate">
                            <Mail className={`h-3.5 w-3.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
                            {patient.email || "N/A"}
                        </p>
                        <p className="flex items-center justify-center gap-1.5">
                            <Phone className={`h-3.5 w-3.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
                            {patient.phoneNumber || "N/A"}
                        </p>
                    </div>
                  </CardContent>
                   <CardFooter className={`p-4 sm:p-5 bg-gray-50 ${PALETTE.dark.cardBackground}/50 border-t ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} mt-auto`}>
                    <div className="flex justify-center w-full gap-2">
                        <Button variant="outline" size="sm" className={`flex-1 text-xs sm:text-sm ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineHoverBorder}`} onClick={() => handleEditClick(patient)} disabled={isSubmitting}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                        <Button variant="outline" size="sm" className={`flex-1 text-xs sm:text-sm text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-700/30`} onClick={() => handleDelete(patient._id)} disabled={isSubmitting}><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                        <Button variant="outline" size="sm" className={`flex-1 text-xs sm:text-sm ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineHoverBorder}`} onClick={() => { setSelectedPatient(patient); setIsDetailsOpen(true); }} disabled={loading}><ClipboardList className="h-3.5 w-3.5 mr-1" /> Details</Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      <AnimatePresence>
        {isDetailsOpen && selectedPatient && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className={`sm:max-w-md rounded-xl shadow-2xl border ${PALETTE.dialogBackground} ${PALETTE.dark.dialogBackground} ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
                <DialogHeader className={`p-6 border-b ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  <DialogTitle className={`text-2xl font-bold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>Patient Details</DialogTitle>
                  <DialogDescription className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>
                    Information about {selectedPatient.name || selectedPatient.username}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedPatient.profileImage ? `http://localhost:8089${selectedPatient.profileImage.startsWith("/") ? selectedPatient.profileImage : "/" + selectedPatient.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPatient.name || selectedPatient.username || "P")}&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=112`}
                      alt={selectedPatient.name || selectedPatient.username}
                      className={`w-28 h-28 rounded-full object-cover border-4 border-[${PALETTE.lightAccent}] dark:border-[${PALETTE.subtleMidTone}] shadow-lg`}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=Patient&background=ECEFCA&color=213448&font-size=0.5&bold=true&size=112`; }}
                    />
                  </div>
                  {[
                    { icon: User, label: "Name", value: selectedPatient.name || selectedPatient.username },
                    { icon: Mail, label: "Email", value: selectedPatient.email },
                    { icon: Phone, label: "Phone", value: selectedPatient.phoneNumber },
                    { icon: Calendar, label: "Date of Birth", value: selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
                    { icon: Heart, label: "Blood Type", value: selectedPatient.bloodType },
                    { icon: Activity, label: "Condition", value: selectedPatient.condition },
                    { icon: FileText, label: "Age", value: selectedPatient.age ? `${selectedPatient.age} years` : null },
                  ].map((item, idx) => item.value ? (
                    <p key={idx} className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} text-sm flex items-start`}>
                        <item.icon className={`inline w-4 h-4 mr-2 mt-0.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary}`} />
                        <strong className={`font-medium w-28 shrink-0 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>{item.label}:</strong>
                        <span>{item.value}</span>
                    </p>
                  ) : null)}
                </div>
                <DialogFooter className={`p-6 border-t ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  <DialogClose asChild>
                    <Button className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} ${PALETTE.dark.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryText} ${PALETTE.dark.buttonPrimaryHoverBg} w-full rounded-md`}>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; } /* For dark mode */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
      `}</style>
    </div>
  )
}

export default Patients