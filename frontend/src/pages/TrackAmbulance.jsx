"use client"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import "leaflet/dist/leaflet.css"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Ambulance, Clock, Phone, Navigation, Home } from "lucide-react"
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

// Custom icons
const ambulanceIcon = new L.Icon({
iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Icône de localisation classique
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
})

const patientIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077063.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
})

// Hook to fit map to marker positions
function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [positions, map])
  return null
}

export default function TrackAmbulance() {
  const { id: requestId } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [ambPos, setAmbPos] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])
  const [etaMin, setEtaMin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socketRef = useRef()

  // Helper: fetch driving route and ETA
  const computeRoute = async (origin, dest) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const json = await res.json()
      if (json.routes?.length) {
        const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRouteCoords(coords)
        setEtaMin(Math.round(json.routes[0].duration / 60))
      }
    } catch (err) {
      console.error("Route fetch error:", err)
    }
  }

  // 1) Load request and initial positions
  useEffect(() => {
    const fetchRequestData = async () => {
      setLoading(true)
      try {
        const { data } = await axios.get(`http://localhost:8089/api/ambulance-requests/${requestId}`, {
          withCredentials: true,
        })
        setRequest(data)
        const patientLoc = data.patient?.location
        const amb = data.ambulance
        if (amb?.latitude != null && amb?.longitude != null) {
          const origin = { lat: amb.latitude, lng: amb.longitude }
          setAmbPos(origin)
          if (patientLoc?.latitude != null && patientLoc?.longitude != null) {
            await computeRoute(origin, { lat: patientLoc.latitude, lng: patientLoc.longitude })
          }
        }
        setError(null)
      } catch (error) {
        console.error("Failed to load request:", error)
        setError("Failed to load ambulance data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRequestData()
  }, [requestId])

  // 2) Subscribe to real-time ambulance location
  useEffect(() => {
    if (!request?.ambulance?._id) return

    const socket = io("http://localhost:8089", { withCredentials: true })
    socketRef.current = socket

    socket.on("connect", () => console.log("Socket connected"))
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      setError("Connection to tracking server failed. Location updates may be delayed.")
    })

    const channel = `ambulance_${request.ambulance._id}`
    socket.on(channel, ({ type, data }) => {
      if (type === "LOCATION_UPDATE") {
        const newPos = { lat: data.latitude, lng: data.longitude }
        console.log("New ambulance position:", newPos)
        setAmbPos(newPos)
        const patientLoc = request.patient.location
        if (patientLoc) {
          computeRoute(newPos, { lat: patientLoc.latitude, lng: patientLoc.longitude })
        }
      }
    })

    return () => {
      socket.off(channel)
      socket.disconnect()
    }
  }, [request])

  const getStatusBadge = (status) => {
    let color, bgColor, text

    switch (status) {
      case "ASSIGNED":
        color = "#2563eb"
        bgColor = "#dbeafe"
        text = "Assigned"
        break
      case "EN_ROUTE":
        color = "#f59e0b"
        bgColor = "#fef3c7"
        text = "En Route"
        break
      case "ARRIVED":
        color = "#10b981"
        bgColor = "#d1fae5"
        text = "Arrived"
        break
      case "COMPLETED":
        color = "#6366f1"
        bgColor = "#e0e7ff"
        text = "Completed"
        break
      default:
        color = colors.secondary
        bgColor = `${colors.accent}30`
        text = status || "Unknown"
    }

    return (
      <Badge
        style={{
          backgroundColor: bgColor,
          color: color,
        }}
      >
        {text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
        <div className="fixed inset-0 z-0">
          <ParticlesComponent
            id="track-particles"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "#E8F4F8",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
            <h2 className="text-xl font-semibold" style={{ color: colors.primary }}>
              Loading ambulance tracking data...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
        <div className="fixed inset-0 z-0">
          <ParticlesComponent
            id="track-particles"
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
                <CardTitle className="text-2xl font-bold text-white">Track Your Ambulance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate("/home")} style={{ backgroundColor: colors.primary }}>
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const patientLoc = request.patient?.location
  if (!patientLoc) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
        <div className="fixed inset-0 z-0">
          <ParticlesComponent
            id="track-particles"
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
                <CardTitle className="text-2xl font-bold text-white">Track Your Ambulance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-700">
                  Patient location unavailable. Please enable location services.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate("/home")} style={{ backgroundColor: colors.primary }}>
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const patientPos = [patientLoc.latitude, patientLoc.longitude]
  const center = ambPos ? [ambPos.lat, ambPos.lng] : patientPos
  const bounds = ambPos ? [patientPos, [ambPos.lat, ambPos.lng]] : [patientPos]

  return (
    <div className="relative min-h-screen flex flex-col pt-12 bg-gradient-to-br from-[#94B4C1] to-[#ECEFCA] font-sans">
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="track-particles"
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
                <CardTitle className="text-2xl font-bold text-white">Track Your Ambulance</CardTitle>
                <CardDescription className="text-white/80">
                  Real-time location tracking of your assigned ambulance
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-4">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" style={{ color: colors.primary }}>
                    Ambulance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Status:</span>
                      <div>{getStatusBadge(request.status)}</div>
                    </div>

                    {etaMin != null && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Arrival:</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" style={{ color: colors.secondary }} />
                          <span className="font-semibold" style={{ color: colors.secondary }}>
                            {etaMin} minutes
                          </span>
                        </div>
                      </div>
                    )}

                    {request.ambulance?.phone && (
                      <div className="pt-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => window.open(`tel:${request.ambulance.phone}`)}
                          style={{ borderColor: colors.secondary, color: colors.secondary }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call Ambulance
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" style={{ color: colors.primary }}>
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-medium">{request.patient?.name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{request.patient?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Emergency Type</p>
                      <p className="font-medium">{request.emergencyType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Request Time</p>
                      <p className="font-medium">
                        {request.createdAt ? new Date(request.createdAt).toLocaleString() : "Not available"}
                      </p>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="mt-1 text-sm border p-2 rounded bg-gray-50">{request.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-md">
              <MapContainer center={center} zoom={13} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Patient marker */}
                <Marker position={patientPos} icon={patientIcon}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold mb-1" style={{ color: colors.primary }}>
                        Your Location
                      </h3>
                      <p className="text-sm text-gray-600">
                        {patientLoc.latitude.toFixed(6)}, {patientLoc.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Ambulance marker */}
                {ambPos && (
                  <Marker position={[ambPos.lat, ambPos.lng]} icon={ambulanceIcon}>
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-semibold mb-1" style={{ color: colors.primary }}>
                          Ambulance
                        </h3>
                        {etaMin && (
                          <p className="text-sm">
                            <span className="font-medium">ETA:</span> {etaMin} minutes
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route line */}
                {routeCoords.length > 0 && (
                  <Polyline
                    positions={routeCoords}
                    color={colors.secondary}
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}

                {/* Fit map bounds */}
                {bounds.length > 1 && <FitBounds positions={bounds} />}
              </MapContainer>
            </div>

            {etaMin != null && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
                <div className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" style={{ color: colors.primary }} />
                  <p className="text-lg" style={{ color: colors.primary }}>
                    Estimated arrival time: <span className="font-semibold">{etaMin} minutes</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6">
           <Button 
  onClick={() => navigate("/home")} 
  style={{ 
    backgroundColor: colors.primary,
    color: "#ECEFCA"
  }}
>
  <Home className="mr-2 h-4 w-4" />
  Return to Home
</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
