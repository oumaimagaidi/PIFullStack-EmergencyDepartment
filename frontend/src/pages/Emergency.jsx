// src/pages/Emergency.jsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Ambulance, Phone, X, Search, Filter, Users, Loader2, ShieldAlert, Calendar, Activity, UserCheck } from "lucide-react" // Added more icons
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Added for context
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"; // Assuming toast is available for notifications

// --- Consistent Palette ---
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  pageGradientStart: "#FEE2E2", // Reddish gradient start for emergency theme
  pageGradientEnd: "#FEF2F2",   // Lighter reddish gradient end
  cardBackground: "#FFFFFF",
  dialogBackground: "bg-white",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  textLight: "text-[#ECEFCA]",
  borderSubtle: "border-gray-200/90",
  borderFocus: "focus:ring-red-500 focus:border-red-500", // Emergency theme focus
  buttonPrimaryBg: "bg-red-600", // Emergency theme primary button
  buttonPrimaryText: "text-white",
  buttonPrimaryHoverBg: "hover:bg-red-700",
  buttonOutlineBorder: "border-red-400", // Emergency theme outline
  buttonOutlineText: "text-red-600",
  buttonOutlineHoverBorder: "hover:border-red-500",
  buttonOutlineHoverBg: "hover:bg-red-50",
  // Dark mode stubs
  dark: {
    pageGradientStart: "dark:from-red-900/50",
    pageGradientEnd: "dark:to-red-900/20",
    cardBackground: "dark:bg-slate-800",
    dialogBackground: "dark:bg-slate-900",
    textPrimary: "dark:text-slate-100",
    textSecondary: "dark:text-slate-400",
    borderSubtle: "dark:border-slate-700",
    buttonPrimaryBg: "dark:bg-red-500",
    buttonPrimaryText: "dark:text-white",
    buttonPrimaryHoverBg: "dark:hover:bg-red-600",
    buttonOutlineBorder: "dark:border-red-500",
    buttonOutlineText: "dark:text-red-300",
    buttonOutlineHoverBorder: "dark:hover:border-red-400",
    buttonOutlineHoverBg: "dark:hover:bg-red-700/30",
  }
};

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [emergencyCases, setEmergencyCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false); // For delete action

  const statusColors = { // These will be used for badge background and text color
    critical: { bg: "bg-red-600", text: "text-white", border: "border-red-700" },
    high: { bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
    medium: { bg: "bg-yellow-400", text: "text-yellow-800", border: "border-yellow-500" }, // Ensure contrast
    low: { bg: "bg-green-500", text: "text-white", border: "border-green-600" },
    default: { bg: "bg-gray-400", text: "text-white", border: "border-gray-500" }
  };

  useEffect(() => { /* ... (unchanged) ... */
    const fetchEmergencyCases = async () => {
      try {
        setLoading(true); // Set loading true at the start
        setError(null);   // Clear previous errors
        const response = await axios.get("http://localhost:8089/api/emergency-patients", {
          withCredentials: true
        })
        // Sort by creation date, newest first
        const sortedCases = (response.data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEmergencyCases(sortedCases);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Error loading emergency cases.";
        setError(errorMsg);
        toast.error(errorMsg); // Notify user
      } finally {
        setLoading(false)
      }
    }
    fetchEmergencyCases()
  }, [])

  const handleDelete = async (id) => { /* ... (unchanged) ... */
    if (window.confirm("Confirm deletion of this emergency case?")) {
      setIsSubmitting(true);
      try {
        await axios.delete(`http://localhost:8089/api/emergency-patients/${id}`, {
          withCredentials: true
        })
        setEmergencyCases(prev => prev.filter(caseItem => caseItem._id !== id));
        toast.success("Emergency case deleted successfully.");
      } catch (err) {
        console.error("Deletion error:", err);
        toast.error(err.response?.data?.message || "Error deleting emergency case.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const filteredCases = emergencyCases.filter(caseItem =>
    `${caseItem.firstName || ''} ${caseItem.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (caseItem.emergencyLevel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (caseItem.currentSymptoms || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to get themed status badge classes
  const getStatusBadgeClasses = (level) => {
    const statusKey = level?.toLowerCase();
    return statusColors[statusKey] || statusColors.default;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[${PALETTE.pageGradientStart}] to-[${PALETTE.pageGradientEnd}] ${PALETTE.dark.pageGradientStart} ${PALETTE.dark.pageGradientEnd} p-6 md:p-8`}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10">
        <div>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>Emergency Case Management</h1>
            <p className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} mt-1 text-sm md:text-base`}>Track and manage all active emergency situations.</p>
        </div>
         {/* Optional: Add a primary action button here if needed, e.g., "Report New Emergency" */}
      </header>

      <div className={`flex gap-4 mb-8 p-4 bg-[${PALETTE.cardBackground}] ${PALETTE.dark.cardBackground} rounded-xl shadow-md border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`} />
          <Input
            placeholder="Search cases by patient name, level, symptoms..."
            className={`w-full pl-10 py-2.5 ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} ${PALETTE.dark.borderSubtle} ${PALETTE.dark.textPrimary} rounded-lg shadow-sm bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        {/* <Button variant="outline" className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ...`}>
            <Filter className="h-4 w-4 mr-2" /> Filter
        </Button> */}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <Loader2 className={`w-12 h-12 animate-spin ${PALETTE.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryBg}`} />
          <p className={`mt-4 text-lg font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary}`}>Loading Emergency Cases...</p>
        </div>
      ) : error ? (
        <div className={`text-center p-8 rounded-xl border bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 shadow-lg`}>
            <ShieldAlert className={`w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400`} />
            <p className={`text-xl font-semibold text-red-700 dark:text-red-300 mb-2`}>{error}</p>
            <p className={`text-sm text-red-600 dark:text-red-400 mb-6`}>There was an issue fetching the data. Please try again.</p>
            <Button
                onClick={() => window.location.reload()}
                className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} ${PALETTE.dark.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryText} ${PALETTE.dark.buttonPrimaryHoverBg} rounded-lg px-6 py-2.5`}
            >
                <RefreshCw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className={`text-center p-12 rounded-xl border-2 border-dashed ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} shadow-inner`}>
            <Ambulance className={`w-20 h-20 mx-auto mb-6 ${PALETTE.textSecondary}/30 ${PALETTE.dark.textSecondary}/30`} />
            <p className={`text-xl font-medium ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} mb-2`}>No Emergency Cases Found</p>
            <p className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} text-sm`}>
                {searchQuery ? "No cases match your search criteria." : "There are currently no active emergency cases."}
            </p>
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => {
            const statusStyle = getStatusBadgeClasses(caseItem.emergencyLevel);
            return (
            <Card
              key={caseItem._id}
              className={`relative ${PALETTE.cardBackground} ${PALETTE.dark.cardBackground} shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border-l-4 ${statusStyle.border} border ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}
            >
              <CardContent className="p-5 sm:p-6 text-center flex flex-col h-full">
                <div className="relative group mb-4">
                  <div className={`absolute -inset-2 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${statusStyle.bg}/30`}></div>
                  <div className={`w-28 h-28 mx-auto rounded-full border-4 border-[${PALETTE.lightAccent}] dark:border-[${PALETTE.subtleMidTone}] flex items-center justify-center shadow-md ${statusStyle.bg}/20`}>
                    <AlertCircle className={`w-16 h-16 ${statusStyle.text}`} />
                  </div>
                </div>
                
                <h2 className={`text-xl sm:text-2xl font-bold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary} mt-4 truncate`} title={`${caseItem.firstName} ${caseItem.lastName}`}>
                  {caseItem.firstName} {caseItem.lastName}
                </h2>
                
                <div className="mt-3 mb-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {caseItem.emergencyLevel?.toUpperCase() || "UNCLASSIFIED"}
                  </span>
                </div>

                <div className={`mt-auto pt-4 border-t ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} flex justify-center gap-2`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineText} ${PALETTE.dark.buttonOutlineBorder} ${PALETTE.dark.buttonOutlineHoverBg} ${PALETTE.dark.buttonOutlineHoverBorder} rounded-md flex-1 text-xs sm:text-sm`}
                    onClick={() => {
                      setSelectedCase(caseItem)
                      setIsDetailsOpen(true)
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-700/30 rounded-md flex-1 text-xs sm:text-sm`}
                    onClick={() => handleDelete(caseItem._id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <X className="h-4 w-4 mr-1" />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}

      <AnimatePresence>
        {isDetailsOpen && selectedCase && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className={`sm:max-w-lg rounded-xl shadow-2xl border ${PALETTE.dialogBackground} ${PALETTE.dark.dialogBackground} ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className={`p-6 border-b ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  <DialogTitle className={`text-xl md:text-2xl font-bold ${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>
                    Emergency Case Details
                  </DialogTitle>
                  <DialogDescription className={`${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} text-sm`}>
                    Detailed information for the selected emergency case.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 p-6 max-h-[60vh] overflow-y-auto custom-scrollbar-dialog">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClasses(selectedCase.emergencyLevel).bg} ${getStatusBadgeClasses(selectedCase.emergencyLevel).text}`}>
                      {selectedCase.emergencyLevel?.toUpperCase() || "UNCLASSIFIED"}
                    </span>
                  </div>

                  {[
                    { icon: Calendar, label: "Reported At", value: new Date(selectedCase.createdAt).toLocaleString() },
                    { icon: Users, label: "Patient", value: `${selectedCase.firstName} ${selectedCase.lastName}` },
                    { icon: Activity, label: "Symptoms", value: selectedCase.currentSymptoms || "Not specified" }, // Corrected property name
                    { icon: UserCheck, label: "Assigned Doctor", value: selectedCase.assignedDoctor?.username || "None" }, // Assuming doctor object has username
                    { icon: Phone, label: "Contact", value: selectedCase.contactInfo?.phone || selectedCase.phoneNumber || "N/A" }, // Allow for different phone property names
                  ].map((item, idx) => item.value ? (
                    <div key={idx} className={`py-2 flex items-start text-sm border-b ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle} last:border-b-0`}>
                        <item.icon className={`h-4 w-4 mr-3 mt-0.5 ${PALETTE.secondaryMuted} ${PALETTE.dark.textSecondary} shrink-0`} />
                        <span className={`font-medium ${PALETTE.textSecondary} ${PALETTE.dark.textSecondary} w-32 shrink-0`}>{item.label}:</span>
                        <span className={`${PALETTE.textPrimary} ${PALETTE.dark.textPrimary}`}>{item.value}</span>
                    </div>
                  ) : null)}
                </div>

                <DialogFooter className={`p-6 border-t ${PALETTE.borderSubtle} ${PALETTE.dark.borderSubtle}`}>
                  <DialogClose asChild>
                    <Button className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg} ${PALETTE.dark.buttonPrimaryBg} ${PALETTE.dark.buttonPrimaryText} ${PALETTE.dark.buttonPrimaryHoverBg} w-full rounded-md`}>
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .custom-scrollbar-dialog::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dialog::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dialog::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        .custom-scrollbar-dialog::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        .dark .custom-scrollbar-dialog::-webkit-scrollbar-thumb { background: #4B5563; }
        .dark .custom-scrollbar-dialog::-webkit-scrollbar-thumb:hover { background: #6B7280; }
      `}</style>
    </div>
  )
}

export default Emergency