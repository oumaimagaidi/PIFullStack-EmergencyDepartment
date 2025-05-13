"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import BloodRequestCard from "../components/blood/BloodRequestCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Droplets } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#94B4C1",
  dark: "#213448",
  light: "#ECEFCA",
}

const ActiveBloodRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBloodType, setFilterBloodType] = useState("All")
  const [filterUrgency, setFilterUrgency] = useState("All")

  const bloodTypes = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"]
  const urgencies = ["All", "Critical", "Urgent", "Standard"]

  const fetchActiveRequests = async () => {
    // Encapsulate fetch logic
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8089/api/blood-requests/active`)
      const sortedRequests = response.data.sort((a, b) => {
        const urgencyOrder = { Critical: 0, Urgent: 1, Standard: 2 }
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      setRequests(sortedRequests)
      // setFilteredRequests(sortedRequests); // Filtering will be handled by useEffect
    } catch (err) {
      console.error("Error fetching active blood requests:", err)
      setError(err.response?.data?.message || "Failed to load active blood requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveRequests()
  }, [])

  useEffect(() => {
    let currentFiltered = requests

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        (req) =>
          req.hospitalLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.bloodTypeNeeded.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterBloodType !== "All") {
      currentFiltered = currentFiltered.filter((req) => req.bloodTypeNeeded === filterBloodType)
    }

    if (filterUrgency !== "All") {
      currentFiltered = currentFiltered.filter((req) => req.urgency === filterUrgency)
    }
    setFilteredRequests(currentFiltered)
  }, [searchTerm, filterBloodType, filterUrgency, requests])

  const handlePledgeSuccess = (updatedRequest) => {
    // Update the specific request in the main 'requests' list
    setRequests((prevRequests) => prevRequests.map((req) => (req._id === updatedRequest._id ? updatedRequest : req)))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-2 pt-2">
        {/* Skeleton UI */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center" style={{ color: COLORS.dark }}>
            <Droplets className="mr-3 h-8 w-8" style={{ color: COLORS.primary }} />
            Active Blood Needs
          </h1>
          <p style={{ color: COLORS.dark }}>Urgently needed blood donations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} style={{ backgroundColor: "white", borderColor: COLORS.secondary, borderWidth: "1px" }}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" style={{ backgroundColor: COLORS.secondary + "40" }} />
                <Skeleton className="h-4 w-1/2" style={{ backgroundColor: COLORS.secondary + "40" }} />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" style={{ backgroundColor: COLORS.secondary + "40" }} />
                <Skeleton className="h-4 w-5/6" style={{ backgroundColor: COLORS.secondary + "40" }} />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" style={{ backgroundColor: COLORS.secondary + "40" }} />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 pt-4">
        <Alert
          variant="destructive"
          style={{ backgroundColor: COLORS.light, borderColor: COLORS.primary, borderWidth: "1px" }}
        >
          <AlertCircle className="h-4 w-4" style={{ color: COLORS.primary }} />
          <AlertTitle style={{ color: COLORS.dark }}>Error</AlertTitle>
          <AlertDescription style={{ color: COLORS.dark }}>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF]"
      style={{  minHeight: "100vh", paddingTop: "6rem", paddingBottom: "2rem" }}
    >
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold mb-3 flex items-center justify-center" style={{ color: COLORS.dark }}>
            <Droplets className="mr-3 h-10 w-10" style={{ color: COLORS.primary }} />
            Active Blood Needs
          </h1>
          <p className="text-lg" style={{ color: COLORS.dark }}>
            Your help can save a life. Find an active request below.
          </p>
        </div>

        {/* Filters */}
        <div
          className="mb-6 p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center"
          style={{ backgroundColor: "white", borderColor: COLORS.secondary, borderWidth: "1px" }}
        >
          <Input
            type="text"
            placeholder="Search by location, reason, blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
            style={{
              borderColor: COLORS.secondary,
              color: COLORS.dark,
              "--tw-ring-color": COLORS.primary,
            }}
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <Select value={filterBloodType} onValueChange={setFilterBloodType}>
              <SelectTrigger
                className="w-full sm:w-[180px]"
                style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
              >
                <SelectValue placeholder="Filter by Blood Type" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type} style={{ color: COLORS.dark }}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger
                className="w-full sm:w-[180px]"
                style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
              >
                <SelectValue placeholder="Filter by Urgency" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
                {urgencies.map((urgency) => (
                  <SelectItem key={urgency} value={urgency} style={{ color: COLORS.dark }}>
                    {urgency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div
            className="text-center py-10 rounded-lg"
            style={{ backgroundColor: "white", borderColor: COLORS.secondary, borderWidth: "1px" }}
          >
            <Droplets className="mx-auto h-16 w-16 mb-4" style={{ color: COLORS.secondary }} />
            <p className="text-xl" style={{ color: COLORS.dark }}>
              No active blood requests matching your criteria at the moment.
            </p>
            <p className="mt-2" style={{ color: COLORS.primary }}>
              Thank you for checking!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <BloodRequestCard
                key={request._id}
                request={request}
                onPledgeSuccess={handlePledgeSuccess}
                colors={COLORS} // Pass the color palette to the card component
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveBloodRequestsPage
