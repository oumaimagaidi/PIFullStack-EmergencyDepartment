"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Ambulance, Navigation, AlertTriangle, CheckCircle } from "lucide-react"
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

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

// Custom ambulance icon
const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
})

// Component to set the map instance and fit bounds
const MapController = ({ ambulances, setMapInstance }) => {
  const map = useMap()

  useEffect(() => {
    setMapInstance(map)

    // Filter ambulances with valid coordinates
    const validAmbulances = ambulances.filter((amb) => amb.latitude != null && amb.longitude != null)

    if (validAmbulances.length > 0) {
      // Calculate average coordinates for center
      const avgLat = validAmbulances.reduce((sum, amb) => sum + amb.latitude, 0) / validAmbulances.length
      const avgLng = validAmbulances.reduce((sum, amb) => sum + amb.longitude, 0) / validAmbulances.length

      // Set map center and fit bounds
      map.setView([avgLat, avgLng], 13)

      // Optionally, fit bounds to include all ambulances
      const bounds = validAmbulances.map((amb) => [amb.latitude, amb.longitude])
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map, ambulances, setMapInstance])

  return null
}

const ChooseAmbulance = () => {
  const { id: requestId } = useParams()
  const navigate = useNavigate()
  const [ambulances, setAmbulances] = useState([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAmbulance, setSelectedAmbulance] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const socketRef = useRef(null)
  const mapRef = useRef(null) // Store map instance

  useEffect(() => {
    // Initialize Socket.IO with credentials
    socketRef.current = io("http://localhost:8089", {
      withCredentials: true,
    })

    socketRef.current.on("connect", () => {
      console.log("🔌 ChooseAmbulance socket connected:", socketRef.current.id)
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      setError("Connection to server failed. Please refresh the page.")
    })

    // Fetch available ambulances
    const fetchAmbulances = async () => {
      setLoading(true)
      try {
        const response = await axios.get("http://localhost:8089/api/ambulance", {
          params: { status: "AVAILABLE" },
          withCredentials: true,
        })
        setAmbulances(response.data)
        setError(null)
      } catch (error) {
        console.error("Error fetching ambulances:", error)
        setError("Failed to load available ambulances. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchAmbulances()

    // Listen for ambulance location updates
    socketRef.current.on("locationUpdate", (data) => {
      setAmbulances((prev) =>
        prev.map((amb) => (amb._id === data.id ? { ...amb, latitude: data.latitude, longitude: data.longitude } : amb)),
      )
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  // Function to focus map on a specific ambulance
  const viewOnMap = (ambulance) => {
    if (mapRef.current && ambulance.latitude != null && ambulance.longitude != null) {
      mapRef.current.setView([ambulance.latitude, ambulance.longitude], 15)
      setSelectedAmbulance(ambulance._id)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        { enableHighAccuracy: true },
      )
    })
  }

  // Handle ambulance selection
  const handleSelectAmbulance = async (ambulanceId) => {
    setAssigning(true)
    setError(null)

    try {
      const patientLocation = await getCurrentLocation()
      setLocation(patientLocation)

      const response = await axios.patch(
        `http://localhost:8089/api/ambulance-requests/${requestId}/assign`,
        {
          ambulanceId,
          patientLocation,
        },
        { withCredentials: true },
      )

      socketRef.current.emit("updatePatientLocation", {
        requestId,
        ...patientLocation,
      })

      navigate(`/track-ambulance/${requestId}`)
    } catch (error) {
      console.error("Error assigning ambulance:", error)
      if (error.message === "Geolocation is not supported by your browser") {
        setError("Location services are not supported by your browser.")
      } else if (error.code === 1) {
        setError("Please enable location services to select an ambulance.")
      } else {
        setError("Failed to assign ambulance. Please try again.")
      }
      setAssigning(false)
    }
  }

  const getStatusBadge = (ambulance) => {
    const isSelected = selectedAmbulance === ambulance._id
    const hasLocation = ambulance.latitude != null && ambulance.longitude != null

    if (isSelected) {
      return (
        <Badge className="ml-2" style={{ backgroundColor: colors.primary, color: colors.white }}>
          Selected
        </Badge>
      )
    } else if (hasLocation) {
      return (
        <Badge className="ml-2" style={{ backgroundColor: colors.accent, color: colors.primary }}>
          Available
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="ml-2" style={{ borderColor: colors.secondary, color: colors.secondary }}>
          No Location
        </Badge>
      )
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col pt-12 bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="choose-ambulance-particles"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#E8F4F8",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto py-12 px-4">
        <Card className="max-w-5xl mx-auto bg-white bg-opacity-95 backdrop-blur-sm shadow-xl border border-gray-100">
          <CardHeader className="pb-6 border-b" style={{ backgroundColor: colors.primary, color: colors.white }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white/20">
                <Ambulance className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Choose an Ambulance</CardTitle>
                <CardDescription className="text-white/80">
                  Select an available ambulance near your location
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-4 grid md:grid-cols-5 gap-6">
            {loading ? (
              <div className="md:col-span-5 flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: colors.primary }} />
                <p className="text-lg font-medium" style={{ color: colors.primary }}>
                  Loading available ambulances...
                </p>
              </div>
            ) : error ? (
              <div className="md:col-span-5">
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              </div>
            ) : ambulances.length === 0 ? (
              <div className="md:col-span-5 text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.primary }}>
                  No Ambulances Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  There are currently no available ambulances. Please try again later or call emergency services
                  directly.
                </p>
              </div>
            ) : (
              <>
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>
                    Available Ambulances
                  </h3>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {ambulances.map((ambulance) => (
                      <Card
                        key={ambulance._id}
                        className={`transition-all hover:shadow-md ${
                          selectedAmbulance === ambulance._id ? "border-2" : "border"
                        }`}
                        style={{
                          borderColor: selectedAmbulance === ambulance._id ? colors.primary : "transparent",
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full mr-3" style={{ backgroundColor: `${colors.accent}30` }}>
                                <Ambulance className="h-5 w-5" style={{ color: colors.primary }} />
                              </div>
                              <div>
                                <h4 className="font-medium" style={{ color: colors.primary }}>
                                  Ambulance {ambulance._id.substring(0, 8)}...
                                  {getStatusBadge(ambulance)}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {ambulance.latitude && ambulance.longitude
                                    ? "Location available"
                                    : "Location unavailable"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewOnMap(ambulance)}
                              disabled={!ambulance.latitude || !ambulance.longitude}
                              style={{
                                borderColor: colors.secondary,
                                color: colors.secondary,
                              }}
                            >
                              <MapPin className="mr-1 h-4 w-4" />
                              View on Map
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSelectAmbulance(ambulance._id)}
                              disabled={assigning || !ambulance.latitude || !ambulance.longitude}
                             style={{ 
    backgroundColor: colors.primary,
    color: "#ECEFCA"
  }}
                            >
                              {assigning && selectedAmbulance === ambulance._id ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-4 w-4" />
                              )}
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3 h-[500px] rounded-lg overflow-hidden shadow-md">
                  <MapContainer
                    center={[51.505, -0.09]} // Fallback center
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController ambulances={ambulances} setMapInstance={(map) => (mapRef.current = map)} />
                    {ambulances
                      .filter((amb) => amb.latitude != null && amb.longitude != null)
                      .map((ambulance) => (
                        <Marker
                          key={ambulance._id}
                          position={[ambulance.latitude, ambulance.longitude]}
                          icon={ambulanceIcon}
                        >
                          <Popup>
                            <div className="text-center">
                              <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>
                                Ambulance {ambulance._id.substring(0, 8)}...
                              </h3>
                              <Button
                                size="sm"
                                onClick={() => handleSelectAmbulance(ambulance._id)}
                                disabled={assigning}
                                className="w-full mt-2"
                                style={{ backgroundColor: colors.primary }}
                              >
                                {assigning && selectedAmbulance === ambulance._id ? (
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                ) : (
                                  "Select This Ambulance"
                                )}
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex flex-col">
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <Navigation className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                You'll need to enable location services to allow us to send the ambulance to your current position.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                style={{ borderColor: colors.secondary, color: colors.secondary }}
              >
                Back to Request
              </Button>
              {selectedAmbulance && (
                <Button
                  onClick={() => handleSelectAmbulance(selectedAmbulance)}
                  disabled={assigning}
                  style={{ backgroundColor: colors.primary }}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning Ambulance...
                    </>
                  ) : (
                    <>
                      <Ambulance className="mr-2 h-4 w-4" />
                      Confirm Selection
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ChooseAmbulance
