"use client"

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Loader2, Ambulance, MapPin, Users, Phone } from "lucide-react"
import "leaflet/dist/leaflet.css"

const computeDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const parseDestination = (dest) => {
  if (!dest) return null
  const parts = dest.split(",")
  const lat = Number.parseFloat(parts[0])
  const lng = Number.parseFloat(parts[1])
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng]
}

const fetchRoute = async (origin, destination) => {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes?.length) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
    }
  } catch (err) {
    console.error(err)
  }
  return null
}

const fetchPlaceCoordinates = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    const resp = await fetch(url)
    const data = await resp.json()
    if (data.length) return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
  } catch (err) {
    console.error(err)
  }
  return null
}

const FragmentWrapper = ({ children }) => <React.Fragment>{children}</React.Fragment>

const SetMapInstance = ({ setMapInstance }) => {
  const map = useMap()
  useEffect(() => setMapInstance(map), [map])
  return null
}

const AmbulanceForm = ({ ambulance, onSave, onSearchPlace }) => {
  const [form, setForm] = useState({
    name: ambulance?.name || "",
    status: ambulance?.status || "AVAILABLE",
    lastUpdated: ambulance?.lastUpdated || "",
    latitude: ambulance?.latitude || 0,
    longitude: ambulance?.longitude || 0,
    destination: ambulance?.destination || "",
    drivers: ambulance?.drivers?.join(",") || "",
    mobile: ambulance?.mobile || "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSearch = async () => {
    setIsLoading(true)
    const coords = await onSearchPlace(searchQuery)
    if (coords) setForm({ ...form, destination: `${coords.lat},${coords.lng}` })
    setIsLoading(false)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    onSave({ ...form, drivers: form.drivers.split(",").map((d) => d.trim()) })
  }

  return (
    <div className="space-y-4 mt-4">
      {Object.entries(form).map(([key, value]) => (
        <Input
          key={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={value}
          onChange={handleChange(key)}
          className="border-[#94B4C1] focus-visible:ring-[#547792] bg-white text-[#213448]"
        />
      ))}
      <div className="flex space-x-2">
        <Input
          placeholder="Search for a place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-[#94B4C1] focus-visible:ring-[#547792] bg-white text-[#213448]"
        />
        <Button onClick={handleSearch} className="bg-[#547792] hover:bg-[#213448] text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </div>
      <Button onClick={handleSubmit} className="w-full bg-[#547792] hover:bg-[#213448] text-white" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save
      </Button>
    </div>
  )
}

const AmbulanceDashboard = () => {
  const [ambulances, setAmbulances] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [currentAmbulance, setCurrentAmbulance] = useState(null)
  const [nurses, setNurses] = useState([])
  const [selectedNurse, setSelectedNurse] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [routes, setRoutes] = useState({})
  const [mapInstance, setMapInstance] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user")) || {}
    if (user.role === "Administrator") setIsAdmin(true)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    axios
      .get("http://localhost:8089/api/ambulance", { withCredentials: true })
      .then(({ data }) => {
        setAmbulances(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError("Failed to load ambulance data")
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    try {
      socketRef.current = io("http://localhost:8089", { withCredentials: true })

      socketRef.current.on("connect", () => {
        console.log("Socket connected")
      })

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err)
        setError("Real-time connection failed")
      })

      socketRef.current.on("locationUpdate", ({ id, latitude, longitude, timestamp }) => {
        setAmbulances((prev) =>
          prev.map((a) => (a._id === id ? { ...a, latitude, longitude, lastUpdated: timestamp } : a)),
        )
      })

      socketRef.current.on("destinationUpdate", ({ id, destinationLatitude, destinationLongitude }) => {
        setAmbulances((prev) =>
          prev.map((a) =>
            a._id === id
              ? {
                  ...a,
                  destination: `${destinationLatitude},${destinationLongitude}`,
                  lastUpdated: new Date().toISOString(),
                }
              : a,
          ),
        )
      })

      return () => socketRef.current && socketRef.current.disconnect()
    } catch (err) {
      console.error("Socket initialization error:", err)
      setError("Failed to initialize real-time connection")
    }
  }, [])

  useEffect(() => {
    if (sheetOpen && isAdmin) {
      axios
        .get("http://localhost:8089/api/users/nurses", { withCredentials: true })
        .then(({ data }) => setNurses(data))
        .catch((err) => {
          console.error(err)
          setError("Failed to load nurses data")
        })
    }
  }, [sheetOpen, isAdmin])

  useEffect(() => {
    if (mapInstance && ambulances.length) {
      const bounds = ambulances
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => [a.latitude, a.longitude])
      if (bounds.length > 0) {
        mapInstance.fitBounds(bounds)
      }
    }
  }, [mapInstance, ambulances])

  useEffect(() => {
    ambulances.forEach(async (a) => {
      if (a.destination) {
        const dest = parseDestination(a.destination)
        if (dest) {
          const routeCoords = await fetchRoute({ lat: a.latitude, lng: a.longitude }, { lat: dest[0], lng: dest[1] })
          if (routeCoords) setRoutes((r) => ({ ...r, [a._id]: routeCoords }))
        }
      }
    })
  }, [ambulances])

  const handleSaveAmbulance = async (data) => {
    try {
      const res = currentAmbulance?._id
        ? await axios.put(`http://localhost:8089/api/ambulance/${currentAmbulance._id}`, data, {
            withCredentials: true,
          })
        : await axios.post("http://localhost:8089/api/ambulance", data, { withCredentials: true })
      const saved = res.data
      setAmbulances((prev) =>
        currentAmbulance ? prev.map((a) => (a._id === saved._id ? saved : a)) : [...prev, saved],
      )
      if (saved.destination) {
        const [lat, lng] = parseDestination(saved.destination)
        socketRef.current.emit("destinationUpdate", {
          id: saved._id,
          destinationLatitude: lat,
          destinationLongitude: lng,
        })
      }
      setSheetOpen(false)
    } catch (err) {
      console.error(err)
      setError("Failed to save ambulance data")
    }
  }

  const handleDeleteAmbulance = (id) => {
    axios
      .delete(`http://localhost:8089/api/ambulance/${id}`, { withCredentials: true })
      .then(() => setAmbulances((prev) => prev.filter((a) => a._id !== id)))
      .catch((err) => {
        console.error(err)
        setError("Failed to delete ambulance")
      })
  }

  const handleAddTeamMember = () => {
    if (!selectedNurse || !currentAmbulance?._id) return
    axios
      .post(
        `http://localhost:8089/api/ambulance/${currentAmbulance._id}/team`,
        { userId: selectedNurse },
        { withCredentials: true },
      )
      .then(({ data }) => {
        setCurrentAmbulance(data.ambulance)
        setAmbulances((prev) => prev.map((a) => (a._id === data.ambulance._id ? data.ambulance : a)))
        setSelectedNurse("")
      })
      .catch((err) => {
        console.error(err)
        setError("Failed to add team member")
      })
  }

  const handleSearchPlace = async (q) => {
    const coords = await fetchPlaceCoordinates(q)
    if (coords) mapInstance.flyTo([coords.lat, coords.lng], 15)
    return coords
  }

  const viewOnMap = (a) => {
    if (!mapInstance) return
    mapInstance.flyTo([a.latitude, a.longitude], 15)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500"
      case "BUSY":
        return "bg-yellow-500"
      case "UNAVAILABLE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const clearError = () => setError(null)

  return (
    <div className="flex h-screen bg-[#ECEFCA]/10">
      {/* Sidebar */}
      <div className="w-1/3 p-6 overflow-y-auto bg-[#ECEFCA]/30 border-r border-[#94B4C1]">
        <div className="flex items-center mb-6">
          <Ambulance className="h-8 w-8 text-[#213448] mr-2" />
          <h1 className="text-2xl font-extrabold text-[#213448]">Ambulance Tracking</h1>
        </div>

        <Button
          onClick={() => {
            setCurrentAmbulance(null)
            setSheetOpen(true)
          }}
          className="mb-6 w-full bg-[#547792] hover:bg-[#213448] text-white"
        >
          <Ambulance className="h-4 w-4 mr-2" /> Add Ambulance
        </Button>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 font-bold">
              ×
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-[#547792] animate-spin" />
          </div>
        ) : ambulances.length === 0 ? (
          <div className="text-center p-6 bg-white rounded-lg shadow border border-[#94B4C1]">
            <p className="text-[#213448]">No ambulances available</p>
          </div>
        ) : (
          ambulances.map((a) => (
            <Card key={a._id} className="mb-4 border-[#94B4C1] bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#213448]">{a.name}</CardTitle>
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(a.status)}`}></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-[#213448]">
                  <p className="flex items-center">
                    <span className="font-semibold mr-2">Status:</span> {a.status}
                  </p>
                  <p className="flex items-center text-sm text-[#547792]">
                    <span className="font-semibold mr-2">Last Updated:</span>
                    {a.lastUpdated ? new Date(a.lastUpdated).toLocaleString() : "N/A"}
                  </p>
                  <p className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-[#547792]" />
                    <span className="font-semibold mr-2">Drivers:</span> {a.drivers?.join(", ") || "N/A"}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-[#547792]" />
                    <span className="font-semibold mr-2">Mobile:</span> {a.mobile || "N/A"}
                  </p>
                  {a.destination && (
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#547792]" />
                      <span className="font-semibold mr-2">Destination:</span>
                      <span className="truncate">{a.destination}</span>
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button onClick={() => viewOnMap(a)} className="bg-[#94B4C1] hover:bg-[#547792] text-white">
                    <MapPin className="h-4 w-4 mr-2" /> View on Map
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentAmbulance(a)
                      setSheetOpen(true)
                    }}
                    className="bg-[#547792] hover:bg-[#213448] text-white"
                  >
                    Edit
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteAmbulance(a._id)}
                        className="bg-red-500 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => {
                          setCurrentAmbulance(a)
                          setSheetOpen(true)
                        }}
                        className="bg-[#213448] hover:bg-[#547792] text-white"
                      >
                        Add Nurse
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Map */}
      <div className="w-2/3">
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }} className="z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <SetMapInstance setMapInstance={setMapInstance} />
          {ambulances
            .filter((a) => a.latitude)
            .map((a) => {
              const destCoords = parseDestination(a.destination)
              return (
                <FragmentWrapper key={a._id}>
                  <Marker position={[a.latitude, a.longitude]}>
                    <Popup className="text-[#213448]">
                      <div className="font-bold">{a.name}</div>
                      <div>Status: {a.status}</div>
                      {destCoords && (
                        <div>
                          ETA: {Math.round((computeDistance(a.latitude, a.longitude, ...destCoords) / 40) * 60)} mins
                        </div>
                      )}
                    </Popup>
                  </Marker>
                  {routes[a._id] && <Polyline positions={routes[a._id]} color="#547792" weight={4} opacity={0.7} />}
                </FragmentWrapper>
              )
            })}
        </MapContainer>
      </div>

      {/* Sheet/Modal */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="z-[9999] bg-[#ECEFCA]/95 border-l border-[#94B4C1]">
          <SheetHeader>
            <SheetTitle className="text-[#213448] text-xl">
              {currentAmbulance ? "Edit Ambulance / Add Nurse" : "Add New Ambulance"}
            </SheetTitle>
          </SheetHeader>
          <AmbulanceForm ambulance={currentAmbulance} onSave={handleSaveAmbulance} onSearchPlace={handleSearchPlace} />
          {isAdmin && currentAmbulance?._id && (
            <div className="mt-6 space-y-4 border-t border-[#94B4C1] pt-4">
              <h3 className="text-[#213448] font-semibold">Team Management</h3>
              {currentAmbulance.team?.length ? (
                <div className="space-y-2">
                  {currentAmbulance.team?.map((n) => (
                    <div key={n._id} className="flex items-center p-2 bg-white rounded border border-[#94B4C1]">
                      <Users className="h-4 w-4 mr-2 text-[#547792]" />
                      <p className="text-[#213448]">{n.username}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#547792] italic">No team members assigned</p>
              )}
              <div className="flex space-x-2">
                <select
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  className="flex-1 rounded-md border border-[#94B4C1] bg-white text-[#213448] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#547792]"
                >
                  <option value="">Select Nurse</option>
                  {nurses
                    .filter((n) => !currentAmbulance.team?.find((m) => m._id === n._id))
                    .map((n) => (
                      <option key={n._id} value={n._id}>
                        {n.username}
                      </option>
                    ))}
                </select>
                <Button onClick={handleAddTeamMember} className="bg-[#547792] hover:bg-[#213448] text-white">
                  Add Nurse
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default AmbulanceDashboard
