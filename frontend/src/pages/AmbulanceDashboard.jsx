// AmbulanceDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

// Haversine formula for ETA estimation
const computeDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Parse "lat,lng" string to coordinate array
const parseDestination = (dest) => {
  if (!dest) return null;
  const [latStr, lngStr] = dest.split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
};

// OSRM route fetch
const fetchRoute = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length) {
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );
    }
  } catch (err) {
    console.error(err);
  }
  return null;
};

// Nominatim search to fetch place coordinates
const fetchPlaceCoordinates = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.length) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error(err);
  }
  return null;
};

// Helper component that uses the useMap hook to provide the map instance
const SetMapInstance = ({ setMapInstance }) => {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
};

const AmbulanceForm = ({ ambulance, onSave, onSearchPlace }) => {
  const [name, setName] = useState(ambulance?.name || "");
  const [status, setStatus] = useState(ambulance?.status || "AVAILABLE");
  const [lastUpdated, setLastUpdated] = useState(ambulance?.lastUpdated || "");
  const [latitude, setLatitude] = useState(ambulance?.latitude || 0);
  const [longitude, setLongitude] = useState(ambulance?.longitude || 0);
  const [destination, setDestination] = useState(ambulance?.destination || "");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    const coords = await onSearchPlace(searchQuery);
    if (coords) setDestination(`${coords.lat},${coords.lng}`);
  };

  const handleSubmit = () => {
    onSave({ name, status, lastUpdated, latitude, longitude, destination });
  };

  return (
    <div className="space-y-4 mt-4">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />
      <Input
        placeholder="Last Updated"
        value={lastUpdated}
        onChange={(e) => setLastUpdated(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(parseFloat(e.target.value))}
      />
      <Input
        type="number"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(parseFloat(e.target.value))}
      />
      <Input
        placeholder='Destination ("lat,lng")'
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <div className="flex space-x-2">
        <Input
          placeholder="Search for a place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <Button onClick={handleSubmit}>Save</Button>
    </div>
  );
};

const AmbulanceDashboard = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentAmbulance, setCurrentAmbulance] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [routes, setRoutes] = useState({});
  const [mapInstance, setMapInstance] = useState(null);
  const socketRef = useRef(null);

  // Check if current user is an administrator
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user?.role === "Administrator") setIsAdmin(true);
  }, []);

  // Initial REST fetch for ambulances
  useEffect(() => {
    axios
      .get("http://localhost:8089/api/ambulance", { withCredentials: true })
      .then(({ data }) => {
        setAmbulances(data);
      })
      .catch(console.error);
  }, []);

  // Socket.IO listener for real-time updates
  useEffect(() => {
    socketRef.current = io("http://localhost:8089", { withCredentials: true });
    socketRef.current.on("connect", () =>
      console.log("🔌 Dashboard socket connected:", socketRef.current.id)
    );

    // location updates
    socketRef.current.on(
      "locationUpdate",
      ({ id, latitude, longitude, timestamp }) => {
        setAmbulances((prev) =>
          prev.map((a) =>
            a._id === id
              ? { ...a, latitude, longitude, lastUpdated: timestamp }
              : a
          )
        );
      }
    );

    // **destination updates**
    socketRef.current.on(
      "destinationUpdate",
      ({ id, destinationLatitude, destinationLongitude }) => {
        setAmbulances((prev) =>
          prev.map((a) =>
            a._id === id
              ? {
                  ...a,
                  destination: `${destinationLatitude},${destinationLongitude}`,
                  lastUpdated: new Date().toISOString(),
                }
              : a
          )
        );
      }
    );

    return () => socketRef.current.disconnect();
  }, []);

  // Fetch nurses when editing if user is admin
  useEffect(() => {
    if (sheetOpen && isAdmin) {
      axios
        .get("http://localhost:8089/api/users/nurses", { withCredentials: true })
        .then(({ data }) => setNurses(data))
        .catch(console.error);
    }
  }, [sheetOpen, isAdmin]);

  // Fit map bounds using only ambulances with valid coordinates
  useEffect(() => {
    if (mapInstance && ambulances.length) {
      const validBounds = ambulances
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => [a.latitude, a.longitude]);
      if (validBounds.length > 0) {
        mapInstance.fitBounds(validBounds);
      }
    }
  }, [ambulances, mapInstance]);

  // Pre-compute routes for ambulances with valid destination data
  useEffect(() => {
    ambulances.forEach(async (a) => {
      if (!a.destination) return;
      const dest = parseDestination(a.destination);
      if (!dest) return;
      const coords = await fetchRoute(
        { lat: a.latitude, lng: a.longitude },
        { lat: dest[0], lng: dest[1] }
      );
      if (coords) {
        setRoutes((r) => ({ ...r, [a._id]: coords }));
      }
    });
  }, [ambulances]);

  // Save (POST/PUT) ambulance data, then emit destinationUpdate if present
  const handleSaveAmbulance = async (data) => {
    try {
      const res = currentAmbulance?._id
        ? await axios.put(
            `http://localhost:8089/api/ambulance/${currentAmbulance._id}`,
            data,
            { withCredentials: true }
          )
        : await axios.post("http://localhost:8089/api/ambulance", data, {
            withCredentials: true,
          });
      const saved = res.data;

      // update local list
      setAmbulances((prev) =>
        currentAmbulance
          ? prev.map((a) => (a._id === saved._id ? saved : a))
          : [...prev, saved]
      );

      // emit destinationUpdate if we have one
      if (saved.destination) {
        const [lat, lng] = parseDestination(saved.destination);
        socketRef.current.emit("destinationUpdate", {
          id: saved._id,
          destinationLatitude: lat,
          destinationLongitude: lng,
        });
      }

      setSheetOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete an ambulance
  const handleDeleteAmbulance = (id) => {
    axios
      .delete(`http://localhost:8089/api/ambulance/${id}`, { withCredentials: true })
      .then(() => setAmbulances((prev) => prev.filter((a) => a._id !== id)))
      .catch(console.error);
  };

  // Add nurse to ambulance team
  const handleAddTeamMember = () => {
    if (!selectedNurse || !currentAmbulance?._id) return;
    axios
      .post(
        `http://localhost:8089/api/ambulance/${currentAmbulance._id}/team`,
        { userId: selectedNurse },
        { withCredentials: true }
      )
      .then(({ data }) => {
        const updated = data.ambulance;
        setCurrentAmbulance(updated);
        setAmbulances((prev) =>
          prev.map((a) => (a._id === updated._id ? updated : a))
        );
        setSelectedNurse("");
      })
      .catch(console.error);
  };

  // Search place helper using Nominatim
  const handleSearchPlace = async (q) => {
    const coords = await fetchPlaceCoordinates(q);
    if (coords && mapInstance) {
      mapInstance.flyTo([coords.lat, coords.lng], 15);
    }
    return coords;
  };

  // Focus map on a particular ambulance
  const viewOnMap = (ambulance) => {
    if (!mapInstance) return;
    const lat = parseFloat(ambulance.latitude);
    const lng = parseFloat(ambulance.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    mapInstance.flyTo([lat, lng], 15);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Ambulance Tracking</h1>
        <Button
          onClick={() => {
            setCurrentAmbulance(null);
            setSheetOpen(true);
          }}
          className="mb-4"
        >
          Add Ambulance
        </Button>
        {ambulances.map((a) => (
          <Card key={a._id} className="mb-4">
            <CardHeader>
              <CardTitle>{a.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {a.status}</p>
              <p>Last Updated: {a.lastUpdated || "N/A"}</p>
              {a.destination && parseDestination(a.destination) && (
                <p>
                  Destination: {a.destination}{" "}
                  {routes[a._id] && (
                    <>
                      (
                      {Math.round(
                        computeDistance(
                          a.latitude,
                          a.longitude,
                          ...parseDestination(a.destination)
                        ) /
                          40 *
                          60
                      )}{" "}
                      mins)
                    </>
                  )}
                </p>
              )}
              <Button onClick={() => viewOnMap(a)}>View on Map</Button>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 ml-2"
                onClick={() => {
                  setCurrentAmbulance(a);
                  setSheetOpen(true);
                }}
              >
                Edit
              </Button>
              {isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={() => handleDeleteAmbulance(a._id)}
                >
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map */}
      <div className="w-2/3">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <SetMapInstance setMapInstance={setMapInstance} />
          {ambulances
            .filter((a) => a.latitude != null && a.longitude != null)
            .map((a) => {
              const routeCoords = routes[a._id];
              const destinationCoords = parseDestination(a.destination);
              return (
                <React.Fragment key={a._id}>
                  <Marker position={[a.latitude, a.longitude]}>
                    <Popup>
                      {a.name} - {a.status}
                      {destinationCoords && (
                        <>
                          <br />
                          Destination: {a.destination}
                          <br />
                          ETA:{" "}
                          {Math.round(
                            computeDistance(
                              a.latitude,
                              a.longitude,
                              ...destinationCoords
                            ) /
                              40 *
                              60
                          )}{" "}
                          mins
                        </>
                      )}
                    </Popup>
                  </Marker>
                  {routeCoords && <Polyline positions={routeCoords} />}
                </React.Fragment>
              );
            })}
        </MapContainer>
      </div>

      {/* Slide-out Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-[400px] sm:w-[540px]"
          style={{ zIndex: 10000 }}
        >
          <SheetHeader>
            <SheetTitle>
              {currentAmbulance ? "Edit Ambulance" : "Add New Ambulance"}
            </SheetTitle>
          </SheetHeader>
          <AmbulanceForm
            ambulance={currentAmbulance}
            onSave={handleSaveAmbulance}
            onSearchPlace={handleSearchPlace}
          />
          {isAdmin && currentAmbulance?._id && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              {currentAmbulance.team?.length ? (
                <ul className="mb-4">
                  {currentAmbulance.team.map((n) => (
                    <li key={n._id} className="flex items-center">
                      <span>
                        {n.username} ({n.email})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No team members yet.</p>
              )}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  className="border rounded p-1 flex-1"
                >
                  <option value="">Select Nurse to add</option>
                  {nurses
                    .filter(
                      (n) =>
                        !currentAmbulance.team?.find((m) => m._id === n._id)
                    )
                    .map((n) => (
                      <option key={n._id} value={n._id}>
                        {n.username} ({n.email})
                      </option>
                    ))}
                </select>
                <Button onClick={handleAddTeamMember}>Add Nurse</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AmbulanceDashboard;
