"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card" // Removed unused Card sub-components
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  PlusCircle,
  Droplets,
  Eye,
  Search,
  ClubIcon as PledgersIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react"
import CreateBloodRequestForm from "@/components/blood/CreateBloodRequestForm"
import UpdateBloodRequestForm from "@/components/blood/UpdateBloodRequestForm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

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
  const [updatingPledgeId, setUpdatingPledgeId] = useState(null) // For loading state on individual pledge update

  const statuses = ["All", "Open", "Partially Fulfilled", "Fulfilled", "Closed", "Cancelled"]

  const fetchAllRequests = async () => {
    // ... (same)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRequests()
  }, [])

  useEffect(() => {
    // ... (filtering logic same)
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
    // ... (same)
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
      setPledgesMap((prev) => ({ ...prev, [requestId]: [] }))
      toast.error(`Could not load pledges for request ${requestId}.`)
    }
  }

  const togglePledgesView = (requestId) => {
    // ... (same)
    const isCurrentlyExpanded = expandedPledges[requestId]
    setExpandedPledges((prev) => ({ ...prev, [requestId]: !isCurrentlyExpanded }))
    if (!isCurrentlyExpanded && (!pledgesMap[requestId] || pledgesMap[requestId] === "loading")) {
      fetchPledgesForRequest(requestId)
    }
  }

  const handleDeleteRequest = async (requestId) => {
    /* ... (same) ... */
  }
  const handleUpdateRequest = (request) => {
    /* ... (same) ... */
  }

  // Updated color scheme for urgency badges
  const getUrgencyBadgeClasses = (urgency) => {
    switch (urgency) {
      case "Critical":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#213448] text-[#ECEFCA]"
      case "High":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#547792] text-white"
      case "Medium":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#94B4C1] text-[#213448]"
      case "Low":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#ECEFCA] text-[#213448]"
      default:
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
    }
  }

  // Updated color scheme for status badges
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "Open":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#94B4C1] text-[#213448]"
      case "Partially Fulfilled":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#DDA853] text-[#213448]"
      case "Fulfilled":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#ECEFCA] text-[#213448]"
      case "Closed":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#213448] text-[#ECEFCA]"
      case "Cancelled":
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#547792] text-white"
      default:
        return "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
    }
  }

  // --- NEW: Handle Pledge Status Update ---
  const handlePledgeStatusUpdate = async (pledgeId, newStatus, requestId) => {
    setUpdatingPledgeId(pledgeId)
    try {
      const token = Cookies.get("token")
      const response = await axios.put(
        `http://localhost:8089/api/blood-requests/pledges/${pledgeId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast.success("Pledge status updated!")
      // Update the specific pledge in the pledgesMap
      setPledgesMap((prevMap) => ({
        ...prevMap,
        [requestId]: prevMap[requestId].map((p) => (p._id === pledgeId ? response.data.pledge : p)),
      }))
      // Refresh the main blood request list to reflect changes in quantityFulfilled and status
      fetchAllRequests()
    } catch (error) {
      console.error("Error updating pledge status:", error)
      toast.error(error.response?.data?.message || "Failed to update pledge status.")
    } finally {
      setUpdatingPledgeId(null)
    }
  }
  // --- END: Handle Pledge Status Update ---

  if (loading && requests.length === 0) {
    /* ... (loading skeleton same) ... */
  }
  if (error) {
    /* ... (error display same) ... */
  }

  return (
    <div className="min-h-screen bg-[#ECEFCA]/20 p-4 md:p-6">
      <div className="container mx-auto">
        {/* ... (Header and Filters UI same) ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#213448] flex items-center">
              <Droplets className="mr-2 h-7 w-7 text-[#547792]" /> Manage Blood Requests
            </h1>
            <p className="text-sm text-[#547792]">Oversee and update all blood donation requests.</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-[#547792] hover:bg-[#213448] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#547792]" />
            <Input
              type="text"
              placeholder="Search by patient, blood type, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#547792]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#547792]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && requests.length > 0 && <p className="text-center text-[#547792] my-4">Refreshing data...</p>}

        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                {/* ... (TableHeader same) ... */}
                <TableHeader className="bg-[#213448]">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Patient
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Blood Type
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Quantity (Donated/Needed)
                    </TableHead>{" "}
                    {/* Changed */}
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Urgency
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Requested By
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Date
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Pledges
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-[#ECEFCA] uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white divide-y divide-[#94B4C1]/30">
                  {filteredRequests.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-[#547792] py-10">
                        No blood requests found.
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
                        <TableRow className="hover:bg-[#ECEFCA]/20 data-[state=open]:bg-[#94B4C1]/10">
                          {/* ... (Patient, Blood Type, Quantity, Urgency, Status, Requested By, Date cells same) ... */}
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {req.patientId ? (
                              <Link to={`/blood-requests/${req._id}`} className="hover:underline text-[#547792]">
                                {req.patientId.firstName} {req.patientId.lastName}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-mono font-semibold rounded-full bg-[#ECEFCA] text-[#213448]">
                              {req.bloodTypeNeeded}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {req.quantityFulfilled} / {req.quantityNeeded}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <span className={getUrgencyBadgeClasses(req.urgency)}>{req.urgency}</span>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadgeClasses(req.status)}>{req.status}</span>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {req.requestingStaffId?.username || "N/A"}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            {" "}
                            {/* Pledges Trigger */}
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 text-xs text-[#547792] hover:text-[#213448] hover:bg-[#ECEFCA]/50"
                              >
                                <PledgersIcon className="h-3.5 w-3.5" />
                                {Array.isArray(pledgesMap[req._id])
                                  ? pledgesMap[req._id].length
                                  : pledgesMap[req._id] === "loading"
                                    ? "..."
                                    : 0}
                                {expandedPledges[req._id] ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                            {" "}
                            {/* Actions */}
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="hover:bg-[#94B4C1]/20 text-[#547792] w-8 h-8"
                            >
                              <Link to={`/blood-requests/${req._id}`}>
                                {" "}
                                <Eye className="h-4 w-4" />{" "}
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateRequest(req)}
                              className="hover:bg-[#DDA853]/20 text-[#DDA853] w-8 h-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRequest(req._id)}
                              className="hover:bg-[#213448]/10 text-[#213448] w-8 h-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              {expandedPledges[req._id] && (
                                <div className="p-4 bg-[#ECEFCA]/20 border-t border-[#94B4C1]/30">
                                  {" "}
                                  {/* Changed bg for better contrast */}
                                  <h4 className="font-semibold text-sm mb-3 text-[#213448]">
                                    Pledges for this Request:
                                  </h4>
                                  {pledgesMap[req._id] === "loading" && (
                                    <p className="text-xs text-[#547792]">Loading pledges...</p>
                                  )}
                                  {Array.isArray(pledgesMap[req._id]) && pledgesMap[req._id].length > 0 ? (
                                    <div className="space-y-2">
                                      {pledgesMap[req._id].map((pledge) => (
                                        <div
                                          key={pledge._id}
                                          className="p-3 bg-white rounded-md shadow-sm border border-[#94B4C1]/30 text-xs"
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-[#213448]">
                                              {pledge.donorName || pledge.donorUserId?.username} (
                                              {pledge.donorBloodType}) - {pledge.pledgedQuantity} unit(s)
                                            </span>
                                            <Badge
                                              variant={
                                                pledge.status === "Donated"
                                                  ? "success"
                                                  : pledge.status === "Cancelled"
                                                    ? "destructive"
                                                    : "outline"
                                              }
                                              className={
                                                pledge.status === "Donated"
                                                  ? "bg-[#ECEFCA] text-[#213448] hover:bg-[#ECEFCA]/80"
                                                  : pledge.status === "Cancelled"
                                                    ? "bg-[#213448] text-[#ECEFCA] hover:bg-[#213448]/80"
                                                    : "border-[#94B4C1] text-[#547792]"
                                              }
                                              size="sm"
                                            >
                                              {pledge.status}
                                            </Badge>
                                          </div>
                                          <p className="text-[#547792]">Phone: {pledge.donorContactPhone}</p>
                                          <p className="text-[#547792]/80 text-[11px]">
                                            Pledged on: {new Date(pledge.createdAt).toLocaleDateString()}
                                          </p>
                                          {pledge.donationNotes && (
                                            <p className="mt-1 pt-1 border-t border-[#94B4C1]/20 italic text-[#547792]/70 text-[11px]">
                                              Note: {pledge.donationNotes}
                                            </p>
                                          )}

                                          {/* --- NEW: Pledge Status Update Buttons --- */}
                                          {pledge.status !== "Donated" && pledge.status !== "Cancelled" && (
                                            <div className="mt-2 pt-2 border-t border-[#94B4C1]/20 flex gap-2">
                                              <Button
                                                size="xs" // You might need to define a 'xs' size for Button or use p-1 text-xs
                                                variant="outline"
                                                className="text-[#213448] border-[#ECEFCA] bg-[#ECEFCA]/50 hover:bg-[#ECEFCA] h-7 px-2"
                                                onClick={() => handlePledgeStatusUpdate(pledge._id, "Donated", req._id)}
                                                disabled={updatingPledgeId === pledge._id}
                                              >
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark as Donated
                                              </Button>
                                              <Button
                                                size="xs"
                                                variant="outline"
                                                className="text-[#ECEFCA] border-[#213448] bg-[#213448]/50 hover:bg-[#213448] h-7 px-2"
                                                onClick={() =>
                                                  handlePledgeStatusUpdate(pledge._id, "Cancelled", req._id)
                                                }
                                                disabled={updatingPledgeId === pledge._id}
                                              >
                                                <XCircle className="h-3.5 w-3.5 mr-1" /> Mark as Cancelled
                                              </Button>
                                            </div>
                                          )}
                                          {/* --- END: Pledge Status Update Buttons --- */}
                                        </div>
                                      ))}
                                    </div>
                                  ) : Array.isArray(pledgesMap[req._id]) ? (
                                    <p className="text-xs text-[#547792] py-2">No pledges yet for this request.</p>
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

        {/* Modals */}
        {showCreateModal && (
          <CreateBloodRequestForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccessfullyCreated={() => {
              fetchAllRequests()
            }}
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
          />
        )}
      </div>
    </div>
  )
}

export default ManageBloodRequestsPage
