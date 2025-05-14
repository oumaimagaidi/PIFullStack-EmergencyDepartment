"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" // Keep if you use its variants structurally
import {
  Edit,
  Trash2,
  PlusCircle,
  Droplets,
  Eye,
  Search,
  Users as PledgersIcon, // Changed icon for clarity
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader2, // For loading indicators
  ShieldAlert, // For error display
} from "lucide-react"
import CreateBloodRequestForm from "@/components/blood/CreateBloodRequestForm"
import UpdateBloodRequestForm from "@/components/blood/UpdateBloodRequestForm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

// Palette definition
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  pageBackground: "#F8F9FA", // Very light off-white, similar to ECEFCA/20
  cardBackground: "#FFFFFF",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  textLight: "text-[#ECEFCA]",
  borderSubtle: "border-[#94B4C1]/50",
  borderFocus: "focus:ring-[#547792]",
  buttonPrimaryBg: "bg-[#547792]",
  buttonPrimaryHoverBg: "hover:bg-[#213448]",
  buttonOutlineBorder: "border-[#94B4C1]",
  buttonOutlineText: "text-[#547792]",
  buttonOutlineHoverBg: "hover:bg-[#ECEFCA]/40",
  actionIconDefault: "text-[#547792]",
  actionIconEdit: "text-yellow-600", // Semantic
  actionIconDelete: "text-red-600",   // Semantic
};

const ManageBloodRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")

  const [pledgesMap, setPledgesMap] = useState({})
  const [expandedPledges, setExpandedPledges] = useState({})
  const [updatingPledgeId, setUpdatingPledgeId] = useState(null)

  const statuses = ["All", "Open", "Partially Fulfilled", "Fulfilled", "Closed", "Cancelled"]

  const fetchAllRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = Cookies.get("token")
      const response = await axios.get(`http://localhost:8089/api/blood-requests/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const sortedRequests = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setRequests(sortedRequests)
    } catch (err) {
      console.error("Error fetching all blood requests:", err)
      setError(err.response?.data?.message || "Failed to load blood requests.")
      toast.error(err.response?.data?.message || "Failed to load blood requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRequests()
  }, [])

  useEffect(() => {
    let currentFiltered = requests
    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        (req) =>
          req.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.bloodTypeNeeded?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.hospitalLocation?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (filterStatus !== "All") {
      currentFiltered = currentFiltered.filter((req) => req.status === filterStatus)
    }
    setFilteredRequests(currentFiltered)
  }, [searchTerm, filterStatus, requests])

  const fetchPledgesForRequest = async (requestId) => {
    if (pledgesMap[requestId] && pledgesMap[requestId] !== "loading") return
    setPledgesMap((prev) => ({ ...prev, [requestId]: "loading" }))
    try {
      const token = Cookies.get("token")
      const response = await axios.get(`http://localhost:8089/api/blood-requests/${requestId}/pledges`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPledgesMap((prev) => ({ ...prev, [requestId]: response.data || [] }))
    } catch (error) {
      console.error(`Error fetching pledges for request ${requestId}:`, error)
      setPledgesMap((prev) => ({ ...prev, [requestId]: [] })) // Set to empty array on error
      toast.error(`Could not load pledges for request ${requestId}.`)
    }
  }

  const togglePledgesView = (requestId) => {
    const isCurrentlyExpanded = expandedPledges[requestId]
    setExpandedPledges((prev) => ({ ...prev, [requestId]: !isCurrentlyExpanded }))
    if (!isCurrentlyExpanded && (!pledgesMap[requestId] || pledgesMap[requestId] === "loading")) {
      fetchPledgesForRequest(requestId)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this blood request? This action cannot be undone.")) {
        return;
    }
    try {
        const token = Cookies.get("token");
        await axios.delete(`http://localhost:8089/api/blood-requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Blood request deleted successfully!");
        fetchAllRequests(); // Refresh the list
    } catch (error) {
        console.error("Error deleting blood request:", error);
        toast.error(error.response?.data?.message || "Failed to delete blood request.");
    }
  }
  const handleUpdateRequest = (request) => {
    setSelectedRequest(request)
    setShowUpdateModal(true)
  }

  const getUrgencyBadgeClasses = (urgency) => {
    // These classes directly use Tailwind, no need for PALETTE object for these specific visual badges
    switch (urgency) {
      case "Critical": return "bg-red-600 text-white";
      case "Urgent": return "bg-orange-500 text-white"; // Changed "High" to "Urgent" to match schema
      case "Standard": return "bg-yellow-400 text-gray-800"; // Changed "Medium" to "Standard"
      // Removed "Low" as it's not in the schema, adjust if your schema is different
      default: return "bg-gray-400 text-white";
    }
  }

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "Open": return `bg-sky-500 ${PALETTE.textLight}`;
      case "Partially Fulfilled": return `bg-amber-500 ${PALETTE.textPrimary}`;
      case "Fulfilled": return `bg-green-500 ${PALETTE.textLight}`;
      case "Closed": return `bg-[${PALETTE.primaryDark}] ${PALETTE.textLight}`;
      case "Cancelled": return `bg-slate-500 ${PALETTE.textLight}`;
      default: return "bg-gray-400 text-white";
    }
  }
  
  const getPledgeStatusBadgeStyle = (status) => {
      switch (status) {
          case "Donated": return { bg: `bg-[${PALETTE.lightAccent}]`, text: PALETTE.textPrimary, border: `border-[${PALETTE.subtleMidTone}]` };
          case "Pledged": return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" }; // Or use palette
          case "Cancelled": return { bg: `bg-[${PALETTE.primaryDark}]/80`, text: PALETTE.textLight, border: `border-[${PALETTE.secondaryMuted}]` };
          default: return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
      }
  }


  const handlePledgeStatusUpdate = async (pledgeId, newStatus, requestId) => {
    setUpdatingPledgeId(pledgeId)
    try {
      const token = Cookies.get("token")
      await axios.put(
        `http://localhost:8089/api/blood-requests/pledges/${pledgeId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Pledge status updated successfully!")
      // Refresh pledges for the specific request
      await fetchPledgesForRequest(requestId); // Refetch pledges for the current request
      // Also refresh the main request list as quantityFulfilled might have changed
      fetchAllRequests()
    } catch (error) {
      console.error("Error updating pledge status:", error)
      toast.error(error.response?.data?.message || "Failed to update pledge status.")
    } finally {
      setUpdatingPledgeId(null)
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className={`min-h-screen bg-[${PALETTE.pageBackground}] p-4 md:p-6 flex flex-col items-center justify-center`}>
        <Loader2 className={`h-12 w-12 animate-spin ${PALETTE.textSecondary}`} />
        <p className={`mt-4 text-lg ${PALETTE.textSecondary}`}>Loading Blood Requests...</p>
      </div>
    );
  }
  if (error && requests.length === 0) { // Only show full page error if no data at all
    return (
      <div className={`min-h-screen bg-[${PALETTE.pageBackground}] p-4 md:p-6 flex flex-col items-center justify-center text-center`}>
        <ShieldAlert className={`h-16 w-16 text-red-500 mb-4`} />
        <h2 className={`text-2xl font-semibold ${PALETTE.textPrimary} mb-2`}>Error Loading Data</h2>
        <p className={`${PALETTE.textSecondary} mb-6`}>{error}</p>
        <Button onClick={fetchAllRequests} className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryHoverBg} text-white`}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[${PALETTE.pageBackground}] p-4 md:p-6`}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${PALETTE.textPrimary} flex items-center`}>
              <Droplets className={`mr-2 h-7 w-7 ${PALETTE.textSecondary}`} /> Manage Blood Requests
            </h1>
            <p className={`text-sm ${PALETTE.textSecondary}`}>Oversee and update all blood donation requests.</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className={`w-full sm:w-auto ${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryHoverBg} text-white py-2.5`}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
          </Button>
        </div>

        <div className={`mb-6 p-4 bg-[${PALETTE.cardBackground}] rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center ${PALETTE.borderSubtle} border`}>
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${PALETTE.textSecondary}`} />
            <Input
              type="text"
              placeholder="Search by patient, blood type, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 w-full py-2 px-3 border rounded-md ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary}`}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className={`w-full sm:w-[200px] py-2 px-3 border rounded-md ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary}`}>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className={`bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`}>
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className={`${PALETTE.textPrimary}`}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && requests.length > 0 && (
            <div className="flex justify-center items-center my-4">
                <Loader2 className={`h-5 w-5 animate-spin ${PALETTE.textSecondary} mr-2`} />
                <p className={`${PALETTE.textSecondary}`}>Refreshing data...</p>
            </div>
        )}
        {error && requests.length > 0 && ( // Show inline error if some data is already displayed
            <div className={`my-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm`}>
                {error} <Button variant="link" size="sm" onClick={fetchAllRequests} className="text-red-700 underline">Try refreshing.</Button>
            </div>
        )}


        <Card className={`shadow-lg bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className={`bg-[${PALETTE.primaryDark}]`}>
                  <TableRow>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Patient</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Blood Type</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Qty (Fulfilled/Needed)</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Urgency</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Status</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Requester</TableHead>
                    <TableHead className={`px-4 py-3 text-left text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Date</TableHead>
                    <TableHead className={`px-4 py-3 text-center text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Pledges</TableHead>
                    <TableHead className={`px-4 py-3 text-right text-xs font-medium ${PALETTE.textLight} uppercase tracking-wider`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={`bg-[${PALETTE.cardBackground}] divide-y ${PALETTE.borderSubtle}`}>
                  {filteredRequests.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={9} className={`text-center ${PALETTE.textSecondary} py-10`}>
                        No blood requests match your current filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredRequests.map((req) => (
                    <Collapsible
                      asChild
                      key={req._id}
                      open={expandedPledges[req._id] || false}
                      onOpenChange={() => togglePledgesView(req._id)}
                    >
                      <>
                        <TableRow className={`hover:bg-[${PALETTE.lightAccent}]/30 data-[state=open]:bg-[${PALETTE.subtleMidTone}]/20`}>
                          <TableCell className={`px-4 py-3 whitespace-nowrap ${PALETTE.textPrimary}`}>
                            {req.patientId ? (
                              <Link to={`/blood-requests/${req._id}`} className={`hover:underline ${PALETTE.textSecondary} font-medium`}>
                                {req.patientId.firstName} {req.patientId.lastName}
                              </Link>
                            ) : ( <span className={PALETTE.textSecondary}>N/A</span> )}
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap`}>
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-mono font-semibold rounded-full bg-[${PALETTE.lightAccent}] ${PALETTE.textPrimary}`}>
                              {req.bloodTypeNeeded}
                            </span>
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap ${PALETTE.textPrimary}`}>
                            {req.quantityFulfilled || 0} / {req.quantityNeeded}
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap`}>
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyBadgeClasses(req.urgency)}`}>{req.urgency}</span>
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap`}>
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(req.status)}`}>{req.status}</span>
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap ${PALETTE.textSecondary}`}>
                            {req.requestingStaffId?.username || "N/A"}
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap ${PALETTE.textSecondary}`}>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap text-center`}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`flex items-center justify-center gap-1 text-xs ${PALETTE.textSecondary} hover:${PALETTE.textPrimary} hover:bg-[${PALETTE.lightAccent}]/50 w-full`}
                              >
                                <PledgersIcon className="h-4 w-4" />
                                {Array.isArray(pledgesMap[req._id])
                                  ? pledgesMap[req._id].length
                                  : pledgesMap[req._id] === "loading"
                                    ? <Loader2 className="h-3 w-3 animate-spin"/>
                                    : 0}
                                {expandedPledges[req._id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className={`px-4 py-3 whitespace-nowrap text-right space-x-1`}>
                            <Button asChild variant="ghost" size="icon" className={`hover:bg-[${PALETTE.subtleMidTone}]/20 ${PALETTE.actionIconDefault} w-8 h-8`}>
                              <Link to={`/blood-requests/${req._id}`}> <Eye className="h-4 w-4" /> </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateRequest(req)} className={`hover:bg-yellow-400/20 ${PALETTE.actionIconEdit} w-8 h-8`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRequest(req._id)} className={`hover:bg-red-500/10 ${PALETTE.actionIconDelete} w-8 h-8`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className={`bg-[${PALETTE.lightAccent}]/20`}>
                            <TableCell colSpan={9} className="p-0">
                              {expandedPledges[req._id] && (
                                <div className={`p-4 border-t ${PALETTE.borderSubtle}`}>
                                  <h4 className={`font-semibold text-sm mb-3 ${PALETTE.textPrimary}`}>
                                    Pledges for this Request:
                                  </h4>
                                  {pledgesMap[req._id] === "loading" && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading pledges...
                                    </div>
                                  )}
                                  {Array.isArray(pledgesMap[req._id]) && pledgesMap[req._id].length > 0 ? (
                                    <div className="space-y-3">
                                      {pledgesMap[req._id].map((pledge) => {
                                        const pledgeStatusStyle = getPledgeStatusBadgeStyle(pledge.status);
                                        return (
                                        <div
                                          key={pledge._id}
                                          className={`p-3 bg-[${PALETTE.cardBackground}] rounded-md shadow-sm border ${PALETTE.borderSubtle} text-xs`}
                                        >
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1.5 gap-2">
                                            <span className={`font-medium ${PALETTE.textPrimary}`}>
                                              {pledge.donorName || pledge.donorUserId?.username} ({pledge.donorBloodType}) - {pledge.pledgedQuantity} unit(s)
                                            </span>
                                            <Badge
                                              className={`px-2.5 py-1 text-xs ${pledgeStatusStyle.bg} ${pledgeStatusStyle.text} border ${pledgeStatusStyle.border}`}
                                            >
                                              {pledge.status}
                                            </Badge>
                                          </div>
                                          <p className={`${PALETTE.textSecondary}`}>Phone: {pledge.donorContactPhone || "N/A"}</p>
                                          <p className={`${PALETTE.textSecondary}/80 text-[11px]`}>
                                            Pledged on: {new Date(pledge.createdAt).toLocaleDateString()}
                                          </p>
                                          {pledge.donationNotes && (
                                            <p className={`mt-1 pt-1 border-t ${PALETTE.borderSubtle}/50 italic ${PALETTE.textSecondary}/70 text-[11px]`}>
                                              Note: {pledge.donationNotes}
                                            </p>
                                          )}
                                          {(pledge.status === "Pledged") && ( // Only show update options if status is 'Pledged'
                                            <div className={`mt-2 pt-2 border-t ${PALETTE.borderSubtle}/50 flex flex-wrap gap-2`}>
                                              <Button
                                                size="sm" // Use shadcn Button size
                                                variant="outline"
                                                className={`text-green-600 border-green-300 hover:bg-green-50 h-8 px-2.5 ${PALETTE.textPrimary}`}
                                                onClick={() => handlePledgeStatusUpdate(pledge._id, "Donated", req._id)}
                                                disabled={updatingPledgeId === pledge._id}
                                              >
                                                {updatingPledgeId === pledge._id && pledge.status !== "Cancelled" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin"/> : <CheckCircle className="h-3.5 w-3.5 mr-1" />} Mark Donated
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className={`text-red-600 border-red-300 hover:bg-red-50 h-8 px-2.5 ${PALETTE.textPrimary}`}
                                                onClick={() => handlePledgeStatusUpdate(pledge._id, "Cancelled", req._id)}
                                                disabled={updatingPledgeId === pledge._id}
                                              >
                                                 {updatingPledgeId === pledge._id && pledge.status !== "Donated" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin"/> : <XCircle className="h-3.5 w-3.5 mr-1" />} Mark Cancelled
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )})}
                                    </div>
                                  ) : Array.isArray(pledgesMap[req._id]) ? (
                                    <p className={`text-xs ${PALETTE.textSecondary} py-2`}>No pledges yet for this request.</p>
                                  ) : null}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {showCreateModal && (
          <CreateBloodRequestForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccessfullyCreated={() => {
              fetchAllRequests()
            }}
            // Pass palette to modal if it needs it directly, or it will use its own
          />
        )}
        {showUpdateModal && selectedRequest && (
          <UpdateBloodRequestForm
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            request={selectedRequest}
            onSuccessfullyUpdated={() => {
              fetchAllRequests()
            }}
            // Pass palette to modal if it needs it directly
          />
        )}
      </div>
    </div>
  )
}

export default ManageBloodRequestsPage