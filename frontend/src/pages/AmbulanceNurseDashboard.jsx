"use client"

// NurseDashboard.jsx
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Parse destination string "lat,lng" into a [lat, lng] array
const parseDestination = (dest) => {
  if (!dest) return null
  const parts = dest.split(",")
  if (parts.length !== 2) return null
  const lat = Number.parseFloat(parts[0].trim())
  const lng = Number.parseFloat(parts[1].trim())
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng]
}

// Fetch a route from OSRM API between two points and return coordinates and duration
const fetchRoute = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
      const duration = data.routes[0].duration // duration in seconds
      return { coordinates: coords, duration }
    }
  } catch (error) {
    console.error("Error fetching route:", error)
  }
  return null
}

// Fetch place coordinates from Nominatim
const fetchPlaceCoordinates = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    const response = await fetch(url, {
      headers: { "User-Agent": "NurseDashboard/1.0 (contact@example.com)" },
    })
    const data = await response.json()
    if (data.length > 0) {
      return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
    }
  } catch (error) {
    console.error("Error fetching place coordinates:", error)
  }
  return null
}

const NurseDashboard = () => {
  const [assignedAmbulance, setAssignedAmbulance] = useState(null)
  const [ambulanceStatus, setAmbulanceStatus] = useState("")
  const [location, setLocation] = useState(null)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertText, setAlertText] = useState("")
  const [sharing, setSharing] = useState(false)
  const [destination, setDestination] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [route, setRoute] = useState([])
  const [eta, setEta] = useState(null)

  const mapRef = useRef(null)
  const locationIntervalRef = useRef(null)
  const socketRef = useRef(null)

  const statusOptions = ["OFF_DUTY", "AVAILABLE", "ON_MISSION", "MAINTENANCE"]

  // 1) Fetch assigned ambulance data & initialize Socket.IO connection
  useEffect(() => {
    const fetchAssignedAmbulance = async () => {
      try {
        const { data } = await axios.get("http://localhost:8089/api/ambulance/assigned", { withCredentials: true })
        if (data) {
          setAssignedAmbulance(data)
          setAmbulanceStatus(data.status)
          if (data.latitude != null && data.longitude != null) {
            setLocation({ lat: data.latitude, lng: data.longitude })
          }
          setDestination(data.destination || "")
        }
      } catch (err) {
        console.error(err)
        setAlertMessage("Failed to load ambulance data.")
      }
    }
    fetchAssignedAmbulance()

    // Socket.IO setup
    socketRef.current = io("http://localhost:8089", { withCredentials: true })
    socketRef.current.on("connect", () => console.log("🔌 Nurse socket connected:", socketRef.current.id))

    // Listen for real-time destination updates
    socketRef.current.on("destinationUpdate", (data) => {
      console.log("🏁 Nurse received destinationUpdate:", data)
      setAssignedAmbulance((prev) => {
        if (!prev || prev._id !== data.id) return prev
        const newDest = `${data.destinationLatitude},${data.destinationLongitude}`
        return { ...prev, destination: newDest }
      })
    })

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current)
      socketRef.current.disconnect()
    }
  }, [])

  // 2) Update route & ETA whenever location or ambulance destination changes
  useEffect(() => {
    const updateRoute = async () => {
      if (assignedAmbulance && location && assignedAmbulance.destination) {
        const destCoords = parseDestination(assignedAmbulance.destination)
        if (destCoords) {
          const result = await fetchRoute(
            { lat: location.lat, lng: location.lng },
            { lat: destCoords[0], lng: destCoords[1] },
          )
          if (result) {
            setRoute(result.coordinates)
            setEta(result.duration)
          } else {
            setRoute([])
            setEta(null)
          }
        } else {
          setRoute([])
          setEta(null)
        }
      }
    }
    updateRoute()
  }, [assignedAmbulance, location])

  // 3) Start sharing location at an interval (every 60 seconds)
  const startLocationSharing = () => {
    if (!assignedAmbulance || sharing) return
    setSharing(true)
    locationIntervalRef.current = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords
            // Emit location update
            socketRef.current.emit("locationUpdate", {
              id: assignedAmbulance._id,
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            })
            setLocation({ lat: latitude, lng: longitude })
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 13)
            }
          },
          (error) => {
            console.error("Geolocation error:", error)
          },
          { enableHighAccuracy: true },
        )
      }
    }, 60000)
  }

  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      setSharing(false)
      setAlertMessage("Location sharing stopped.")
    }
  }

  const viewOnMap = () => {
    if (mapRef.current && location) {
      mapRef.current.flyTo([location.lat, location.lng], 15)
    }
  }

  // 4) Search for a place via Nominatim and update the destination accordingly
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAlertMessage("Please enter a place to search.")
      return
    }
    const coords = await fetchPlaceCoordinates(searchQuery)
    if (coords) {
      setDestination(`${coords.lat},${coords.lng}`)
      setAlertMessage(`Destination set to ${coords.lat},${coords.lng}`)
      if (mapRef.current) {
        mapRef.current.flyTo([coords.lat, coords.lng], 15)
      }
    } else {
      setAlertMessage("Place not found. Please try again.")
    }
  }

  // 5) Save updated destination information to the backend and emit
  const handleSaveDestination = async () => {
    if (!assignedAmbulance) {
      setAlertMessage("No ambulance assigned.")
      return
    }
    const destCoords = parseDestination(destination)
    if (!destCoords && destination !== "") {
      setAlertMessage("Invalid destination format. Use 'lat,lng'.")
      return
    }
    try {
      const updatedPayload = { ...assignedAmbulance, destination: destination || null }
      const { data } = await axios.put(`http://localhost:8089/api/ambulance/${assignedAmbulance._id}`, updatedPayload, {
        withCredentials: true,
      })
      setAssignedAmbulance(data)
      setAlertMessage(destination ? "Destination updated successfully." : "Destination cleared.")

      // Emit the new destination over Socket.IO
      if (destCoords) {
        socketRef.current.emit("destinationUpdate", {
          id: data._id,
          destinationLatitude: destCoords[0],
          destinationLongitude: destCoords[1],
        })
      }
    } catch (err) {
      console.error(err)
      setAlertMessage("Failed to update destination.")
    }
  }

  // 6) Update ambulance status
  const updateAmbulanceStatus = async (newStatus) => {
    if (!assignedAmbulance) return
    try {
      const { data } = await axios.put(
        `http://localhost:8089/api/ambulance/${assignedAmbulance._id}/status`,
        { status: newStatus },
        { withCredentials: true },
      )
      setAssignedAmbulance(data.ambulance || data)
      setAmbulanceStatus(data.ambulance?.status || data.status)
    } catch (err) {
      console.error(err)
    }
  }

  // 7) Send alert message via Socket.IO
  const sendAlertToDoctors = () => {
    if (!alertText.trim()) {
      setAlertMessage("Please type a message.")
      return
    }
    socketRef.current.emit("alert", {
      message: alertText,
      source: `Ambulance ${assignedAmbulance?._id || "Unknown"}`,
    })
    setAlertMessage("Alert sent!")
    setAlertText("")
  }

  return (
    <div className="p-6 bg-[#ECEFCA]/10 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#213448]">Nurse Dashboard</h1>
      {assignedAmbulance ? (
        <>
          <div className="mb-4 bg-white p-4 rounded-lg border border-[#94B4C1]/30 shadow-sm">
            <h2 className="text-xl font-semibold text-[#213448]">My Assigned Ambulance</h2>
            <p className="text-[#547792]">
              <strong className="text-[#213448]">ID:</strong> {assignedAmbulance._id}
            </p>
            <p className="text-[#547792]">
              <strong className="text-[#213448]">Status:</strong> {ambulanceStatus}
            </p>
            <select
              value={ambulanceStatus}
              onChange={(e) => updateAmbulanceStatus(e.target.value)}
              className="border border-[#94B4C1] rounded-md p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-[#547792]"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 bg-white p-4 rounded-lg border border-[#94B4C1]/30 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-[#213448]">Send Alert</h3>
            <Input
              placeholder="Type your alert message"
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              className="mb-2 border-[#94B4C1] focus-visible:ring-[#547792]"
            />
            <Button onClick={sendAlertToDoctors} className="bg-[#DDA853] text-[#213448] hover:bg-[#DDA853]/80 w-full">
              Send Alert to Doctors
            </Button>
          </div>

          <div className="mb-4 bg-white p-4 rounded-lg border border-[#94B4C1]/30 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-[#213448]">Location Sharing</h3>
            <div className="flex space-x-2">
              <Button
                onClick={startLocationSharing}
                disabled={sharing}
                className={`flex-1 ${sharing ? "bg-[#94B4C1]/50 text-[#213448]/50" : "bg-[#547792] text-[#ECEFCA] hover:bg-[#213448]"}`}
              >
                {sharing ? "Sharing Location..." : "Share Location"}
              </Button>
              <Button
                onClick={stopLocationSharing}
                disabled={!sharing}
                className={`flex-1 ${!sharing ? "bg-[#94B4C1]/50 text-[#213448]/50" : "bg-[#213448] text-[#ECEFCA] hover:bg-[#213448]/80"}`}
              >
                Stop Sharing
              </Button>
              <Button
                onClick={viewOnMap}
                disabled={!location}
                className={`flex-1 ${!location ? "bg-[#94B4C1]/50 text-[#213448]/50" : "bg-[#94B4C1] text-[#213448] hover:bg-[#94B4C1]/80"}`}
              >
                View on Map
              </Button>
            </div>
          </div>

          <div className="mb-4 bg-white p-4 rounded-lg border border-[#94B4C1]/30 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-[#213448]">Set Destination</h3>
            <div className="space-y-2">
              <Input
                placeholder='Destination (format: "lat,lng")'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border-[#94B4C1] focus-visible:ring-[#547792]"
              />
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for a place"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-[#94B4C1] focus-visible:ring-[#547792]"
                />
                <Button onClick={handleSearch} className="bg-[#547792] text-[#ECEFCA] hover:bg-[#213448]">
                  Search
                </Button>
              </div>
              <Button
                onClick={handleSaveDestination}
                className={`w-full ${destination ? "bg-[#547792] text-[#ECEFCA] hover:bg-[#213448]" : "bg-[#213448] text-[#ECEFCA] hover:bg-[#213448]/80"}`}
              >
                {destination ? "Save Destination" : "Clear Destination"}
              </Button>
            </div>
          </div>

          {location ? (
            <>
              {assignedAmbulance.destination && eta && (
                <div className="mb-2 p-3 bg-[#DDA853]/20 rounded-lg border border-[#DDA853]/30">
                  <p className="text-lg font-semibold text-[#213448]">
                    ETA to destination: {Math.round(eta / 60)} minutes
                  </p>
                </div>
              )}
              <div className="h-96 border border-[#94B4C1]/30 rounded-lg overflow-hidden">
                <MapContainer
                  ref={mapRef}
                  center={[location.lat, location.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>
                      <div className="text-[#213448] font-medium">
                        {assignedAmbulance._id} (Status: {ambulanceStatus})
                      </div>
                      {assignedAmbulance.destination && (
                        <div className="text-[#547792] text-sm">
                          <div>Destination: {assignedAmbulance.destination}</div>
                          {eta && <div className="font-medium">ETA: {Math.round(eta / 60)} mins</div>}
                        </div>
                      )}
                    </Popup>
                  </Marker>
                  {assignedAmbulance.destination &&
                    (() => {
                      const destCoords = parseDestination(assignedAmbulance.destination)
                      return destCoords ? (
                        <Marker position={destCoords}>
                          <Popup>
                            <div className="text-[#213448] font-medium">Destination</div>
                          </Popup>
                        </Marker>
                      ) : null
                    })()}
                  {route.length > 0 && <Polyline positions={route} color="#547792" weight={4} />}
                </MapContainer>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white rounded-lg border border-[#94B4C1]/30">
              <p className="text-[#547792]">Loading location...</p>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center bg-white rounded-lg border border-[#94B4C1]/30">
          <p className="text-[#547792]">You are not currently assigned to an ambulance.</p>
        </div>
      )}

      {alertMessage && (
        <div className="mt-4 p-3 bg-[#DDA853]/20 rounded-lg border border-[#DDA853]/30 text-[#213448]">
          {alertMessage}
        </div>
      )}
    </div>
  )
}

export default NurseDashboard