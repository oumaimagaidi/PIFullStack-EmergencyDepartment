"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Ambulance } from "lucide-react"
import ParticlesComponent from "@/components/ParticlesComponent"

// Updated color palette
const colors = {
  primary: "#213448", // Dark blue
  secondary: "#547792", // Medium blue
  accent: "#94B4C1", // Light blue
  light: "#ECEFCA", // Light cream/beige
  white: "#ffffff",
  red: "#ff4242", // Keeping the red for emergency elements
}

const RequestAmbulance = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emergencyType: "URGENT",
    description: "",
  })
  const [requestId, setRequestId] = useState(null)
  const [status, setStatus] = useState("idle")
  const navigate = useNavigate()
  const socketRef = useRef(null)

  // Initialize Socket.IO and handle cleanup
  useEffect(() => {
    // Socket.IO setup
    socketRef.current = io("http://localhost:8089", { withCredentials: true })

    socketRef.current.on("connect", () => {
      console.log("🔌 Patient socket connected:", socketRef.current.id)
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
    })

    // Listen for request status updates (optional, if backend emits them)
    socketRef.current.on(`request_${requestId}`, (data) => {
      if (data.type === "STATUS_UPDATE") {
        setStatus(data.data.status.toLowerCase())
      }
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [requestId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const response = await axios.post(
        "http://localhost:8089/api/ambulance-requests",
        {
          ...formData,
          patient: {
            ...formData,
            location: { latitude: null, longitude: null }, // Location added later
          },
        },
        { withCredentials: true }, // Align with NurseDashboard
      )

      setRequestId(response.data._id)
      setStatus("success")

      // Redirect to ambulance selection page
      navigate(`/choose-ambulance/${response.data._id}`)
    } catch (error) {
      console.error("Error requesting ambulance:", error)
      setStatus("error")
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      emergencyType: value,
    })
  }

  return (
    <div className="relative min-h-screen flex flex-col pt-12 bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="ambulance-particles"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#E8F4F8",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto bg-white bg-opacity-95 backdrop-blur-sm shadow-xl border border-gray-100">
          <CardHeader className="pb-6 border-b" style={{ backgroundColor: colors.primary, color: colors.white }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20">
                <Ambulance className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Request an Ambulance</CardTitle>
                <CardDescription className="text-white/80">
                  Please provide your details for emergency assistance
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-4">
            {status === "success" ? (
              <Alert className="bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Ambulance className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <AlertTitle className="text-green-800 text-lg font-semibold">Request Received!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Please select an ambulance on the next page.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ) : status === "error" ? (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">Request Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  There was an error processing your request. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emergencyType">Emergency Type</Label>
                  <Select value={formData.emergencyType} onValueChange={handleSelectChange}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select emergency type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL" className="text-red-600 font-medium">
                        Critical - Life-threatening
                      </SelectItem>
                      <SelectItem value="URGENT" className="text-orange-500 font-medium">
                        Urgent - Requires immediate attention
                      </SelectItem>
                      <SelectItem value="NON_URGENT" className="text-blue-600 font-medium">
                        Non-Urgent - Stable condition
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description of Emergency</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Please describe the emergency situation in detail"
                    className="border-gray-300 min-h-[120px]"
                  />
                </div>

                <div className="pt-2">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      For immediate life-threatening emergencies, please also call your local emergency number (e.g.,
                      911).
                    </AlertDescription>
                  </Alert>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-end pt-2 pb-6">
            {status !== "success" && (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full sm:w-auto"
               style={{ 
    backgroundColor: colors.primary,
    color: "#ECEFCA"
  }}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Request...
                  </>
                ) : (
                  <>
                    <Ambulance className="mr-2 h-4 w-4" />
                    Request Ambulance
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RequestAmbulance
